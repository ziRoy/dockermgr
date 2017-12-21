import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';

const ContainerRemove = React.createClass( {

	//getInitialState()
	//{
	//},

	onClickOk()
	{
		var { hostId, containerId } = this.props.params;

		Meteor.call( 'containers.remove',
			hostId,
			containerId,
			this.refs.cbDelVolumes.isChecked(),
			( err, res ) => {
				if ( err ) console.log( err );

				this.context.router.replace( `/container/${hostId}` );
			} );
	},

	onClickCancel()
	{
		this.context.router.goBack();
	},

	render()
	{
		const { containerId } = this.props.params;
		const style = {
			button: { margin: 15 }
		};

		const actions = [
			<RaisedButton
				label="取消"
				onTouchTap={this.onClickCancel}
				style={style.button}
			/>,
			<RaisedButton
				label="确定"
				primary={true}
				onTouchTap={this.onClickOk}
				style={style.button}
			/>

		];

		return (
			<Dialog
				title={`
				确认删除容器 ${containerId} ? `}
				modal={true}
				open={true}
				actions={actions}
			>
				<Checkbox
					ref="cbDelVolumes"
					label="删除相关volumes"
				/>

			</Dialog>
		);
	}

} );

ContainerRemove.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ContainerRemove;