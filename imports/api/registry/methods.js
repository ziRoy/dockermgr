import { Meteor } from 'meteor/meteor';
import https from 'https';

var httpsGet = Meteor.wrapAsync( ( host, port, path, cb ) =>
{
	var options = {
		hostname          : host,
		port              : port,
		path              : path,
		method            : 'GET',
		rejectUnauthorized: false,
		headers           : {
			'Authorization': 'Basic ' + new Buffer( 'docker:pass@123' ).toString( 'base64' )
		}
	};

	var req = https.request( options, ( res ) => {
		var json = '';
		res.setEncoding( 'utf8' );
		res.on( 'data', ( data ) => {
			//console.log( 'data', data );
			json += data;
		} );
		res.on( 'end', () => {
			//console.log( 'end' );
			cb( null, JSON.parse( json ) );
		} );
	} );

	req.on( 'error', ( err ) => {
		cb( err );
	} );

	req.end();
} );

Meteor.methods( {

	'registry.fetch'( host, port )
	{
		this.unblock();

		var repoList = httpsGet( host, port, '/v2/_catalog' )
			.repositories
			.map( name => {
				var info  = httpsGet( host, port, `/v2/${name}/tags/list` );
				info.tags = info.tags.map( tag => {
					var manifest     = httpsGet( host, port, `/v2/${name}/manifests/${tag}` );
					manifest.history = manifest.history.map( history => JSON.parse( history.v1Compatibility ) );
					return manifest;
				} );
				return info;
			} );
		return repoList;
	},

	'registry.fetchServerImage'( type )
	{
		this.unblock();

		var registry = Meteor.call( 'config.getRegistry' );
		var repoList = httpsGet( registry.host, registry.port, '/v2/_catalog' );
		var ret      = repoList.repositories.filter( name => name == `hp/${type}` )
			.reduce( ( o, name ) => {
				var info = httpsGet( registry.host, registry.port, `/v2/${name}/tags/list` );
				return o.concat( info.tags.map( t => {
					return {
						tag: t,
						v  : `${registry.host}:${registry.port}/hp/${type}:${t}`
					};
				} ) )
			}, [] )
			.sort( ( a, b ) => {
				var sa = a.tag.split( '.' );
				var sb = b.tag.split( '.' );
				if ( sa.length != sb.length ) return sa.length - sa.length;

				for ( let i = 0; i < sa.length; i++ )
				{
					if ( sa[ i ] != sb[ i ] ) return sa[ i ] < sb[ i ] ? 1 : -1;
				}
			} );

		return ret;

		//var repo = Meteor.call( 'registry.fetch', registry.host, registry.port );
		//var ret  = repo.filter( r => r.name == `hp/${type}` )
		//	.reduce( ( o, r ) => {
		//
		//		return o.concat( r.tags.map( t => {
		//			return {
		//				tag: t.tag,
		//				v  : `${registry.host}:${registry.port}/hp/${type}:${t.tag}`
		//			}
		//		} ) );
		//
		//	}, [] );

		return ret;
	},

	'registry.catalog'()
	{
		this.unblock();

		var registry = Meteor.call( 'config.getRegistry' );
		var repoList = httpsGet( registry.host, registry.port, '/v2/_catalog' );

		return repoList.repositories.map( name => `${registry.host}:${registry.port}/${name}` );
	}
} );