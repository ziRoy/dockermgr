import { Meteor } from 'meteor/meteor';

class SocketClient {

	constructor()
	{
		this.listener = [];
	}

	trigger( type, data )
	{
		this.listener.forEach( l => {
			if ( l.type == type ) l.cb.call( null, data );
		} );
	}

	init()
	{
		Meteor.default_connection._stream.on( 'message', ( rawData ) => {

			var pck = JSON.parse( rawData );
			if ( pck.msg == '$custom$' )
			{
				this.trigger( pck.close ? 'close' : 'data', pck.data );
			}
		} );

		Meteor.default_connection._stream.on( 'disconnect', () => {
			// If it was previously connected, call disconnect handlers
			if ( Meteor.default_connection._stream.status().connected )
			{
				this.trigger( 'close' );
			}
		} );

		Meteor._debug = (function ( super_meteor_debug ) {
			return function ( error, info ) {
				if ( info && info.msg == '$custom$' )
				{
					// prevent from console debugging
				}
				else
				{
					super_meteor_debug( error, info );
				}
			}
		})( Meteor._debug );
	}

	attach( type, onEvent )
	{
		this.listener.push( { type: type, cb: onEvent } );
		console.log( 'attach', this.listener );
	}

	detach( type, onEvent )
	{
		this.listener = this.listener.filter( l => l.type != type || l.cb != onEvent );
		console.log( 'detach', this.listener );
	}

	send( data )
	{
		Meteor.default_connection._stream.send( JSON.stringify( { msg: '$custom$', data: data } ) );
	}

	close( removeAllListener = true )
	{
		Meteor.default_connection._stream.send( JSON.stringify( { msg: '$custom$', close: true } ) );
		if ( removeAllListener )
		{
			this.listener = [];
		}
		console.log( 'close' );
	}
}

export default new SocketClient;
