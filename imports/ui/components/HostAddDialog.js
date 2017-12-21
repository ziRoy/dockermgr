import React from 'react'
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

const HostAddDialog = React.createClass( {

	onClickSubmit()
	{
		const { onSubmit } = this.props;
		onSubmit(
			this.refs.txtHost.getValue(),
			this.refs.txtPort.getValue(),
			this.refs.togLocal.isToggled() );
	},

	onClickCancel()
	{
		const { onCancel } = this.props;
		onCancel();
	},

	render()
	{
		const { open } = this.props;

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
					title="Docker 主机"
					actions={actions}
					modal={true}
					open={open}
				>
					<div>
						<TextField
							ref="txtHost"
							floatingLabelText="IP/域名"
							style={{margin:15}}
						/>
						<TextField
							ref="txtPort"
							floatingLabelText="端口"
							style={{margin:15, width:128}}
						/>
						<Toggle
							ref="togLocal"
							label="内网"
							style={{margin:15, display:'inline-table', width:128}}
						/>
					</div>

				</Dialog>
			</div>
		);
	}
} );

export default HostAddDialog;