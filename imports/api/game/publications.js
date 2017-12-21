import { Meteor } from 'meteor/meteor';
import { Games, Builds } from './games';

Meteor.publish( 'games.public', function ( network ) {

	if ( network == 'local' )
	{
		return Games.find( { local: true } );
	}
	else if ( network == 'internet' )
	{
		return Games.find( { local: false } );
	}

	return this.ready();
} );

Meteor.publish( 'builds.public', function () {
	return Builds.find( {} );
} );