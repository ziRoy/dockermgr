import React from 'react'
import { Meteor } from 'meteor/meteor';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';

import socketClient from '/imports/startup/client/socket-client';

const RegistryDownload = React.createClass( {

	getInitialState()
	{
		return {
			status : '',
			pbValue: 0,
			pbText : '',
			comp   : false,
		};
	},

	onData( data )
	{
		if ( data.finish )
		{
			if ( data.err )
			{
				this.setState( {
					status: data.err
				} );
			}
			else
			{
				this.setState( {
					pbValue: 100,
					pbText : '',
					comp   : true,
				} );
			}
		}
		else
		{
			this.setState( {
				status: data.status,
				id    : data.id
			} );

			var pd = data.progressDetail;
			if ( pd )
			{
				this.setState( {
					pbValue: pd.current / pd.total * 100,
					pbText : `${Math.floor( pd.current / 1e6 )} MB / ${Math.floor( pd.total / 1e6 )} MB`,
				} );
			}
		}
	},

	componentDidMount()
	{
		const { hostId, tag } = this.props.location.query;

		socketClient.attach( 'data', this.onData );
		socketClient.attach( 'close', () => {
			socketClient.close( true );
		} );

		Meteor.call( 'image.pull', hostId, tag, ( err ) => {
			if ( err )
			{
				this.setState( {
					status: `ERROR! ${err}`
				} );
				socketClient.close( true );
			}
		} );
	},

	componentWillUnmount()
	{
		socketClient.close( true );
	},

	onClickCancel()
	{
		this.context.router.goBack();
	},

	render()
	{
		const actions = [
			<RaisedButton
				label={ this.state.comp ? 'OK' : 'Cancel' }
				primary={ this.state.comp }
				onTouchTap={this.onClickCancel}
				style={{margin:15}}
			/>,
		];
		const { status, pbValue, pbText, id } = this.state;

		return (
			<div>
				<Dialog
					title="Pull"
					actions={actions}
					modal={true}
					open={true}
				>
					<div style={{paddingBottom:10}}>
						<span>{ id ? `[${id}]` : '' } { status }</span>
					</div>
					<LinearProgress mode="determinate"
									value={pbValue}
					/>
					<div style={{paddingTop:10}}>
						<span>{pbText}</span>
					</div>
				</Dialog>
			</div>
		);
	}
} );

RegistryDownload.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default RegistryDownload;