import { Meteor } from 'meteor/meteor';
import http from 'http';

class SocketServer {

	constructor()
	{
		this.mapSock     = new Map();
		this.mapListener = new Map();
	}

	trigger( id, type, data )
	{
		var listeners = this.mapListener.get( id );
		if ( listeners )
		{
			listeners.forEach( l => {
				if ( l.type == type ) l.cb.call( null, data );
			} );
		}
	}

	init()
	{
		http.globalAgent.maxSockets = Infinity;
		Meteor.default_server.stream_server.register( ( sock ) => {

			var registered = false;

			sock.on( 'close', () =>
			{
				if ( !sock.__id ) return;

				this.trigger( sock.__id, 'close' );
				this.mapSock.delete( sock.__id );
			} );

			sock.on( 'data', ( rawData ) =>
			{
				var data = JSON.parse( rawData );
				if ( data.msg == 'connect' && !registered )
				{
					registered = true;
					sock.__id  = sock._meteorSession.id;
					// other than 'sub', 'unsub', 'method'
					sock._meteorSession.protocol_handlers[ '$custom$' ] = ( rawMsg ) => {

						delete rawMsg.msg;
						this.trigger( sock.__id, rawMsg.close ? 'close' : 'data', rawMsg.data );
					};
					this.mapSock.set( sock.__id, sock );

					// console.log( sock._meteorSession.protocol_handlers );
				}
			} );
		} );
	}

	// 'data' or 'close'
	attach( id, type, onEvent )
	{
		if ( this.getSock( id ) == null ) return -1;

		var e         = { type: type, cb: onEvent };
		var listeners = this.mapListener.get( id );
		if ( !listeners )
		{
			listeners = [ e ];
		}
		else
		{
			listeners.push( e );
		}
		this.mapListener.set( id, listeners );
		console.log( 'attach', listeners );
	}

	detach( id, type, onEvent )
	{
		var listeners = this.mapListener.get( id );
		if ( listeners )
		{
			listeners = listeners.filter( l => l.type != type || l.cb != onEvent );
			this.mapListener.set( id, listeners );
		}
		console.log( 'detach', listeners );
	}

	send( id, data )
	{
		var sock;
		if ( (sock = this.getSock( id )) == null ) return -1;

		sock.send( JSON.stringify( { msg: '$custom$', data: data } ) );
	}

	close( id, removeAllListener = true )
	{
		var sock;
		if ( (sock = this.getSock( id )) == null ) return -1;

		sock.send( JSON.stringify( { msg: '$custom$', close: true } ) );
		//this.trigger( sock.__id, 'close' );
		if ( removeAllListener )
		{
			this.mapListener.delete( id );
		}
		console.log( 'close' );
	}

	getSock( id )
	{
		var sock = this.mapSock.get( id );
		if ( !sock )
		{
			console.error( `socket "${id} not found` );
			return null;
		}
		return sock;
	}
}

export default new SocketServer();