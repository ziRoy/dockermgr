import { Meteor } from 'meteor/meteor';
import { Config } from './config';

Meteor.methods( {
	'config.setRegistry'( host, port )
	{
		Config.upsert( { k: 'registryHost' }, { k: 'registryHost', v: host } );
		Config.upsert( { k: 'registryPort' }, { k: 'registryPort', v: port } );

		return 0;
	},

	'config.getRegistry'()
	{
		return {
			host: Config.findOne( { k: 'registryHost' } ).v,
			port: Config.findOne( { k: 'registryPort' } ).v
		};
	}
} );