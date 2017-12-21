import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Terminal from '/imports/api/term';

// collections
import { Containers } from '/imports/api/container/containers';

import socketClient from '/imports/startup/client/socket-client';

const ContainerConsole = React.createClass( {

	componentDidMount()
	{
		console.log( 'mount' );

		const cmd         = this.props.location.query.cmd;
		const hostId      = this.props.params.hostId;
		const containerId = this.props.container.Id;

		Meteor.call( `containers.${cmd}`,
			{ w: 95, h: 30, hostId, containerId },
			( err ) => {
				if ( err ) return console.log( err );

				var term = new Terminal( {
					cols       : 95,
					rows       : 30,
					screenKeys : true,
					useStyle   : true,
					cursorBlink: true
				} );

				term.on( 'data', function ( data )
				{
					socketClient.send( data );
				} );

				term.on( 'title', function ( title ) {
					console.log( 'recv title', title );
					//document.title = title;
				} );

				term.open( this.refs.consoleDiv );
				term.write( `\x1b[31mWelcome to container ${containerId}\x1b[m\r\n` );

				socketClient.attach( 'data', ( data ) => {
					term.write( data );
				} );

				socketClient.attach( 'close', () => {
					term.destroy();
				} );
			} );
	},

	componentWillUnmount()
	{
		console.log( 'unmount' );
		socketClient.close( true );
	},

	onRequestClose()
	{
		this.context.router.goBack();
	},

	render()
	{
		const { container } = this.props;
		if ( container == null ) return null;

		return (
			<Dialog
				title={`容器终端 @${container.Name} ${container.Id}`}
				modal={false}
				open={true}
				onRequestClose={this.onRequestClose}
				contentStyle={{height:500}}
			>
				{
					//<RaisedButton
					//	label="test"
					//	onTouchTap={this.test2}
					///>
				}

				<div ref="consoleDiv"></div>
			</Dialog>
		);
	}

} );

ContainerConsole.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {
	var container = Containers.findOne( { Id: props.params.containerId } );

	return {
		container: container
	}
}, ContainerConsole );