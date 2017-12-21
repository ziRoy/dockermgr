import React from 'react'
import { Meteor } from 'meteor/meteor';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const RegistrySetDialog = React.createClass( {

	onClickSubmit()
	{
		Meteor.call( 'config.setRegistry',
			this.refs.txtHost.getValue(),
			this.refs.txtPort.getValue(), ( err ) => {
				if ( err ) console.log( err );
				this.context.router.goBack();
			} );
	},

	onClickCancel()
	{
		this.context.router.goBack();
	},

	render()
	{
		const actions = [
			<RaisedButton
				label="取消"
				onTouchTap={this.onClickCancel}
				style={{margin:15}}
			/>,
			<RaisedButton
				label="确定"
				primary={true}
				onTouchTap={this.onClickSubmit}
				style={{margin:15}}
			/>
		];

		return (
			<div>
				<Dialog
					title="设置Docker仓库"
					actions={actions}
					modal={true}
					open={true}
				>
					<div>
						<TextField
							ref="txtHost"
							floatingLabelText="Host"
							style={{margin:15}}
						/>
						<TextField
							ref="txtPort"
							floatingLabelText="Port"
							style={{margin:15}}
						/>
					</div>

				</Dialog>
			</div>
		);
	}
} );

RegistrySetDialog.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default RegistrySetDialog;