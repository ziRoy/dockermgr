import { Meteor } from 'meteor/meteor';
import sockerServer from '/imports/startup/server/socket-server';
import Docker from 'dockerode';
import dockerMgr from '/imports/api/DockerMgr';
import { Hosts } from '/imports/api/host/hosts';
import { Transform } from 'stream';

function bindStreamSocket( stream, sid, oriSteam )
{
	if ( !oriSteam ) oriSteam = stream;

	stream.setEncoding( 'utf8' );
	stream.on( 'data', Meteor.bindEnvironment( ( data ) => {
		// hack: js not support reg 'look behind'
		data = data.replace( /(\r)?\n/g, ( $0, $1 ) => $1 ? $0 : '\r\n' );
		sockerServer.send( sid, data );
	} ) );
	stream.on( 'close', Meteor.bindEnvironment( () => sockerServer.close( sid ) ) );
	sockerServer.attach( sid, 'data', Meteor.bindEnvironment( ( data ) => stream.write( data ) ) );
	sockerServer.attach( sid, 'close', Meteor.bindEnvironment( () => {
		sockerServer.close( sid );
		if ( oriSteam.end ) oriSteam.end();
		if ( oriSteam.destroy ) oriSteam.destroy();
	} ) );
}

function getTransform()
{
	var tran        = new Transform();
	tran._transform = function ( chunk, encoding, next ) {
		next( null, chunk );
	};
	tran._flush     = function ( done ) {
		done();
	};
	tran.setEncoding( 'utf8' );
	return tran;
}

