//import { Meteor } from 'meteor/meteor';
//import Docker from 'dockerode';
//import dockerMgr from '/imports/api/DockerMgr';
//import { Games, Builds } from './games';
//
//const REG = 'zmj';
////reg.local:5000
//const IMG_HP_BASE  = `${REG}/hp-base`;
//const IMG_HP_SVN   = `${REG}/hp-svn`;
//const IMG_HP_BUILD = `${REG}/hp-build`;
//const IMG_HP_DB    = `${REG}/hp-db`;
//const IMG_HP_LOGIN = `${REG}/hp-login`;
//const IMG_HP_GAME  = `${REG}/hp-game`;
//
//const DB_PORT_RANGE    = [ 4000, 4999 ];
//const LOGIN_PORT_RANGE = [ 7000, 7999 ];
//const GAME_PORT_RANGE  = [ 5000, 5999 ];
//
//function nextPort( selector, field, range )
//{
//	var hash        = new Set();
//	var fields      = {};
//	fields[ field ] = 1;
//	Games.find( selector, { fields } ).forEach( ( doc ) => {
//		if ( doc[ field ] ) hash.add( doc[ field ] );
//	} );
//	for ( let p = range[ 0 ]; p <= range[ 1 ]; p++ )
//	{
//		if ( !hash.has( p ) ) return p;
//	}
//	console.log( 'no available port' );
//	return -1;
//}
//
//function nextLoginPort( hostId )
//{
//	return nextPort( { type: 'login', hostId: hostId }, 'serverPort', LOGIN_PORT_RANGE );
//}
//
//function nextGamePort( hostId )
//{
//	return nextPort( { type: 'game', hostId: hostId }, 'serverPort', GAME_PORT_RANGE );
//}
//
//function nextDBPort( hostId )
//{
//	return nextPort( { hostId: hostId }, 'dbPort', DB_PORT_RANGE );
//}
//
//Meteor.methods( {
//
//	'games.createWorkSpace'( hostId, name )
//	{
//		var docker    = dockerMgr.getDocker( hostId );
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name   : name,
//			Image  : IMG_HP_BASE,
//			Volumes: {
//				'/workspace': {}
//			}
//		} );
//		return container.id;
//	},
//
//	'games.svn'( {hostId, name, cnWs, branch, serverVer, resVer} )
//	{
//		var docker    = dockerMgr.getDocker( hostId );
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name      : name,
//			Image     : IMG_HP_SVN,
//			Tty       : true,
//			"Env"     : [
//				'USERNAME=zengmingjun',
//				'PASSWORD=123456',
//				`BRANCH=${branch}`,
//				`SERVER_VER=${serverVer}`,
//				`RES_VER=${resVer}`
//			],
//			HostConfig: {
//				VolumesFrom: [ `${cnWs}:rw` ]
//			}
//		} );
//		Meteor.wrapAsync( container.start, container )();
//		return Meteor.wrapAsync( container.wait, container )().StatusCode;
//	},
//
//	'games.make'( {hostId, name, cnWs, serverType} )
//	{
//		var docker    = dockerMgr.getDocker( hostId );
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name      : name,
//			Image     : IMG_HP_BUILD,
//			Tty       : true,
//			Env       : [
//				`SERVER=${serverType}`
//			],
//			HostConfig: {
//				VolumesFrom: [ `${cnWs}:rw` ]
//			}
//		} );
//		Meteor.wrapAsync( container.start, container )();
//		return Meteor.wrapAsync( container.wait, container )().StatusCode;
//	},
//
//	'games.createDBData'( { hostId, name, image } )
//	{
//		var docker    = dockerMgr.getDocker( hostId );
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name   : name,
//			Image  : image ? image : IMG_HP_DB,
//			Volumes: {
//				'/var/lib/mysql': {},
//				'/var/log/mysql': {}
//			}
//		} );
//	},
//
//	'games.db'( { hostId, name, cnData, database, port, image } )
//	{
//		var docker    = dockerMgr.getDocker( hostId );
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name      : name,
//			Image     : image ? image : IMG_HP_DB,
//			Tty       : true,
//			Env       : [
//				'MYSQL_ROOT_PASSWORD=mysql@ime',
//				`MYSQL_DATABASE=${database}`
//			],
//			HostConfig: {
//				Binds       : [ '/etc/localtime:/etc/localtime:ro' ],
//				VolumesFrom : [ `${cnData}:rw` ],
//				PortBindings: { "3306/tcp": [ { "HostPort": port.toString() } ] }
//			}
//		} );
//		Meteor.wrapAsync( container.start, container )();
//	},
//
//	'games.runLogin'( {
//		name,
//		cnWs,
//		serverId,
//		loginHostId,
//		loginPort,
//		loginDBPort,
//		image
//		} )
//	{
//		var docker    = dockerMgr.getDocker( loginHostId );
//		var loginHost = docker.modem.host;
//
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name      : name,
//			Image     : image ? image : IMG_HP_LOGIN,
//			Tty       : true,
//			Env       : [
//				`SERVER_ID=${serverId}`,
//				`CENTER_DB=${loginHost}'${loginDBPort}'root'mysql@ime'hp_login`
//			],
//			HostConfig: {
//				Binds       : [ '/etc/localtime:/etc/localtime:ro' ],
//				VolumesFrom : cnWs ? [ `${cnWs}:rw` ] : undefined,
//				PortBindings: { "7777/tcp": [ { "HostPort": loginPort.toString() } ] }
//			}
//		} );
//		Meteor.wrapAsync( container.start, container )();
//	},
//
//	'games.runGame'( {
//		name,
//		cnWs,
//		serverId,
//		gameHostId,
//		gamePort,
//		gameDBPort,
//		loginHostId,
//		loginDBPort,
//		version,
//		image
//		} )
//	{
//		var docker      = dockerMgr.getDocker( gameHostId );
//		var loginDocker = dockerMgr.getDocker( loginHostId );
//
//		var gameHost  = docker.modem.host;
//		var loginHost = loginDocker.modem.host;
//
//		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
//			name      : name,
//			Image     : image ? image : IMG_HP_GAME,
//			Tty       : true,
//			Env       : [
//				`SERVER_ID=${serverId}`,
//				`PUBLIC_HOST=${gameHost}`,
//				`PUBLIC_PORT=${gamePort}`,
//				`LOCAL_IP=${gameHost}`,
//				`CENTER_DB=${loginHost}'${loginDBPort}'root'mysql@ime'hp_login`,
//				`WORLD_DB=${gameHost}'${gameDBPort}'root'mysql@ime'hp_world`,
//				`CLIENT_CPP=${version}`
//			],
//			HostConfig: {
//				Binds       : [ '/etc/localtime:/etc/localtime:ro' ],
//				VolumesFrom : cnWs ? [ `${cnWs}:rw` ] : undefined,
//				PortBindings: { "5555/tcp": [ { "HostPort": gamePort.toString() } ] }
//			}
//		} );
//
//		Meteor.wrapAsync( container.start, container )();
//	},
//
//	'games.createLogin'( hostId, loginServerId, branch )
//	{
//		this.unblock();
//		var selector = { local: true, type: 'login', id: loginServerId };
//
//		// check duplication
//		if ( Games.find( selector ).count() > 0 )
//		{
//			throw new Meteor.Error( 'createLogin', `login server "${loginServerId}" already exists` );
//		}
//		// insert
//		Games.insert( Object.assign( {}, selector, { hostId, progress: 1 } ) );
//
//		// container names
//		const cnWs     = `login_${loginServerId}_ws`,
//			  cnSvn    = `login_${loginServerId}_svn`,
//			  cnMake   = `login_${loginServerId}_make`,
//			  cnDBData = `login_${loginServerId}_db_data`,
//			  cnDB     = `login_${loginServerId}_db`,
//			  cnLogin  = `login_${loginServerId}_server`;
//
//		const dbPort     = nextDBPort( hostId ),
//			  serverPort = nextLoginPort( hostId );
//
//		if ( dbPort == -1 || serverPort == -1 )
//		{
//			throw new Meteor.Error( 'createLogin', `port not available, db=${dbPort}, server=${serverPort}` );
//		}
//		Games.update( selector, { $set: { dbPort: dbPort, serverPort: serverPort } } );
//
//		// create containers
//		Meteor.call( 'games.createDBData', { hostId, name: cnDBData } );
//		Games.update( selector, { $set: { progress: 2 } } );
//
//		Meteor.call( 'games.db', { hostId, name: cnDB, cnData: cnDBData, database: 'hp_login', port: dbPort } );
//		Games.update( selector, { $set: { progress: 3 } } );
//
//		Meteor.call( 'games.createWorkSpace', hostId, cnWs );
//		Games.update( selector, { $set: { progress: 4 } } );
//
//		if ( Meteor.call( 'games.svn', {
//				hostId   : hostId,
//				name     : cnSvn,
//				cnWs     : cnWs,
//				branch   : branch,
//				serverVer: 'HEAD',
//				resVer   : 'HEAD'
//			} ) != 0 )
//		{
//			throw new Meteor.Error( 'createLogin', 'svn export failed' );
//		}
//		Games.update( selector, { $set: { progress: 5 } } );
//
//		if ( Meteor.call( 'games.make', {
//				hostId    : hostId,
//				name      : cnMake,
//				cnWs      : cnWs,
//				serverType: 'loginserver'
//			} ) != 0 )
//		{
//			throw new Meteor.Error( 'createLogin', 'make failed' );
//		}
//		Games.update( selector, { $set: { progress: 6 } } );
//
//		Meteor.call( 'games.runLogin', {
//			name       : cnLogin,
//			cnWs       : cnWs,
//			serverId   : loginServerId,
//			loginHostId: hostId,
//			loginPort  : serverPort,
//			loginDBPort: dbPort
//		} );
//		Games.update( selector, { $set: { progress: 7 } } );
//	},
//
//	'games.createGame'( hostId, gameServerId, loginServerId, branch )
//	{
//		this.unblock();
//		var selector = { local: true, type: 'game', id: gameServerId };
//
//		// check duplication
//		if ( Games.find( selector ).count() > 0 )
//		{
//			throw new Meteor.Error( 'createGame', `game server "${gameServerId}" already exists` );
//		}
//		var loginServer = Games.findOne( { local: true, type: 'login', id: loginServerId } );
//		if ( !loginServer || !loginServer.dbPort )
//		{
//			throw new Meteor.Error( 'createGame', `login server not exists` );
//		}
//
//		// insert
//		Games.insert( Object.assign( {}, selector, { hostId, progress: 1 } ) );
//
//		// container names
//		const cnWs     = `game_${gameServerId}_ws`,
//			  cnSvn    = `game_${gameServerId}_svn`,
//			  cnMake   = `game_${gameServerId}_make`,
//			  cnDBData = `game_${gameServerId}_db_data`,
//			  cnDB     = `game_${gameServerId}_db`,
//			  cnGame   = `game_${gameServerId}_server`;
//
//		const dbPort     = nextDBPort( hostId ),
//			  serverPort = nextGamePort( hostId );
//
//		if ( dbPort == -1 || serverPort == -1 )
//		{
//			throw new Meteor.Error( 'createGame', `port not available, db=${dbPort}, server=${serverPort}` );
//		}
//		Games.update( selector, { $set: { dbPort: dbPort, serverPort: serverPort } } );
//
//		// create containers
//		Meteor.call( 'games.createDBData', { hostId, name: cnDBData } );
//		Games.update( selector, { $set: { progress: 2 } } );
//
//		Meteor.call( 'games.db', { hostId, name: cnDB, cnData: cnDBData, database: 'hp_world', port: dbPort } );
//		Games.update( selector, { $set: { progress: 3 } } );
//
//		Meteor.call( 'games.createWorkSpace', hostId, cnWs );
//		Games.update( selector, { $set: { progress: 4 } } );
//
//		if ( Meteor.call( 'games.svn', {
//				hostId   : hostId,
//				name     : cnSvn,
//				cnWs     : cnWs,
//				branch   : branch,
//				serverVer: 'HEAD',
//				resVer   : 'HEAD'
//			} ) != 0 )
//		{
//			throw new Meteor.Error( 'createGame', 'svn export failed' );
//		}
//		Games.update( selector, { $set: { progress: 5 } } );
//
//		if ( Meteor.call( 'games.make', {
//				hostId    : hostId,
//				name      : cnMake,
//				cnWs      : cnWs,
//				serverType: 'gameserver'
//			} ) != 0 )
//		{
//			throw new Meteor.Error( 'createGame', 'make failed' );
//		}
//		Games.update( selector, { $set: { progress: 6 } } );
//
//		Meteor.call( 'games.runGame', {
//			name       : cnGame,
//			cnWs       : cnWs,
//			serverId   : gameServerId,
//			gameHostId : hostId,
//			gamePort   : serverPort,
//			gameDBPort : dbPort,
//			loginHostId: loginServer.hostId,
//			loginDBPort: loginServer.dbPort,
//			version    : '0.0.1'
//		} );
//		Games.update( selector, { $set: { progress: 7 } } );
//	},
//
//	'games.update'( id )
//	{
//		var server = Games.findOne( id );
//		if ( !server )
//		{
//			throw new Meteor.Error( 'update', `server "${id}" not found` );
//		}
//		const cnSvn  = `${server.type}_${server.id}_svn`,
//			  cnMake = `${server.type}_${server.id}_make`,
//			  cnGame = `${server.type}_${server.id}_server`;
//
//		Games.update( id, { $set: { updateProgress: 0 } } );
//		Meteor.call( 'containers.stop', server.hostId, cnGame );
//		Meteor.call( 'containers.wait', server.hostId, cnGame );
//
//		Games.update( id, { $set: { updateProgress: 1 } } );
//		Meteor.call( 'containers.start', server.hostId, cnSvn );
//		Meteor.call( 'containers.wait', server.hostId, cnSvn );
//
//		Games.update( id, { $set: { updateProgress: 2 } } );
//		Meteor.call( 'containers.start', server.hostId, cnMake );
//		Meteor.call( 'containers.wait', server.hostId, cnMake );
//
//		Games.update( id, { $set: { updateProgress: 3 } } );
//		Meteor.call( 'containers.start', server.hostId, cnGame );
//
//		Games.update( id, { $set: { updateProgress: 4 } } );
//	},
//
//	'games.remove'( id )
//	{
//		Games.remove( id );
//	},
//} );
//
