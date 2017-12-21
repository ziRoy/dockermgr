import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import routes from '../imports/startup/client/routes';
import injectTapEventPlugin from 'react-tap-event-plugin';

import socketClient from '/imports/startup/client/socket-client';

Meteor.startup( () => {
	socketClient.init();

	injectTapEventPlugin();
	render( routes(), document.getElementById( 'app' ) );
} );