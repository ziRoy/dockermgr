import { Meteor } from 'meteor/meteor';
import shell from 'shelljs';
import { parseString } from 'xml2js';

Meteor.methods( {
	'plugin.svn-branch-list-plugin'( params )
	{
		var ret = [];
		if ( params.svn )
		{
			shell.config.silent = true;
			var xml             = shell.exec( `svn list ${params.svn}/branches --xml` );
			var res             = Meteor.wrapAsync( parseString )( xml );

			ret = [ 'trunk' ].concat( ( res.lists.list[ 0 ].entry || [] ).map( e => {
				return `branches/${e.name[ 0 ]}`;
			} ) );
		}
		console.log( 'plugin.svn-branch-list-plugin', params, ret );
		return ret;
	},

	'plugin.svn-version-plugin'( params )
	{
		var ret = "";
		if ( params.svn && params.branch )
		{
			shell.config.silent = true;
			var xml             = shell.exec( `svn log ${params.svn}/${params.branch} --xml -l 1` );
			var res             = Meteor.wrapAsync( parseString )( xml );
			ret                 = res.log.logentry[ 0 ].$.revision;
		}
		console.log( 'plugin.svn-version-plugin', params, ret );
		return ret;
	},
} );