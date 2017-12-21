import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Subheader from 'material-ui/Subheader';

const Test = React.createClass( {

	onClickTest1()
	{
	},

	onClickTest2()
	{
	},

	render()
	{
		return (
			<div>
				<RaisedButton
					label="Test1"
					primary={true}
					style={{marginRight:20}}
					onClick={this.onClickTest1}
				/>
				<RaisedButton
					label="Test1"
					primary={true}
					style={{marginRight:20}}
					onClick={this.onClickTest2}
				/>
			</div>
		);
	}
} );

Test.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Test;

//export default createContainer( ( props ) => {
//
//	const h1 = Meteor.subscribe( 'hosts.public' );
//	const h2 = Meteor.subscribe( 'games.public' );
//
//	const hosts   = Hosts.find( {} ).fetch();
//	const games   = Games.find( {} ).fetch();
//	const loading = !h1.ready() || !h2.ready();
//
//	return {
//		loading,
//		hosts,
//		games
//	};
//
//}, Game );