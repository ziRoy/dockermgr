import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// collections
import { Hosts } from '/imports/api/host/hosts';
import { Games } from '/imports/api/game/games';

// components
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Subheader from 'material-ui/Subheader';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import GameList from '/imports/ui/components/GameList';

const Production = React.createClass( {

	format( g )
	{
		var h = Hosts.findOne( g.hostId );
		return Object.assign( {}, g, { host: h ? h.ip : null } );
	},

	onClickBuildImage()
	{
		const { network } = this.props;
		this.context.router.push( {
			pathname: `/prod/${network}/build`
		} );
	},

	onClickDeploy()
	{
		const { network } = this.props;
		this.context.router.push( {
			pathname: `/prod/${network}/deploy`
		} );
	},

	onUpdate( server )
	{
		const { network } = this.props;
		this.context.router.push( `/prod/${network}/${server._id}/update` );
	},

	onRemove( server )
	{
		const { network } = this.props;
		this.context.router.push( `/prod/${network}/${server._id}/remove` );
	},

	onNetworkChange( evt, idx, value )
	{
		console.log( 'changed', value );
		this.context.router.push( `/prod/${value}` );
	},

	render()
	{
		const { games, loading, network } = this.props;

		const loginServers = games
			.filter( g => g.type == 'login' )
			.map( g => this.format( g ) );

		const gameServers = games
			.filter( g => g.type == 'game' )
			.map( g => this.format( g ) );

		return (
			<div>
				<div style={{position:'absolute', right:0}}>
					<RaisedButton
						label="Build Image"
						primary={true}
						icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
						style={{marginRight:20}}
						onClick={this.onClickBuildImage}
						disabled={!network}
					/>

					<RaisedButton
						label="Deploy"
						primary={true}
						icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
						style={{marginRight:20}}
						onClick={this.onClickDeploy}
						disabled={!network}
					/>
				</div>

				<SelectField
					value={network}
					floatingLabelText="Network"
					onChange={this.onNetworkChange}
					style={{marginLeft:15}}
				>
					<MenuItem value="local" primaryText="内网"/>
					<MenuItem value="internet" primaryText="外网"/>
				</SelectField>

				<div>
					<Subheader>Login Servers</Subheader>
					<GameList
						servers={loginServers}
						onUpdate={this.onUpdate}
						onRemove={this.onRemove}
						hasDBPort={true}
					/>
				</div>


				<div style={{marginTop:20}}>
					<Subheader>Game Servers</Subheader>
					<GameList
						servers={gameServers}
						onUpdate={this.onUpdate}
						onRemove={this.onRemove}
						hasDBPort={false}
					/>
				</div>

				{ this.props.children }
			</div>
		);
	}
} );

Production.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const { network } = props.params;

	const h1 = Meteor.subscribe( 'games.public', network );
	const h2 = Meteor.subscribe( 'hosts.public' );

	const games   = Games.find( {} ).fetch();
	const loading = !h1.ready();

	return {
		loading,
		games,
		network
	};

}, Production );