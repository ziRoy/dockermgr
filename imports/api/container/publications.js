import { Meteor } from 'meteor/meteor';
import { Hosts } from '../host/hosts';
import Docker from 'dockerode';

import { VirtualCollection } from '../Tools';
import { Containers } from './containers';

function formatContainerInfo( hostId, info )
{
	return {
		hostId,
		Id             : info.Id.substr( 0, 12 ),
		Name           : info.Name.substr( 1 ),
		Cmd            : info.Config.Cmd ? info.Config.Cmd.join( ' ' ) : '',
		Env            : info.Config.Env,
		Image          : info.Config.Image,
		Created        : info.Created,
		State          : info.State,
		Mounts         : info.Mounts,
		NetworkSettings: info.NetworkSettings
	};
}

Meteor.publish( 'containersOfHost', function ( hostId )
{
	var host = Hosts.findOne( hostId );
	if ( host == null )
	{
		console.log( `host "${hostId}" not found when subscribe` );
		return this.ready();
	}
	var vc         = new VirtualCollection( this, Containers );
	var docker     = new Docker( { host: host.ip, port: host.port } );
	var containers = Meteor.wrapAsync( docker.listContainers, docker )( { all: 1 } );

	var updateContainer = ( id ) => {
		var container = docker.getContainer( id );
		var detail    = null;
		try
		{
			detail = Meteor.wrapAsync( container.inspect, container )();
		}
		catch ( e )
		{
			vc.remove( id );
		}
		if ( detail )
		{
			vc.upsert( id, formatContainerInfo( hostId, detail ) );
		}
	};

	containers.forEach( c => {
		updateContainer( c.Id );
	} );

	console.log( `start listening event of host "${hostId}"` );
	var stream = Meteor.wrapAsync( docker.getEvents, docker )( {
		filters: JSON.stringify( { type: [ 'container' ] } )
	} );
	stream.on( 'data', Meteor.bindEnvironment( ( data ) => {

		var evt = JSON.parse( data.toString( 'utf8' ) );
		console.log( `receive docker event "${evt.Type}, action=${evt.Action}, actor=${evt.Actor.ID}` );
		updateContainer( evt.Actor.ID );

	} ) );

	stream.on( 'close', () => {
		console.log( `!!! stop listening event of host "${hostId}"` );
		//this.error( 'docker event stream closed' );
	} );

	this.onStop( () => {
		console.log( `stop listening event of host "${hostId}"` );
		stream.destroy();
	} );

	this.ready();
} );