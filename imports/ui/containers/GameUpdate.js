import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import Wizard from '/imports/ui/components/Wizard';

// collections
import { Games } from '/imports/api/game/games';

const GameUpdate = React.createClass( {

	getInitialState()
	{
		return {
			activeStep: 0
		};
	},

	componentDidMount()
	{
		const { id } = this.props;
		Meteor.call( 'games.update', id, ( err, res ) => {
			if ( err )
			{
				console.log( err );
			}
		} );
	},

	componentWillReceiveProps( nextProps )
	{
		const { server } = nextProps;

		if ( server )
		{
			this.setState( { activeStep: server.updateProgress } );
		}
	},

	render() {

		const steps = [
			{ label: 'Stop server' },
			{ label: 'SVN update' },
			{ label: 'Rebuild' },
			{ label: 'Run server' }
		];

		return (
			<Wizard
				title="Update"
				activeStep={this.state.activeStep}
				steps={steps}
			/>
		);
	},
} );

GameUpdate.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	var id = props.params.id;

	const h1      = Meteor.subscribe( 'games.public', true );
	const server  = Games.findOne( id );
	const loading = !h1.ready();

	return {
		id,
		server,
		loading
	};

}, GameUpdate );
