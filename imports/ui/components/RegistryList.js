import React from 'react'
import { createContainer } from 'meteor/react-meteor-data';

// components
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {
	Popover,
	PopoverAnimationVertical
} from 'material-ui/Popover';

import FontIcon from 'material-ui/FontIcon';

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
import { Containers } from '/imports/api/container/containers';

const RegistryList = React.createClass( {

	getInitialState()
	{
		return {
			open: false
		};
	},

	columnStyle( width, left = 0 )
	{
		return {
			width,
			paddingRight: 0,
			paddingLeft : left
		};
	},

	onClickPull( tag )
	{
		return ( evt ) => {

			evt.preventDefault();
			this.setState( {
				tag     : tag,
				open    : true,
				anchorEl: evt.currentTarget,
			} );
		};
	},

	onClickDownload( host )
	{
		return () => {

			this.setState( {
				open: false
			} );

			var addr = this.props.addr;
			var tag  = this.state.tag;
			this.context.router.push( {
				pathname: '/registry/pull',
				query   : { tag: `${addr}/${tag.name}:${tag.tag}`, hostId: host._id }
			} );

		};
	},

	handleRequestClose()
	{
		this.setState( {
			open: false,
		} );
	},

	render()
	{
		const { loading, repoList, hosts } = this.props;

		console.log( repoList );

		return (
			<div>
				<Table
					fixedHeader={true}
					selectable={false}
				>
					<TableHeader
						displaySelectAll={false}
						adjustForCheckbox={false}
					>
						<TableRow>
							<TableHeaderColumn style={this.columnStyle(100, 20)}>名称</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(100)}>TAG</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(120)}>创建时间</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>操作</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody
						displayRowCheckbox={false}
					>
						{
							repoList.map( repo => (
								repo.tags.map( tag => (

									<TableRow key={tag.name + tag.tag}>
										<TableRowColumn style={this.columnStyle(100, 20)}>{tag.name}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(100)}>{tag.tag}</TableRowColumn>
										<TableRowColumn
											style={this.columnStyle(120)}>{tag.history[ 0 ].created}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(80)}>
											<IconButton
												iconClassName="material-icons"
												iconStyle={{color:cyan500}}
												onTouchTap={this.onClickPull(tag)}
											>
												cloud_download
											</IconButton>
										</TableRowColumn>
									</TableRow>
								) )
							) )
						}
					</TableBody>
				</Table>

				<Popover
					open={this.state.open}
					anchorEl={this.state.anchorEl}
					anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
					targetOrigin={{horizontal: 'left', vertical: 'top'}}
					onRequestClose={this.handleRequestClose}
					animation={PopoverAnimationVertical}
				>
					<Menu>
						{
							hosts.map( h => (
								<MenuItem
									key={h._id}
									primaryText={h.ip}
									leftIcon={<FontIcon className="material-icons">file_download</FontIcon>}
									onTouchTap={this.onClickDownload(h)}
								/>
							) )
						}
					</Menu>
				</Popover>
			</div>
		)
	}
} );

RegistryList.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default RegistryList;

//export default createContainer( ( props ) => {
//
//	var hostId     = props.hostId;
//	var handler    = Meteor.subscribe( 'containersOfHost', hostId );
//	var containers = Containers.find( { hostId } ).fetch();
//
//	console.log( handler.ready(), containers.length );
//
//	return {
//		loading   : !handler.ready(),
//		containers: handler.ready() ? containers : []
//	}
//}, ContainerList );