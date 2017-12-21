import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

import {
	Table,
	TableHeaderColumn,
	TableRow,
	TableHeader,
	TableRowColumn,
	TableBody,
	TableFooter
} from 'material-ui/Table';

import CircularProgress from 'material-ui/CircularProgress';
import { cyan500 } from 'material-ui/styles/colors';

// collections
//import { Games } from '/imports/api/game/games';
//import { Hosts } from '/imports/api/host/hosts';

const GameList = React.createClass( {

	//getInitialState()
	//{
	//	return {
	//		detailOpen: false,
	//		detailInfo: null
	//	};
	//},
	//
	columnStyle( width, left = 0 )
	{
		return {
			width,
			paddingRight: 0,
			paddingLeft : left
		};
	},

	onInspect( gameInfo )
	{
		return () => {
			this.context.router.push( {
				pathname: `/container/${gameInfo.hostId}`,
				query   : { highlight: `${gameInfo.type}_${gameInfo.id}` }
			} );
		};
	},

	onUpdate( gameInfo )
	{
		const { onUpdate } = this.props;

		return () => {
			onUpdate( gameInfo );
			//this.context.router.push( `/game/${gameInfo._id}/update`);
		};
	},

	onRemove( gameInfo )
	{
		const { onRemove } = this.props;
		return () => {
			onRemove( gameInfo );
		};
	},

	render()
	{
		const { loading, servers, hasDBPort } = this.props;

		return (
			<div>
				{
					//true ? <CircularProgress size={2} style={{float:'none', position:'relative', marginLeft:'50%'}}/>
					// : ''
				}

				<Table
					fixedHeader={true}
					selectable={false}
				>
					<TableHeader
						displaySelectAll={false}
						adjustForCheckbox={false}
					>
						<TableRow>
							<TableHeaderColumn style={this.columnStyle(60, 20)}>ServerID</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(150)}>Host</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>ServerPort</TableHeaderColumn>
							{ hasDBPort ?
								<TableHeaderColumn style={this.columnStyle(80)}>DBPort</TableHeaderColumn> : ''}
							<TableHeaderColumn style={this.columnStyle(120)}>Image</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>Operation</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody
						displayRowCheckbox={false}
					>
						{
							servers.map( g => (
								<TableRow key={g._id}>
									<TableRowColumn style={this.columnStyle(60, 20)}>{g.id}</TableRowColumn>
									<TableRowColumn style={this.columnStyle(150)}>{g.host}</TableRowColumn>
									<TableRowColumn style={this.columnStyle(80)}>{g.serverPort}</TableRowColumn>
									{ hasDBPort ?
										<TableRowColumn style={this.columnStyle(80)}>{g.dbPort}</TableRowColumn> : ''}
									<TableRowColumn style={this.columnStyle(120)}>
										{g.runArgs ? /:([^:]*)$/.exec( g.runArgs.image )[ 1 ] : ''}
									</TableRowColumn>
									<TableRowColumn style={this.columnStyle(80)}>
										<IconButton
											iconClassName="material-icons"
											iconStyle={{color:cyan500}}
											onTouchTap={this.onInspect(g)}
										>find_in_page</IconButton>

										<IconButton
											iconClassName="material-icons"
											iconStyle={{color:cyan500}}
											onTouchTap={this.onUpdate(g)}
										>update</IconButton>

										<IconButton
											iconClassName="material-icons"
											iconStyle={{color:cyan500}}
											onTouchTap={this.onRemove(g)}
										>delete</IconButton>

									</TableRowColumn>
								</TableRow>
							) )
						}
					</TableBody>
				</Table>
			</div>
		)
	}
} );

GameList.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default GameList;