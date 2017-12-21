import { Meteor } from 'meteor/meteor';
import { Flows } from './flows';

Meteor.publish( 'flows.public', function () {
	return Flows.find({});
} );