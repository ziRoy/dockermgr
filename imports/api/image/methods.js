import { Meteor } from 'meteor/meteor';
import { Hosts } from '/imports/api/host/hosts';
import Docker from 'dockerode';
import dockerMgr from '/imports/api/DockerMgr';
import sockerServer from '/imports/startup/server/socket-server';

Meteor.methods( {
	'image.fetch'( hostId )
	{
		var docker = dockerMgr.getDocker( hostId );
		var list   = Meteor.wrapAsync( docker.listImages, docker )();

		return list;
	},

	'image.inspect'( hostId, imageName )
	{
		var docker = dockerMgr.getDocker( hostId );
		var image  = docker.getImage( imageName );
		var info   = Meteor.wrapAsync( image.inspect, image )();

		return info;
	},

	'image.pull'( hostId, imageName )
	{
		var id     = this.connection.id;
		var docker = dockerMgr.getDocker( hostId );
		var stream = Meteor.wrapAsync( docker.pull, docker )( imageName, {
			authconfig: {
				username: "docker",
				password: "pass@123"
			}
		} );

		var wait = Meteor.bindEnvironment( ( cb ) => {

			docker.modem.followProgress( stream,
				Meteor.bindEnvironment( ( err, output ) => {
					//console.log( '>>> on finish' );
					sockerServer.send( id, { finish: true, err: err } );
					sockerServer.close( id );
					cb();
				} ),
				Meteor.bindEnvironment( ( evt ) => {
					//console.log( '>>> on progress' );
					sockerServer.send( id, { status: evt.status, progressDetail: evt.progressDetail, id: evt.id } );
				} ) );

			stream.on( 'close', Meteor.bindEnvironment( () => {
				//console.log( '>>> stream close' );
				sockerServer.close( id );
				cb();
			} ) );

			sockerServer.attach( id, 'close', Meteor.bindEnvironment( () => {
				//console.log( '>>> socker close' );
				sockerServer.close( id );
				stream.destroy();
				cb();
			} ) );

		} );

		return Meteor.wrapAsync( wait )();
	}
} );