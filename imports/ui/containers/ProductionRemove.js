import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

const ProductionRemove = React.createClass( {

	onClickOk()
	{
		var { id } = this.props.params;

		Meteor.call( 'games.remove',
			id,
			( err, res ) => {
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
		const { id } = this.props.params;
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
				title="仅作删除,不影响相关容器"
				modal={true}
				open={true}
				actions={actions}
			>
			</Dialog>
		);
	}

} );

ProductionRemove.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ProductionRemove;