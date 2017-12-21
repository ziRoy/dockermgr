import { Mongo } from 'meteor/mongo';

export const Flows   = new Mongo.Collection( 'flows' );
export const FlowLog = new Mongo.Collection( 'flow_log' );

export const Progress = {
	INIT             : 1,
	CONTAINER_CREATED: 2,
	BUILD_COMPLETE   : 3,
	ARCHIVE_COMPLETE : 4,

};