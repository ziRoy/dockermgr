import async from 'async';

export function Parser( refs )
{
	this.refs = refs;
}

Parser.prototype.getValue = function ( o, cb )
{
	if ( _.isArray( o ) )
	{
		var task = o.map( e => {
			return cb => this.getValue( e, cb )
		} );

		async.parallel( task, cb );
	}
	else if ( o.type )
	{
		switch ( o.type )
		{
			case 'const':
				return cb( null, o.value );
			case 'ref':
				return cb( null, this.refs[ o.value ] );
			case 'plugin':
				this.getValue( o.param, ( err, p ) => {
					Meteor.call( `plugin.${o.value}`, p, cb );
				} );
		}
	}
	else
	{
		async.reduce( Object.keys( o ), {}, ( memo, key, cb ) => {
			this.getValue( o[ key ], ( err, value ) => {
				memo[ key ] = value;
				cb( null, memo );
			} );
		}, cb );
	}
};

export function refEquals( o1, o2 )
{
	if ( o1 == o2 ) return true;
	if ( !o1 && o2 || o1 && !o2 ) return false;
	return Object.keys( o1 ).every( k => o1[ k ] == o2[ k ] ) &&
		Object.keys( o2 ).every( k => o1[ k ] == o2[ k ] );
};

export function getDepend( conf )
{
	var ret = [];

	function walk( o )
	{
		if ( _.isObject( o ) )
		{
			if ( o.type == 'ref' && o.value )
			{
				ret.push( o.value );
			}
			for ( let k in o )
			{
				walk( o[ k ] );
			}
		}
		else if ( _.isArray( o ) )
		{
			o.forEach( e => walk( e ) );
		}
	}

	walk( conf );

	console.log( conf.name, ret );

	return ret;
}

