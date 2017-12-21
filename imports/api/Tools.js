function replace( arr )
{
	var fn = function ( o )
	{
		if ( typeof o != 'object' ) return o;

		for ( var k in o )
		{
			let nk = k;
			arr.forEach( e => {
				nk = nk.replace( e[ 0 ], e[ 1 ] );
			} );

			o[ nk ] = fn( o[ k ] );
			if ( nk != k ) delete o[ k ];
		}
		return o;
	}
	return fn;
}

export const encodeMongoDoc = replace( [ [ /\\/g, '\\\\' ], [ /\$/g, '\\u0024' ], [ /\./g, '\\u002e' ] ] );
export const decodeMongoDoc = replace( [ [ /\\\\/g, '\\' ], [ /\\u0024/g, '$' ], [ /\\u002e/g, '.' ] ] );

export class VirtualCollection {

	constructor( publishHandler, collectionName )
	{
		this.ph   = publishHandler;
		this.cn   = collectionName;
		this.hash = new Set();
	}

	upsert( id, doc )
	{
		if ( this.hash.has( id ) )
		{
			this.ph.changed( this.cn, id, doc );
		}
		else
		{
			this.ph.added( this.cn, id, doc );
			this.hash.add( id );
		}
	}

	remove( id )
	{
		if ( this.hash.has( id ) )
		{
			this.ph.removed( this.cn, id );
			this.hash.delete( id );
		}
	}
}

export function formatContainerInfo( info )
{
	var ret = {
		id    : info.Id,
		name  : info.Name,
		cmd   : info.Cmd,
		image : info.Image,
		status: info.State.Status,
		mounts: info.Mounts.map(
			m => m.Propagation == '' ? `@ -> ${m.Destination}` : `${m.Source} -> ${m.Destination}` )
	};

	var ports = info.NetworkSettings.Ports ? info.NetworkSettings.Ports : [];
	ret.ports = Object.keys( ports ).map( p => {

		var arrPub = ports[ p ];
		if ( arrPub == null || arrPub.length == 0 ) return `@ -> ${p}`

		var v = arrPub.map( a => `${a.HostIp}:${a.HostPort}` );
		return `${v.join( '; ' )} -> ${p}`;
	} );

	return ret;
}