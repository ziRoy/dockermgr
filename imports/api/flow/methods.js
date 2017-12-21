import { Meteor } from 'meteor/meteor';
import { Flows, FlowLog, Progress } from './flows';
import dockerMgr from '/imports/api/DockerMgr';
import tar        from 'tar-stream';

Meteor.methods( {

	'flow.build'( { flowId, hostId, logId, env } )
	{
		var flow = Flows.findOne( flowId );
		if ( !flow )
		{
			throw new Meteor.Error( 'flowBuild', `flow "${flowId}" not found` );
		}
		console.log( `build "${flow.name}" with image "${flow.image}" and env ${JSON.stringify( env )}` );
		FlowLog.insert( { _id: logId, flowId: flowId, progress: Progress.INIT } );

		var docker    = dockerMgr.getDocker( hostId );
		var container = Meteor.wrapAsync( docker.createContainer, docker )( {
			Image: flow.name,
			Tty  : true,
			Env  : Object.keys( env ).map( k => `${k}=${env[ k ]}` )
		} );
		FlowLog.update( logId,
			{ $set: { hostId: hostId, containerId: container.id, progress: Progress.CONTAINER_CREATED } } );

		Meteor.wrapAsync( container.start, container )();
		const exitCode = Meteor.wrapAsync( container.wait, container )().StatusCode;
		FlowLog.update( logId, { $set: { buildRes: exitCode, progress: Progress.BUILD_COMPLETE } } );

		if ( exitCode != 0 )
		{
			throw new Meteor.Error( 'flowBuild', `build failed with code ${exitCode}` );
		}
		console.log( `build "${flow.name} complete` );
	},

	'flow.package'( {logId, target} )
	{
		var log = FlowLog.findOne( logId );
		if ( !log )
		{
			throw new Meteor.Error( 'flowPackage', `log "${logId}" not found` );
		}
		var flow = Flows.findOne( log.flowId );
		if ( !flow )
		{
			throw new Meteor.Error( 'flowPackage', `flow "${log.flowId}" not found` );
		}
		if ( log.progress != Progress.BUILD_COMPLETE || log.buildRes != 0 )
		{
			throw new Meteor.Error( 'flowPackage', `build not prepared` );
		}
		var docker        = dockerMgr.getDocker( log.hostId );
		var container     = docker.getContainer( log.containerId );
		var archiveStream = Meteor.wrapAsync( container.getArchive, container )( { path: flow.package.archivePath } );

		var extract  = tar.extract();
		var pack     = tar.pack();
		var auth     = {
			username: "docker",
			password: "pass@123"
		};
		var registry = {
			'docker-repo.gamed9.com': auth
		};

		pack.entry( { name: 'Dockerfile' }, Assets.getText( `${flow.name}/${target}/Dockerfile` ) );
		extract.on( 'entry', function ( header, stream, callback ) {
			console.log( header.name );
			stream.pipe( pack.entry( header, callback ) );
		} );
		extract.on( 'finish', Meteor.bindEnvironment( () => {
			pack.finalize();
			FlowLog.update( logId, { $set: { progress: Progress.ARCHIVE_COMPLETE } } );
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
		console.log( 'build end' );
		Builds.update( buildId, { $set: { progress: 6 } } );

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
		console.log( 'push finish' );
		Builds.update( buildId, { $set: { progress: 7 } } );

	}

} );