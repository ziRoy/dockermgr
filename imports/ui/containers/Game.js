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

import GameList from '/imports/ui/components/GameList';

const Game = React.createClass( {

	format( g )
	{
		var h = Hosts.findOne( g.hostId );
		return Object.assign( {}, g, { host: h ? h.ip : null } );
	},

	onClickAddLogin()
	{
		this.context.router.push( {
			pathname: '/game/wizard',
			query   : { type: 'login' }
		} );
	},

	onClickAddGame()
	{
		this.context.router.push( {
			pathname: '/game/wizard',
			query   : { type: 'game' }
		} );
	},

	onUpdate( server )
	{
		this.context.router.push( `/game/${server._id}/update` );
	},

	onRemove( server )
	{
		this.context.router.push( `/game/${server._id}/remove` );
	},

	render()
	{
		const { hosts, games, loading } = this.props;

		//console.log( 'hosts', hosts );
		//console.log( 'games', games );

		const loginServers = games
			.filter( g => g.type == 'login' )
			.map( g => this.format( g ) );

		const gameServers = games
			.filter( g => g.type == 'game' )
			.map( g => this.format( g ) );

		//console.log( loginServers );
		//console.log( gameServers );

		return (
			<div>
				<div style={{position:'absolute', right:0}}>
					<RaisedButton
						label="Add Login"
						primary={true}
						icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
						style={{marginRight:20}}
						onClick={this.onClickAddLogin}
					/>

					<RaisedButton
						label="Add Game"
						primary={true}
						icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
						style={{marginRight:20}}
						onClick={this.onClickAddGame}
					/>
				</div>

				<div>
					<Subheader>Login Servers</Subheader>
					<GameList
						servers={loginServers}
						onUpdate={this.onUpdate}
						onRemove={this.onRemove}
					/>
				</div>


				<div style={{marginTop:20}}>
					<Subheader>Game Servers</Subheader>
					<GameList
						servers={gameServers}
						onUpdate={this.onUpdate}
						onRemove={this.onRemove}
					/>
				</div>


				{ this.props.children }
			</div>
		);
	}
} );

Game.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const h1 = Meteor.subscribe( 'hosts.public' );
	const h2 = Meteor.subscribe( 'games.public', true );

	const hosts   = Hosts.find( {} ).fetch();
	const games   = Games.find( {} ).fetch();
	const loading = !h1.ready() || !h2.ready();

	return {
		loading,
		hosts,
		games
	};

}, Game );