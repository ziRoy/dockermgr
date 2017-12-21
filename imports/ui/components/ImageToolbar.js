import React from 'react'
import { createContainer } from 'meteor/react-meteor-data';

// components
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle
} from 'material-ui/Toolbar';

const ImageToolbar = React.createClass( {

	onSelectChanged( evt, idx, key )
	{
		this.context.router.push( `/image/${key}` );
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
						style={{width:180}}
					>
						{
							hosts.map( h => (
								<MenuItem key={h._id} value={h._id} primaryText={h.ip}/>
							) )
						}
					</DropDownMenu>
				</ToolbarGroup>

				<ToolbarGroup float="right">
				</ToolbarGroup>
			</Toolbar>
		);
	}
} );

ImageToolbar.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ImageToolbar;