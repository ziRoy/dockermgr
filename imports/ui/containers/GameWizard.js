import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import Wizard from '/imports/ui/components/Wizard';

// collections
import { Hosts } from '/imports/api/host/hosts';
import { Games } from '/imports/api/game/games';

const GameWizard = React.createClass( {
	getInitialState()
	{
		return {
			type      : this.props.location.query.type,
			activeStep: 0,
			hostId    : '',
			loginId   : '',
			serverId  : 0,
		};
	},

	componentWillReceiveProps( nextProps )
	{
		if ( !this.state.serverId ) return;

		var row = Games.findOne( { type: this.state.type, id: this.state.serverId } );

		this.setState( { activeStep: row.progress } );
	},

	onHostChange( evt, idx, key )
	{
		this.setState( { hostId: key } );
	},

	onLoginIDChange( evt, idx, key )
	{
		this.setState( { loginId: key } );
	},

	onSubmitSetting()
	{
		var hostId    = this.state.hostId,
			loginId   = this.state.loginId,
			serverId  = ~~this.refs.serverId.getValue(),
			svnBranch = this.refs.svnBranch.getValue();

		this.setState( {
			serverId: serverId
		} );

		if ( this.state.type == 'game' )
		{
			Meteor.call( 'games.createGame', hostId, serverId, loginId, svnBranch );
		}
		else if ( this.state.type == 'login' )
		{
			Meteor.call( 'games.createLogin', hostId, serverId, svnBranch );
		}
	},

	render() {

		const { hosts, login } = this.props;
		const style = { display: 'block', margin: 10 };

		const firstStep = {
			label  : "Settings",
			content: (
				<div style={{padding: 10}}>

					<SelectField
						value={this.state.hostId}
						floatingLabelText="Deploy At"
						onChange={this.onHostChange}
						style={style}
					>
						{
							hosts.map( h => (
								<MenuItem key={h._id} value={h._id} primaryText={h.ip}/>
							) )
						}
					</SelectField>

					{
						this.state.type == 'game' ?
							<SelectField
								value={this.state.loginId}
								floatingLabelText="Login ID"
								onChange={this.onLoginIDChange}
								style={style}
							>
								{
									login
										.map( g => (
											<MenuItem key={g.id} value={g.id} primaryText={g.id}/>
										) )
								}
							</SelectField> : ''
					}

					<TextField
						ref="serverId"
						floatingLabelText="Server ID"
						style={style}
					/>

					<TextField
						ref="svnBranch"
						floatingLabelText="SVN Branch"
						style={style}
					/>

					<RaisedButton
						label="Continue"
						primary={true}
						onClick={this.onSubmitSetting}
					/>

				</div>
			)
		};

		const steps = [
			firstStep,
			{ label: 'Create database volume' },
			{ label: 'Run database' },
			{ label: 'Create workspace volume' },
			{ label: 'Checkout svn to workspace' },
			{ label: 'Build workspace' },
			{ label: 'Run server' }
		];

		return (
			<Wizard
				title="Wizard"
				activeStep={this.state.activeStep}
				steps={steps}
			/>
		);
	},
} );

GameWizard.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const h1 = Meteor.subscribe( 'hosts.public' );
	const h2 = Meteor.subscribe( 'games.public', true );

	const hosts = Hosts.find( { local: true } ).fetch();
	const login = Games.find( { type: 'login' } ).fetch();
	const game  = Games.find( { type: 'game' } ).fetch();

	const loading = !h1.ready() || !h2.ready();

	return {
		loading,
		hosts,
		login,
		game
	};

}, GameWizard );
