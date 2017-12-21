import { Meteor } from 'meteor/meteor';
import Docker from 'dockerode';

import { Hosts } from './host/hosts';

class DockerMgr {

	constructor()
	{

	}

	getDocker( hostId )
	{
		var host = Hosts.findOne( hostId );
		if ( !host )
		{
			throw new Meteor.Error( 'exec', `host "${hostId}" not found` );
		}
		return new Docker( { host: host.ip, port: host.port } );
	}
}

export default new DockerMgr();