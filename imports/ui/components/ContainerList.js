import React from 'react'
import { createContainer } from 'meteor/react-meteor-data';

// components
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import RaisedButton from 'material-ui/RaisedButton';
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
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { cyan500 } from 'material-ui/styles/colors';

// collections
import { Containers } from '/imports/api/container/containers';

import { formatContainerInfo } from '/imports/api/Tools';

const ContainerList = React.createClass( {

	getInitialState()
	{
		return {
			filterStatus  : 'all',
			showContainers: [],
			selectIdxList : []
		};
	},

	componentWillReceiveProps( nextProps )
	{
		this.updateShowContainers( nextProps.containers, this.state.filterStatus );
	},

	updateShowContainers( containers, status )
	{
		const showContainers = containers
			.map( c => formatContainerInfo( c ) )
			.filter( t => status == 'all' || t.status == status )

		this.setState( { showContainers: showContainers } );
	},

	columnStyle( width, left = 0 )
	{
		return {
			//width,
			//paddingRight: 0,
			//paddingLeft : 0
		};
	},

	onInspect( containerInfo )
	{
		return () => {
			this.context.router.push( `/container/${this.props.hostId}/${containerInfo.id}/inspect` );
		};
	},

	onBatchStart()
	{
		const { hostId } = this.props;

		this.state.selectIdxList.forEach( i => {

			var container = this.state.showContainers[ i ];
			Meteor.call( 'containers.start', hostId, container.id );

		} );

		this.setState( { selectIdxList: [] } );
	},

	onBatchStop()
	{
		const { hostId } = this.props;

		this.state.selectIdxList.forEach( i => {

			var container = this.state.showContainers[ i ];
			Meteor.call( 'containers.stop', hostId, container.id );

		} );
		this.setState( { selectIdxList: [] } );
	},

	onBatchRemove()
	{
		const { hostId } = this.props;

		this.state.selectIdxList.forEach( i => {

			var container = this.state.showContainers[ i ];
			Meteor.call( 'containers.remove', hostId, container.id, true );

		} );
		this.setState( { selectIdxList: [] } );
	},

	onSelectChange( selections )
	{
		if ( selections == 'all' )
		{
			selections = this.state.showContainers.map( ( c, idx ) => idx );
		}
		this.setState( { selectIdxList: selections } );
	},

	onFilterStatusChange( evt, idx, key )
	{
		this.setState( { filterStatus: key, selectIdxList: [] } );
		this.updateShowContainers( this.props.containers, key );
	},

	render()
	{
		const { loading, highlightNamePrefix } = this.props;
		const allStatus = [ 'all', 'created', 'running', 'exited' ];

		const selectCount = this.state.selectIdxList.length;

		return (
			<div>
				{
					//true ? <CircularProgress size={2} style={{float:'none', position:'relative', marginLeft:'50%'}}/>
					// : ''
				}

				<Table
					fixedHeader={true}
					multiSelectable={true}
					onRowSelection={this.onSelectChange}
				>
					<TableHeader
						adjustForCheckbox={true}
						displaySelectAll={false}
					>
						<TableRow>
							<TableHeaderColumn colSpan="6">

								<CircularProgress size={0.5}
												  style={{position:'absolute',left:-50, top:20, display:loading ? 'inline':'none'}}/>

								<SelectField
									value={this.state.filterStatus}
									floatingLabelText="Status"
									onChange={this.onFilterStatusChange}
									style={{width:128}}
								>
									{
										allStatus.map( s => (
											<MenuItem key={s} value={s} primaryText={s}/>
										) )
									}
								</SelectField>

								{
									selectCount ? <span style={{fontSize:'15px', marginLeft:10}}>
										{`${selectCount} containers`}</span> : ''
								}
								{
									selectCount ?
										<RaisedButton
											label="Start"
											primary={true}
											style={{margin:10}}
											icon={<FontIcon className="material-icons">launch</FontIcon>}
											onTouchTap={this.onBatchStart}
										/> : ''
								}
								{
									selectCount ?
										<RaisedButton
											label="Stop"
											primary={true}
											style={{margin:10}}
											icon={<FontIcon className="material-icons">stop</FontIcon>}
											onTouchTap={this.onBatchStop}
										/> : ''
								}
								{
									selectCount ?
										<RaisedButton
											label="Remove"
											primary={true}
											style={{margin:10}}
											icon={<FontIcon className="material-icons">delete</FontIcon>}
											onTouchTap={this.onBatchRemove}
										/> : ''
								}

							</TableHeaderColumn>
						</TableRow>
						<TableRow>
							<TableHeaderColumn style={this.columnStyle(60, 20)}>Status</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(100)}>ID</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(120)}>Name</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(150)}>Image</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(150)}>Ports</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>Operation</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody
						deselectOnClickaway={false}
					>
						{
							this.state.showContainers
								.map( ( t, idx ) => (
									<TableRow key={t.id}
											  hovered={ highlightNamePrefix && t.name.indexOf(highlightNamePrefix) >= 0 }
											  selected={this.state.selectIdxList.indexOf(idx) >= 0}
									>
										<TableRowColumn style={this.columnStyle(60, 20)}>{t.status}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(100)}>{t.id}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(120)}>{t.name}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(150)}>{t.image}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(150)}>{t.ports.join(
											';' )}</TableRowColumn>
										<TableRowColumn style={this.columnStyle(80)}>
											<IconButton
												iconClassName="material-icons"
												iconStyle={{color:cyan500}}
												onTouchTap={this.onInspect(t)}
											>find_in_page</IconButton>
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

ContainerList.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ContainerList;

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