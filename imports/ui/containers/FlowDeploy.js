//import React from 'react'
//import { Meteor } from 'meteor/meteor';
//import { createContainer } from 'meteor/react-meteor-data';
//
//// components
//import RaisedButton from 'material-ui/RaisedButton';
//import FontIcon from 'material-ui/FontIcon';
//
//import {
//	Toolbar,
//	ToolbarGroup,
//	ToolbarSeparator,
//	ToolbarTitle
//} from 'material-ui/Toolbar';
//
//import {
//	GridList,
//	GridTile
//} from 'material-ui/GridList';
//
//import DropDownMenu from 'material-ui/DropDownMenu';
//import MenuItem from 'material-ui/MenuItem';
//import TextField from 'material-ui/TextField';
//import Paper from 'material-ui/Paper';
//import Subheader from 'material-ui/Subheader';
//import SelectField from 'material-ui/SelectField';
//import FTextField from '/imports/ui/components/flow/FTextField';
//
//import { red500 } from 'material-ui/styles/colors';
//
//import { Flows } from '/imports/api/flow/flows';
//
//const FlowDeploy = React.createClass( {
//
//	getInitialState()
//	{
//		return {};
//	},
//
//	onFlowChanged( evt, idx, value )
//	{
//		this.context.router.push( `/flow-deploy/${value}` );
//	},
//
//	onClickBuild()
//	{
//		const { id } = this.props.params;
//		this.context.router.push( `/flow-deploy/${id}/build` );
//	},
//
//	onClickPackage()
//	{
//
//	},
//
//	onClickRun()
//	{
//
//	},
//
//	onChange( e )
//	{
//		return ( value ) => {
//			console.log( e.name, 'changed', value );
//			var delta       = {};
//			delta[ e.name ] = value;
//			this.setState( delta );
//		};
//	},
//
//	render()
//	{
//		const { flows } = this.props;
//		const { id } = this.props.params;
//
//		return (
//			<div>
//				<Toolbar style={{backgroundColor:''}}>
//					<ToolbarGroup firstChild={true} float="left">
//						<ToolbarTitle text="构建方案" style={{marginLeft:30}}/>
//						<DropDownMenu
//							value={id}
//							onChange={this.onFlowChanged}
//							style={{width:256}}
//						>
//							{
//								flows.map( f => (
//									<MenuItem key={f._id} value={f._id} primaryText={f.name}/>
//								) )
//							}
//						</DropDownMenu>
//
//
//					</ToolbarGroup>
//
//					<ToolbarGroup float="right">
//						<RaisedButton
//							label="Build"
//							primary={true}
//							icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
//							style={{marginRight:20}}
//							onClick={this.onClickBuild}
//						/>
//						<RaisedButton
//							label="Package"
//							primary={true}
//							icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
//							style={{marginRight:20}}
//							onClick={this.onClickPackage}
//						/>
//						<RaisedButton
//							label="Run"
//							primary={true}
//							icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
//							style={{marginRight:20}}
//							onClick={this.onClickRun}
//						/>
//					</ToolbarGroup>
//				</Toolbar>
//
//				{ this.props.children }
//			</div>
//		);
//	}
//} );
//
//FlowDeploy.contextTypes = {
//	router: React.PropTypes.object.isRequired
//};
//
//export default createContainer( ( props ) => {
//
//	const id = props.params.id;
//	const h1 = Meteor.subscribe( 'flows.public' );
//
//	const flows = Flows.find( {} ).fetch();
//	const flow  = id ? Flows.findOne( id ) : null;
//
//	console.log( id, flows, flow );
//
//	return {
//		flows,
//		flow
//	};
//
//}, FlowDeploy );