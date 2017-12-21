import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Dialog from 'material-ui/Dialog';
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

const ProductionDeploy = React.createClass( {
	getInitialState()
	{
		return {
			activeStep   : 0,
			serverType   : null,
			image        : null,
			images       : [],
			dbImage      : null,
			hostId       : null,
			loginServerId: null
		};
	},

	//componentDidMount()
	//{
	//	Meteor.call( 'registry.fetchServerImage', 'db', ( err, images ) => {
	//		if ( err ) return console.log( err );
	//		this.setState( { dbImage: images[0] } );
	//	} );
	//},

	componentWillReceiveProps( nextProps )
	{
		if ( !this.state.serverId ) return;

		var row = Games.findOne( { type: this.state.serverType, id: this.state.serverId } );
		this.setState( { activeStep: row.progress } );
	},

	onHostChange( evt, idx, key )
	{
		this.setState( { hostId: key } );
	},

	onLoginServerChange( evt, idx, key )
	{
		this.setState( { loginServerId: key } );
	},

	onServerTypeChange( evt, idx, key )
	{
		this.setState( { serverType: key } );
		Meteor.call( 'registry.fetchServerImage', key, ( err, images ) => {
			if ( err ) return console.log( err );
			this.setState( { images: images } );
		} );
	},

	onImageChange( evt, idx, key )
	{
		this.setState( { image: key } );
	},

	onSubmitSetting()
	{
		const { network } = this.props;
		var hostId     = this.state.hostId,
			image      = this.state.image,
			serverId   = ~~this.refs.serverId.getValue(),
			serverPort = ~~this.refs.serverPort.getValue();

		if ( this.state.serverType == 'game' )
		{
			this.setState( { serverId, activeStep: 1 } );
			var loginServerId = ~~this.state.loginServerId;
			Meteor.call( 'games.deployGame', { local:network == 'local', hostId, image, serverId, serverPort, loginServerId } );
		}
		else if ( this.state.serverType == 'login' )
		{
			this.setState( { serverId, activeStep: 1 } );
			var dbPort = ~~this.refs.dbPort.getValue();
			Meteor.call( 'games.deployLogin', { local:network == 'local', hostId, image, serverId, serverPort, dbPort } );
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
						value={this.state.serverType}
						floatingLabelText="Server Type"
						onChange={this.onServerTypeChange}
						style={style}
					>
						<MenuItem key={1} value='game' primaryText='Game'/>
						<MenuItem key={2} value='login' primaryText='Login'/>
					</SelectField>

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

					<SelectField
						value={this.state.image}
						floatingLabelText="Images"
						onChange={this.onImageChange}
						style={style}
					>
						{
							this.state.images.map( im => (
								<MenuItem key={im.v} value={im.v} primaryText={im.tag}/>
							) )
						}
					</SelectField>

					{
						this.state.serverType == 'game' ?
							<SelectField
								value={this.state.loginServerId}
								floatingLabelText="Login Server ID"
								onChange={this.onLoginServerChange}
								style={style}
							>
								{
									login.map( l => (
										<MenuItem key={l.id} value={l.id} primaryText={l.id}/>
									) )
								}
							</SelectField> : ''
					}

					<TextField
						ref="serverId"
						floatingLabelText="Server ID"
						style={style}
					/>
					{
						this.state.serverType == 'login' ?
							<TextField
								ref="dbPort"
								floatingLabelText="DB Port"
								style={style}
							/> : ''
					}

					<TextField
						ref="serverPort"
						floatingLabelText="Server Port"
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
			{ label: 'Initialize' },
			{ label: 'Pull Images' },
			{ label: 'Create DB' },
			{ label: 'Wait for DB' },
			{ label: 'Create server' }
		];

		return (
			<Wizard
				title="Deploy"
				activeStep={this.state.activeStep}
				steps={steps}
			/>
		)
	},
} );

ProductionDeploy.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const { network } = props.params;
	const h1    = Meteor.subscribe( 'hosts.public' );
	const h2    = Meteor.subscribe( 'games.public', network );
	const hosts = Hosts.find( { local: network == 'local' } ).fetch();
	const login = Games.find( { type: 'login' } ).fetch();
	const game  = Games.find( { type: 'game' } ).fetch();

	const loading = !h1.ready();

	return {
		loading,
		hosts,
		login,
		game,
		network
	};

}, ProductionDeploy );
