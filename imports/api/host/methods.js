import { Meteor } from 'meteor/meteor';
//import { ValidatedMethod } from 'meteor/mdg:validated-method';
//import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Docker from 'dockerode';

import { Hosts } from '/imports/api/host/hosts';

Meteor.methods( {

	'hosts.addHost'( ip, port, local )
	{
		if ( Hosts.findOne( { ip, port } ) != null )
		{
			throw new Meteor.Error( 'addHost', `host "${ip}:${port}" already exists` );
		}

		var docker = new Docker( { host: ip, port: port } );
		var info   = null;
		try
		{
			info = Meteor.wrapAsync( docker.info, docker )();
		}
		catch ( e )
		{
			throw new Meteor.Error( 'addHost', `cannot get docker info of host "${ip}:${port}"` );
		}

		var doc = {
			ip,
			port,
			local,
			Name           : info.Name,
			KernelVersion  : info.KernelVersion,
			MemTotal       : info.MemTotal,
			NCPU           : info.NCPU,
			OperatingSystem: info.OperatingSystem,
			SystemTime     : info.SystemTime,
			ServerVersion  : info.ServerVersion
		};
		return Hosts.insert( doc );
	}
} );
