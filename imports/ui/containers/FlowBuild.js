//import React from 'react';
//import { Meteor } from 'meteor/meteor';
//import { createContainer } from 'meteor/react-meteor-data';
//
//import Dialog from 'material-ui/Dialog';
//import FontIcon from 'material-ui/FontIcon';
//import RaisedButton from 'material-ui/RaisedButton';
//import SelectField from 'material-ui/SelectField';
//import MenuItem from 'material-ui/MenuItem';
//import TextField from 'material-ui/TextField';
//import Wizard from '/imports/ui/components/Wizard';
//
//import FTextField from '/imports/ui/components/flow/FTextField';
//import FSelectField from '/imports/ui/components/flow/FSelectField';
//import { getDepend } from '/imports/ui/components/flow/Assist';
//
//// collections
//import { Hosts } from '/imports/api/host/hosts';
//import { Flows } from '/imports/api/flow/flows';
//
//const FlowBuild = React.createClass( {
//
//	getInitialState()
//	{
//		return {
//			activeStep: 0,
//			images    : [],
//			image     : null,
//		};
//	},
//
//	componentDidMount()
//	{
//		Meteor.call( 'registry.catalog', ( err, catalog ) => {
//			if ( err ) return console.log( err );
//
//			console.log( catalog );
//
//			this.setState( { images: catalog } );
//		} );
//	},
//
//	componentWillReceiveProps( nextProps )
//	{
//		//if ( !this.state.serverId ) return;
//		//
//		//var row = Games.findOne( { type: this.state.serverType, id: this.state.serverId } );
//		//this.setState( { activeStep: row.progress } );
//	},
//
//	onImageChange( evt, idx, value )
//	{
//		this.setState( { image: value } );
//	},
//
//	onSubmitSetting()
//	{
//		//var hostId     = this.state.hostId,
//		//	image      = this.state.image,
//		//	serverId   = ~~this.refs.serverId.getValue(),
//		//	dbPort     = ~~this.refs.dbPort.getValue(),
//		//	serverPort = ~~this.refs.serverPort.getValue();
//		//
//		//if ( this.state.serverType == 'game' )
//		//{
//		//	this.setState( { serverId, activeStep: 1 } );
//		//	var loginServerId = this.state.loginServerId;
//		//	Meteor.call( 'games.deployGame', { hostId, image, serverId, dbPort, serverPort, loginServerId } );
//		//}
//		//else if ( this.state.serverType == 'login' )
//		//{
//		//	this.setState( { serverId, activeStep: 1 } );
//		//	Meteor.call( 'games.deployLogin', { hostId, image, serverId, dbPort, serverPort } );
//		//}
//	},
//
//	renderFlow( style )
//	{
//		const { flow } = this.props;
//		if ( !flow ) return '';
//
//		const stateFilter = ( watch ) => {
//
//			if ( !watch ) return undefined;
//			return watch.reduce( ( o, e ) => {
//				o[ e ] = this.state[ e ];
//				return o;
//			}, {} );
//		};
//
//		const onChange = ( e ) => {
//			return ( value ) => {
//				var delta  = {};
//				delta[ e ] = value;
//				this.setState( delta );
//			}
//		};
//
//		return flow.build.env.map( ( e, idx ) => {
//
//			var Component;
//			if ( e.type == 'text' )
//			{
//				Component = FTextField;
//			}
//			else if ( e.type == 'selection' )
//			{
//				Component = FSelectField;
//			}
//
//			if ( Component )
//			{
//				return (
//					<Component
//						key={idx}
//						config={e}
//						refs={stateFilter(getDepend(e))}
//						onChange={onChange(e.name)}
//						style={style}
//					/>
//				)
//			}
//			else
//			{
//				return '';
//			}
//
//		} )
//	},
//
//	render() {
//		const style = { display: 'block', margin: 10 };
//
//		const firstStep = {
//			label  : "Settings",
//			content: (
//				<div style={{padding: 10}}>
//
//
//					<SelectField
//						value={this.state.image}
//						floatingLabelText="Images"
//						onChange={this.onImageChange}
//						style={Object.assign({}, style, {width:'100%'})}
//					>
//						{
//							this.state.images.map( im => (
//								<MenuItem key={im} value={im} primaryText={im}/>
//							) )
//						}
//					</SelectField>
//
//					{ this.renderFlow( style ) }
//				</div>
//			)
//		};
//
//		const steps = [
//			firstStep,
//			{ label: 'Initialize' },
//			{ label: 'Pull Images' },
//			{ label: 'Create DB data' },
//			{ label: 'Create DB' },
//			{ label: 'Wait for DB' },
//			{ label: 'Create server' }
//		];
//
//		return (
//			<Wizard
//				title="Build"
//				activeStep={this.state.activeStep}
//				steps={steps}
//			/>
//		)
//	},
//} );
//
//FlowBuild.contextTypes = {
//	router: React.PropTypes.object.isRequired
//};
//
//export default createContainer( ( props ) => {
//
//	const id   = props.params.id;
//	const h1   = Meteor.subscribe( 'flows.public' );
//	const flow = Flows.findOne( id );
//
//	console.log( flow );
//
//	return {
//		flow
//	};
//}, FlowBuild );
