import { Meteor } from 'meteor/meteor';
import { Hosts } from './hosts';

//return Lists.find( {
//	userId : this.userId,
//}, {
//	fields : Lists.publicFields,
//} );

Meteor.publish( 'hosts.public', function () {
	return Hosts.find( {} );
} );