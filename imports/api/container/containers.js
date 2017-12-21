import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Containers = Meteor.isClient ? new Mongo.Collection( 'containers' ) : 'containers';