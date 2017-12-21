import React from 'react'
import { createContainer } from 'meteor/react-meteor-data';

// components
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle
} from 'material-ui/Toolbar';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

// collections
import { Hosts } from '/imports/api/host/hosts';

const ContainerToolbar = React.createClass( {

	onSelectChanged( evt, idx, key )
	{
		this.context.router.push( `/container/${key}` );

		//this.context.router.push({
		//	pathname: '/container',
		//	query: { h: key },
		//	state: { fromDashboard: true }
		//});
		//const { onHostChanged } = this.props;
		//onHostChanged( key );
	},

	onClickDeploy()
	{
		const { hostId } = this.props;
		this.context.router.push( `/container/${hostId}/run` );
	},

	render()
	{
		const { hosts, hostId } = this.props;

		return (
			<Toolbar style={{backgroundColor:''}}>
				<ToolbarGroup firstChild={true} float="left">
					<ToolbarTitle text="主机" style={{marginLeft:30}}/>
					<DropDownMenu
						value={hostId}
						onChange={this.onSelectChanged}
						style={{width:256}}
					>
						{
							hosts.map( h => (
								<MenuItem key={h._id} value={h._id} primaryText={h.ip}/>
							) )
						}
					</DropDownMenu>
				</ToolbarGroup>

				<ToolbarGroup float="right">
					{
						hostId ? (
							<RaisedButton
								label="Create Container"
								primary={true}
								icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
								style={{marginRight:20}}
								onClick={this.onClickDeploy}
							/>
						) : ''
					}
				</ToolbarGroup>
			</Toolbar>
		);
	}
} );

ContainerToolbar.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ContainerToolbar;

//export default createContainer( ( props ) => {
//	//console.log( props );
//	//const handler = Meteor.subscribe( 'hosts.public' );
//	return {
//		//loading: !handler.ready(),
//		hosts: Hosts.find( {} ).fetch()
//	}
//}, ContainerToolbar );
