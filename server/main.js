import { Meteor } from 'meteor/meteor';

import '../imports/startup/server/api';
import socketServer from '../imports/startup/server/socket-server';

Meteor.startup( () => {

	socketServer.init();

} );
