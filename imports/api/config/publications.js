import { Meteor } from 'meteor/meteor';
import { Config } from './config';

Meteor.publish( 'config.public', function () {
	return Config.find( {} );
} );