Meteor.methods( {

	'containers.exec'( { op, w, h, hostId, containerId } )
	{
		this.unblock();

		var execOpts  = {
			Cmd         : [ 'bash' ],
			AttachStdin : true,
			AttachStdout: true,
			AttachStderr: true,
			DetachKeys  : "ctrl-p",
			Tty         : true
		};
		var startOpts = {
			hijack: true,
			stdin : true,
			Detach: false,
			Tty   : true
		};

		var docker = dockerMgr.getDocker( hostId );
		var id     = this.connection.id;

		try
		{
			var container = docker.getContainer( containerId );
			var exec      = Meteor.wrapAsync( container.exec, container )( execOpts );
			var stream    = Meteor.wrapAsync( exec.start, exec )( startOpts );
			Meteor.wrapAsync( exec.resize, exec )( { w, h } );

			bindStreamSocket( stream, id );
		}
		catch ( ex )
		{
			console.log( 'error:', ex );
			sockerServer.close( id );
		}
	},
	'containers.attach'( {hostId, containerId} )
	{
		this.unblock();

		var attachOpts = {
			hijack    : true,
			stdin     : true,
			DetachKeys: "ctrl-p",
			//logs      : true,
			stream    : true,
			stdout    : true,
			stderr    : true
		};

		var docker = dockerMgr.getDocker( hostId );
		var id     = this.connection.id;

		try
		{
			var container = docker.getContainer( containerId );
			var info      = Meteor.wrapAsync( container.inspect, container )();
			var stream    = Meteor.wrapAsync( container.attach, container )( attachOpts );

			if ( info.Config.Tty )
			{
				console.log( 'tty=true' );
				bindStreamSocket( stream, id );
			}
			else
			{
				console.log( 'tty=false' );

				var tran = getTransform();
				container.modem.demuxStream( stream, tran, tran );
				bindStreamSocket( tran, id, stream );
			}
		}
		catch ( ex )
		{
			console.log( 'error:', ex );
			sockerServer.close( id );
		}
	},

	'containers.create'( hostId, args )
	{
		if ( !args.image )
		{
			throw new Meteor.Error( 'create', 'image missing' );
		}
		var docker = dockerMgr.getDocker( hostId );
		var param  = {};
		// image
		param.Image = args.image;
		// name
		if ( args.name ) param.name = args.name;
		// tty
		param.Tty = true;
		// env
		if ( args.env )
		{
			param.Env = [];
			for ( let k in args.env )
			{
				param.Env.push( `${k}=${args.env[ k ]}` );
			}
		}
		// volumes
		param.Volumes = {};
		if ( args.volumes )
		{
			args.volumes.forEach( v => {
				param.Volumes[ v ] = {};
			} );
		}

		param.HostConfig = {};
		// volume from
		param.HostConfig.VolumesFrom = [];
		if ( args.volumeFrom )
		{
			param.HostConfig.VolumesFrom.push( `${args.volumeFrom}:rw` );
		}

		// port
		param.HostConfig.PortBindings = {};
		if ( args.ports )
		{
			for ( let k in args.ports )
			{
				param.HostConfig.PortBindings[ k ] = [ { HostPort: args.ports[ k ] } ];
			}
		}
		console.log( param );

		var container = Meteor.wrapAsync( docker.createContainer, docker )( param );

		if ( args.start )
		{
			Meteor.wrapAsync( container.start, container )();
		}

		//var container = Meteor.wrapAsync( docker.createContainer, docker )( {
		//	name      : 'gs',
		//	Image     : 'zmj/hp-game',
		//	Tty       : true,
		//	"Env"     : [
		//		'SERVER_ID=121',
		//		'LISTEN_PORT=5555',
		//		'BIND_IP=172.16.1.188',
		//		'LOCAL_IP=172.16.1.188',
		//		'CENTER_DB=172.16.0.77\'3306\'hero_db\'123456\'dw_login',
		//		'WORLD_DB=172.16.1.188\'3307\'root\'mysql@ime\'hp_world',
		//		'CLIENT_CPP=0.0.1'
		//	],
		//	HostConfig: {
		//		VolumesFrom : [ 'ws:rw' ],
		//		PortBindings: { "5555/tcp": [ { "HostPort": "5666" } ] }
		//	}
		//} );
	},

	'containers.start'( hostId, containerId )
	{
		this.unblock();
		var docker    = dockerMgr.getDocker( hostId );
		var container = docker.getContainer( containerId );
		var res       = Meteor.wrapAsync( container.start, container )();

		return res;
	},

	'containers.wait'( hostId, containerId )
	{
		this.unblock();
		var docker    = dockerMgr.getDocker( hostId );
		var container = docker.getContainer( containerId );
		var res       = Meteor.wrapAsync( container.wait, container )();
		return res.StatusCode;
	},

	'containers.stop'( hostId, containerId )
	{
		this.unblock();

		var docker    = dockerMgr.getDocker( hostId );
		var container = docker.getContainer( containerId );
		try
		{
			return Meteor.wrapAsync( container.stop, container )( { t: 10 } );
		}
		catch ( e )
		{
			console.log( e );
			return 0;
		}
	},

	'containers.remove'( hostId, containerId, delVol )
	{
		this.unblock();

		var docker    = dockerMgr.getDocker( hostId );
		var container = docker.getContainer( containerId );
		var res       = Meteor.wrapAsync( container.remove, container )( { v: delVol } );

		return res;
	},

	'containers.log'( {hostId, containerId} )
	{
		this.unblock();
		var logOpts = { follow: true, stdout: true, stderr: true, tail: 200 };

		var docker = dockerMgr.getDocker( hostId );
		var id     = this.connection.id;

		try
		{
			var container = docker.getContainer( containerId );
			var info      = Meteor.wrapAsync( container.inspect, container )();
			var stream    = Meteor.wrapAsync( container.logs, container )( logOpts );

			if ( info.Config.Tty )
			{
				console.log( 'tty=true' );
				bindStreamSocket( stream, id );
			}
			else
			{
				console.log( 'tty=false' );
				var tran = getTransform();
				container.modem.demuxStream( stream, tran, tran );
				bindStreamSocket( tran, id, stream );
			}
		}
		catch ( ex )
		{
			console.log( 'error:', ex );
			sockerServer.close( id );
		}
	}
} );