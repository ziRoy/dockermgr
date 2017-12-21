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
import { Builds } from '/imports/api/game/games';

const ProductionBuild = React.createClass( {
	getInitialState()
	{
		return {
			activeStep   : 0,
			buildId      : null,
			serverType   : null,
			hostId       : null,
			branch       : null,
			serverVersion: "",
			resVersion   : "",
			branchList   : []
		};
	},

	componentDidMount()
	{
		Meteor.call( 'games.getBranchList', ( err, res ) => {
			if ( err ) return console.log( err );
			this.setState( { branchList: res } );
		} );
	},

	componentWillReceiveProps( nextProps )
	{
		if ( !this.state.buildId ) return;

		var row = Builds.findOne( this.state.buildId );
		this.setState( { activeStep: row.progress } );
	},

	onHostChange( evt, idx, key )
	{
		this.setState( { hostId: key } );
	},

	onServerTypeChange( evt, idx, key )
	{
		this.setState( { serverType: key } );
	},

	onBranchChange( evt, idx, key )
	{
		this.setState( { branch: key } );

		Meteor.call( 'games.getLatestVersion', 'water_server', key, ( err, res ) => {
			this.setState( { serverVersion: res } )
		} );
		Meteor.call( 'games.getLatestVersion', 'water_art', key, ( err, res ) => {
			this.setState( { resVersion: res } )
		} );
	},

	onServerVersionChange( evt, value )
	{
		this.setState( { serverVersion: value } );
	},

	onResourceVersionChange( evt, value )
	{
		this.setState( { resVersion: value } );
	},

	onSubmitSetting()
	{
		Meteor.call( 'games.createBuild', ( err, buildId ) => {

			if ( err ) return console.log( err );

			this.setState( { buildId: buildId } );

			Meteor.call( 'games.buildImage', buildId,
				this.state.hostId,
				this.state.branch,
				this.state.serverType,
				this.state.serverVersion,
				this.state.resVersion );
		} );
	},

	render() {

		const { hosts } = this.props;
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
						<MenuItem key={1} value='gameserver' primaryText='Game'/>
						<MenuItem key={2} value='loginserver' primaryText='Login'/>
					</SelectField>

					<SelectField
						value={this.state.hostId}
						floatingLabelText="Build At"
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
						value={this.state.branch}
						floatingLabelText="Branch"
						onChange={this.onBranchChange}
						style={style}
					>
						{
							this.state.branchList.map( b => (
								<MenuItem key={b} value={b} primaryText={b}/>
							) )
						}
					</SelectField>

					<TextField
						value={this.state.serverVersion}
						floatingLabelText="Server Version"
						onChange={this.onServerVersionChange}
						style={style}
					/>

					<TextField
						value={this.state.resVersion}
						floatingLabelText="Resource Version"
						onChange={this.onResourceVersionChange}
						style={style}
					/>

					<RaisedButton
						label="Continue"
						primary={true}
						onClick={this.onSubmitSetting}
					/>

				</div>)
		};

		const steps = [
			firstStep,
			{ label: 'Create build container' },
			{ label: 'Building' },
			{ label: 'Get archive' },
			{ label: 'Build image' },
			{ label: 'Push Image' }
		];

		return (
			<Wizard
				title="Build"
				activeStep={this.state.activeStep}
				steps={steps}
			/>
		);
	},
} );

ProductionBuild.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const h1      = Meteor.subscribe( 'hosts.public' );
	const h2      = Meteor.subscribe( 'builds.public' );
	const hosts   = Hosts.find( { local: true } ).fetch();
	const builds  = Builds.find( {} ).fetch();
	const loading = !h1.ready();

	return {
		loading,
		hosts
	};

}, ProductionBuild );
