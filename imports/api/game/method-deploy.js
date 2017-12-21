import { Meteor } from 'meteor/meteor';
import Docker from 'dockerode';
import dockerMgr from '/imports/api/DockerMgr';
import { Games, Builds } from './games';
import { Hosts } from '/imports/api/host/hosts';

import net        from 'net';
import fs        from 'fs';
import path    from 'path';
import shell    from 'shelljs';
import tar        from 'tar-stream';
import { parseString } from 'xml2js';

//function waitForPort( host, port, cb )
//{
//	console.log( 'wait for port', host, port );
//	const client = net.connect( { host, port }, () => {
//		console.log( 'port available' );
//		client.end();
//		cb( null, 0 );
//	} );
//	client.setTimeout( 1000, () => {
//		console.log( 'continue waiting' );
//		client.end();
//		cb( null, -1 );
//	} );
//	client.on( 'error', ( err ) => {
//		console.log( 'continue waiting' );
//		setTimeout( () => {
//			cb( null, -2 );
//		}, 1000 );
//	} );
//};

Meteor.methods( {
	'games.getBranchList'()
	{
		shell.config.silent = true;
		var xml             = shell.exec( `svn list http://172.16.0.3/repository/water_server/branches --xml` );
		var res             = Meteor.wrapAsync( parseString )( xml );

		return [ 'trunk' ].concat( ( res.lists.list[ 0 ].entry || [] ).map( e => {
			return `branches/${e.name[ 0 ]}`;
		} ) );
	},

	'games.getLatestVersion'( repo, branch )
	{
		shell.config.silent = true;
		var xml             = shell.exec( `svn log http://172.16.0.3/repository/${repo}/${branch} --xml -l 1` );
		var res             = Meteor.wrapAsync( parseString )( xml );

		return res.log.logentry[ 0 ].$.revision;
	},

	'games.createBuild'()
	{
		return Builds.insert( { progress: 1 } );
	},

	'games.buildImage'( buildId, hostId, branch, serverType, serverVer, resVer )
	{
		var imageName;
		if ( serverType == 'gameserver' )
		{
			imageName = `docker-repo.gamed9.com/hp/game:${branch}.${serverVer}.${resVer}`;
		}
		else if ( serverType == 'loginserver' )
		{
			imageName = `docker-repo.gamed9.com/hp/login:${branch}.${serverVer}`;
		}
		else
		{
			throw new Meteor.Error( 'buildImage', `invalid server type "${serverType}"` );
		}

		console.log( 'build image', imageName );

		var docker    = dockerMgr.getDocker( hostId );
		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
			Image: 'docker-repo.gamed9.com/hp/build',
			Tty  : true,
			Env  : [
				`SERVER_TYPE=${serverType}`,
				`BRANCH=${branch}`,
				`SERVER_VER=${serverVer}`,
				`RES_VER=${resVer}`
			]
		} );
		Builds.update( buildId, { $set: { hostId: hostId, containerId: container.id, progress: 2 } } );

		Meteor.wrapAsync( container.start, container )();
		var buildRes = Meteor.wrapAsync( container.wait, container )().StatusCode;
		Builds.update( buildId, { $set: { res: buildRes, progress: 3 } } );

		if ( buildRes != 0 )
		{
			throw new Meteor.Error( 'buildImage', 'svn export failed' );
		}

		var archiveStream = Meteor.wrapAsync( container.getArchive, container )( { path: '/workspace' } );
		var extract       = tar.extract();
		var pack          = tar.pack();
		var auth          = {
			username: "docker",
			password: "pass@123"
		};
		var registry      = {
			'docker-repo.gamed9.com': auth
		};

		pack.entry( { name: 'Dockerfile' }, Assets.getText( `hp/${serverType}/Dockerfile` ) );
		extract.on( 'entry', function ( header, stream, callback ) {
			console.log( header.name );
			stream.pipe( pack.entry( header, callback ) );
		} );
		extract.on( 'finish', Meteor.bindEnvironment( () => {
			pack.finalize();
			Builds.update( buildId, { $set: { progress: 4 } } );
		} ) );
		archiveStream.pipe( extract );

		function build( cb )
		{
			var output = Meteor.wrapAsync( docker.buildImage, docker )( pack, {
				t             : imageName,
				registryconfig: registry
			} );
			output.pipe( process.stdout );
			output.on( 'end', () => {
				cb( null );
			} );
		}

		Meteor.wrapAsync( build )();
		Builds.update( buildId, { $set: { progress: 5 } } );

		function push( cb )
		{
			var image      = docker.getImage( imageName );
			var pushStream = Meteor.wrapAsync( image.push, image )( {
				authconfig: auth
			} );

			docker.modem.followProgress( pushStream,
				() => {
					cb( null );
				},
				( evt ) => {
					console.log( 'push', evt.id, evt.status, evt.progressDetail );
				}
			);
		}

		Meteor.wrapAsync( push )();
		Builds.update( buildId, { $set: { progress: 6 } } );

		// save to file
		//pack.pipe( fs.createWriteStream( '/tmp/t1/test.tar' ) ).on( 'finish', () => {
		//	console.log( 'finish' );
		//} );
	},

	'games.deployLogin'( { local, hostId, image, serverId, dbPort, serverPort } )
	{
		this.unblock();

		var host = Hosts.findOne( hostId );
		if ( !host )
		{
			throw new Meteor.Error( 'deployLogin', `host "${hostId}" not found` );
		}
		//if ( host.local )
		//{
		//	throw new Meteor.Error( 'deployLogin', `host "${hostId}" is local` );
		//}

		var selector = { local, type: 'login', id: serverId };

		// check duplication
		if ( Games.find( selector ).count() > 0 )
		{
			throw new Meteor.Error( 'deployLogin', `login server "${serverId}" already exists` );
		}

		var dbImages = Meteor.call( 'registry.fetchServerImage', 'db' );
		if ( dbImages.length == 0 )
		{
			throw new Meteor.Error( 'deployLogin', `db image not found` );
		}

		// insert
		var id = Games.insert( Object.assign( {}, selector, { hostId, progress: 2, dbPort, serverPort } ) );

		// container names
		const cnDB    = `login_${serverId}_db`,
			  cnLogin = `login_${serverId}_server`;

		Meteor.call( 'image.pull', hostId, dbImages[ 0 ].v );
		Meteor.call( 'image.pull', hostId, image );
		Meteor.call( 'image.pull', hostId, 'docker-repo.gamed9.com/hp/wait_port' );

		Games.update( selector, { $set: { progress: 3 } } );

		var docker    = dockerMgr.getDocker( hostId );
		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
			name      : cnDB,
			Image     : dbImages[ 0 ].v,
			Tty       : true,
			Env       : [
				'MYSQL_ROOT_PASSWORD=mysql@ime',
				`MYSQL_DATABASE=hp_login`
			],
			Cmd:[
				'--innodb-buffer-pool-size=128M'
			],
			HostConfig: {
				Binds       : [ '/etc/localtime:/etc/localtime:ro' ],
				PortBindings: { "3306/tcp": [ { "HostPort": dbPort.toString() } ] }
			}
		} );
		Meteor.wrapAsync( container.start, container )();
		Games.update( selector, { $set: { progress: 4 } } );

		var wp = Meteor.wrapAsync( docker.createContainer, docker )( {
			Image     : 'docker-repo.gamed9.com/hp/wait_port',
			Tty       : true,
			Env       : [
				'HOST=db',
				'PORT=3306'
			],
			HostConfig: {
				Links: [ `${container.id}:db` ]
			}
		} );
		Meteor.wrapAsync( wp.start, wp )();
		Meteor.wrapAsync( wp.wait, wp )();
		Meteor.wrapAsync( wp.remove, wp )( { v: 1 } );
		Games.update( selector, { $set: { progress: 5 } } );

		var runArgs = {
			hostId: hostId,
			name  : cnLogin,
			image : image,
			env   : {
				SERVER_ID: serverId,
				CENTER_DB: `${docker.modem.host}'${dbPort}'root'mysql@ime'hp_login`
			},
			bind  : [ 7777, serverPort ]
		};
		Games.update( selector, { $set: { runArgs: runArgs } } );

		Meteor.call( 'games.runDeploy', id );
		Games.update( selector, { $set: { progress: 6 } } );
	},

	'games.deployGame'( { local, hostId, image, serverId, serverPort, loginServerId } )
	{
		this.unblock();

		var host = Hosts.findOne( hostId );
		if ( !host )
		{
			throw new Meteor.Error( 'deployGame', `host "${hostId}" not found` );
		}
		//if ( host.local )
		//{
		//	throw new Meteor.Error( 'deployGame', `host "${hostId}" is local` );
		//}

		var selector = { local, type: 'game', id: serverId };

		// check duplication
		if ( Games.find( selector ).count() > 0 )
		{
			throw new Meteor.Error( 'deployGame', `game server "${serverId}" already exists` );
		}

		var login = Games.findOne( { local, type: 'login', id: loginServerId } );
		if ( !login )
		{
			throw new Meteor.Error( 'deployGame', `login server "${loginServerId}" not found` );
		}

		var dbImages = Meteor.call( 'registry.fetchServerImage', 'db' );
		if ( dbImages.length == 0 )
		{
			throw new Meteor.Error( 'deployGame', `db image not found` );
		}

		// insert
		var id = Games.insert( Object.assign( {}, selector, { hostId, progress: 2, serverPort } ) );

		// container names
		const cnDB   = `game_${serverId}_db`,
			  cnGame = `game_${serverId}_server`;

		Meteor.call( 'image.pull', hostId, dbImages[ 0 ].v );
		Meteor.call( 'image.pull', hostId, image );
		Meteor.call( 'image.pull', hostId, 'docker-repo.gamed9.com/hp/wait_port' );

		Games.update( selector, { $set: { progress: 3 } } );

		// create containers
		var docker    = dockerMgr.getDocker( hostId );
		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
			name      : cnDB,
			Image     : dbImages[ 0 ].v,
			Tty       : true,
			Env       : [
				'MYSQL_ROOT_PASSWORD=mysql@ime',
				`MYSQL_DATABASE=hp_world`
			],
			Cmd:[
				'--innodb-buffer-pool-size=128M'
			],
			HostConfig: {
				Binds: [ '/etc/localtime:/etc/localtime:ro' ],
				//PortBindings: { "3306/tcp": [ { "HostPort": dbPort.toString() } ] }
			}
		} );
		Meteor.wrapAsync( container.start, container )();
		Games.update( selector, { $set: { progress: 4 } } );

		var wp = Meteor.wrapAsync( docker.createContainer, docker )( {
			Image     : 'docker-repo.gamed9.com/hp/wait_port',
			Tty       : true,
			Env       : [
				'HOST=db',
				'PORT=3306'
			],
			HostConfig: {
				Links: [ `${container.id}:db` ]
			}
		} );
		Meteor.wrapAsync( wp.start, wp )();
		Meteor.wrapAsync( wp.wait, wp )();
		Meteor.wrapAsync( wp.remove, wp )( { v: 1 } );

		//while ( true )
		//{
		//	if ( Meteor.wrapAsync( waitForPort )( host.ip, 3306 ) == 0 ) break;
		//}
		Games.update( selector, { $set: { progress: 5 } } );

		var gameHost  = docker.modem.host;
		var loginHost = dockerMgr.getDocker( login.hostId ).modem.host;

		var runArgs = {
			hostId: hostId,
			name  : cnGame,
			image : image,
			env   : {
				SERVER_ID  : serverId,
				PUBLIC_HOST: gameHost,
				PUBLIC_PORT: serverPort,
				LOCAL_IP   : gameHost,
				CENTER_DB  : `${loginHost}'${login.dbPort}'root'mysql@ime'hp_login`,
				WORLD_DB   : `db'3306'root'mysql@ime'hp_world`,
				CLIENT_CPP : '0.0.1'
			},
			bind  : [ 5555, serverPort ],
			link  : { db: container.id }
		};
		Games.update( selector, { $set: { runArgs: runArgs } } );

		Meteor.call( 'games.runDeploy', id );
		Games.update( selector, { $set: { progress: 6, image, loginServerId } } );
	},

	'games.runDeploy'( id )
	{
		var server = Games.findOne( id );
		if ( !server || !server.runArgs )
		{
			throw new Meteor.Error( 'runDeploy', `run arguments not found` );
		}
		const args = server.runArgs;

		var docker    = dockerMgr.getDocker( args.hostId );
		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
			name      : args.name,
			Image     : args.image,
			Tty       : true,
			Env       : Object.keys( args.env ).map( k => `${k}=${args.env[ k ]}` ),
			HostConfig: {
				Binds       : [ '/etc/localtime:/etc/localtime:ro' ],
				Links       : args.link ? Object.keys( args.link ).map( k => `${args.link[ k ]}:${k}` ) : undefined,
				PortBindings: args.bind ? {
					[`${args.bind[ 0 ]}/tcp`]: [ { "HostPort": args.bind[ 1 ].toString() } ]
				} : undefined
			}
		} );
		Meteor.wrapAsync( container.start, container )();
	},

	'games.updateDeploy'( id, image )
	{
		var server = Games.findOne( id );
		if ( !server )
		{
			throw new Meteor.Error( 'updateDeploy', `server "${id}" not found` );
		}
		var cnGame = `${server.type}_${server.id}_server`;
		Games.update( id, { $set: { updateProgress: 1 } } );

		Meteor.call( 'containers.stop', server.hostId, cnGame );
		Meteor.call( 'containers.wait', server.hostId, cnGame );
		Meteor.call( 'containers.remove', server.hostId, cnGame, true );
		Games.update( id, { $set: { updateProgress: 2 } } );

		Meteor.call( 'image.pull', server.hostId, image );
		Games.update( id, { $set: { updateProgress: 3, 'runArgs.image': image } } );

		Meteor.call( 'games.runDeploy', id );
		Games.update( id, { $set: { updateProgress: 4 } } );
	}
} );