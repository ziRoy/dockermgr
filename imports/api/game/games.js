import { Mongo } from 'meteor/mongo';

export const Games  = new Mongo.Collection( 'games' );
export const Builds = new Mongo.Collection( 'builds' );