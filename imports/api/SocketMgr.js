import { Meteor } from 'meteor/meteor';

class Session {

	constructor( sock )
	{
		this.sock = sock;
		this.evt  = null;
	}

	subscribe( evt, onData, onClose )
	{
		if ( this.evt )
		{
			console.error( `[ERROR] already subscribe on "${this.evt}"` );
			return;
		}
		this.evt = evt;

		this.sock._meteorSession.protocol_handlers[ this.evt ] = ( rawMsg ) => {
			delete rawMsg.msg;
			onData.call( null, rawMsg );
		};
		this.sock.on( 'close', () => {
			onClose.call( null );
		} );
	}

	stop()
	{
		if ( this.evt )
		{
			this.sock._meteorSession.protocol_handlers[ this.evt ] = undefined;
		}
	}
}

class SocketMgr {

	constructor()
	{
		this.mapSock = new Map();
	}

	init()
	{
		Meteor.default_server.stream_server.register( ( sock ) => {

			var registered = false;

			sock.on( 'close', () =>
			{
				console.log( 'sock close' );
				this.mapSock.delete( sock.__id );
			} );

			sock.on( 'data', ( rawData ) =>
			{
				var data = JSON.parse( rawData );
				if ( data.msg == 'connect' && !registered )
				{
					sock.__id = sock._meteorSession.id;
					this.mapSock.set( sock.__id, sock )
					registered = true;

					// 'sub', 'unsub', method
					// console.log( sock._meteorSession.protocol_handlers );
				}
			} );
		} );
	}

	retrieveSocket( id )
	{
		var sock = this.mapSock.get( id );
		return sock ? new Session( sock ) : null;
	}

}

export default new SocketMgr();




