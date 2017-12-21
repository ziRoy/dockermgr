import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import {
	RadioButton,
	RadioButtonGroup
} from 'material-ui/RadioButton';

import IconButton from 'material-ui/IconButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';

import {
	GridList,
	GridTile
} from 'material-ui/GridList';

// collections
import { Hosts } from '/imports/api/host/hosts';
import { Containers } from '/imports/api/container/containers';

import { formatContainerInfo } from '/imports/api/Tools';

//<RadioButtonGroup name="mode" defaultSelected="start" style={style.input}>
//	<RadioButton
//		value="create"
//		label="Create only"
//	/>
//	<RadioButton
//		value="start"
//		label="Create and start"
//	/>
//</RadioButtonGroup>

const ContainerRun = React.createClass( {

	getInitialState()
	{
		return {
			image       : null,
			images      : [],
			imageWarning: false,
			volumeFrom  : null,
			volumes     : [],
			volInc      : 0,
			envInc      : 0,
			env         : [],
			ports       : []
		};
	},

	componentDidMount()
	{
		const { hostId } = this.props.params;
		Meteor.call( 'image.fetch', hostId, ( err, images ) => {
			console.log( images );
			this.setState( { images } );
		} );
	},

	onRequestClose()
	{

	},

	onClickSubmit()
	{
		const { hostId } = this.props.params;
		var req = {};

		if ( this.refs.name.getValue() != '' )
		{
			req.name = this.refs.name.getValue();
		}
		if ( !this.state.image )
		{
			this.setState( { imageWarning: true } );
			return;
		}
		req.image = this.state.image;
		req.ports = this.state.ports.reduce( ( o, cur, idx ) => {
			var v = this.refs[ `port${idx}` ].getValue();
			if ( v != '' ) o[ cur ] = v;
			return o;
		}, {} );
		if ( this.state.volumeFrom )
		{
			req.volumeFrom = this.state.volumeFrom;
		}
		req.volumes = this.state.volumes.reduce( ( o, id ) => {
			var v = this.refs[ `volume${id}` ].getValue();
			if ( v != '' ) o.push( v );
			return o;
		}, [] );
		req.env     = this.state.env.reduce( ( o, id ) => {
			var k = this.refs[ `envKey${id}` ].getValue();
			var v = this.refs[ `envValue${id}` ].getValue();
			if ( k != '' ) o[ k ] = v;
			return o;
		}, {} );
		req.start   = this.refs.start.isToggled();

		console.log( req );

		Meteor.call( 'containers.create', hostId, req, ( err, res ) => {
			this.context.router.goBack();
		} );
	},

	onClickCancel()
	{
		this.context.router.goBack();
	},

	onImageChange( evt, idx, key )
	{
		this.setState( { image: key } );
		const { hostId } = this.props.params;
		Meteor.call( 'image.inspect', hostId, key, ( err, info ) => {
			console.log( info );
			this.setState( { ports: Object.keys( info.Config.ExposedPorts || {} ) } );
		} );
	},

	onVolumeFromChange( evt, idx, key )
	{
		this.setState( { volumeFrom: key } );
	},

	addEnv()
	{
		this.setState( {
			env   : [ ...this.state.env, this.state.envInc ],
			envInc: this.state.envInc + 1
		} );
	},

	delEnv( idx )
	{
		return () => {
			this.setState( { env: this.state.env.filter( e => e != idx ) } );
		};
	},

	addVol()
	{
		this.setState( {
			volumes: [ ...this.state.volumes, this.state.volInc ],
			volInc : this.state.volInc + 1
		} );
	},

	delVol( idx )
	{
		return () => {
			this.setState( { volumes: this.state.volumes.filter( e => e != idx ) } );
		};
	},

	render()
	{
		const { hosts, containers } = this.props;
		const { hostId } = this.props.params;

		var h  = hosts.find( ( h => h._id == hostId ) );
		var ip = h ? h.ip : '';

		const style = {
			action  : {
				margin: 15,
			},
			input   : {
				margin : 15,
				display: 'block'
			},
			portDiv : {
				margin: 5
			},
			portElem: {
				marginLeft : 10,
				marginRight: 10,
			},
			envDiv  : {
				margin: 5
			},
			envElem : {
				marginLeft : 10,
				marginRight: 10,
			},
			tile    : {
				paddingLeft : 20,
				paddingRight: 20
			}
		};

		const actions = [
			<RaisedButton
				label="Cancel"
				onTouchTap={this.onClickCancel}
				style={style.action}
			/>,
			<RaisedButton
				label="OK"
				primary={true}
				onTouchTap={this.onClickSubmit}
				style={style.action}
			/>
		];

		return (
			<Dialog
				title={'New Container'}
				modal={true}
				autoScrollBodyContent={true}
				open={true}
				actions={actions}
				onRequestClose={this.onRequestClose}
			>
				{ /**** host ip ****/ }
				<TextField
					disabled={true}
					value={ip}
					floatingLabelText={'Host'}
					inputStyle={{color:'rgb(0,0,0)'}}
					style={style.input}
				/>

				{ /**** container name ****/ }
				<TextField
					ref="name"
					floatingLabelText="Name"
					style={style.input}
				/>

				{ /**** image name ****/ }
				<SelectField
					value={this.state.image}
					floatingLabelText="Image"
					onChange={this.onImageChange}
					errorText={this.state.imageWarning && !this.state.image && 'Image Required'}
					style={Object.assign({},style.input,{width:512})}
				>
					{
						this.state.images.map( i => (
							<MenuItem key={i.RepoTags[0]} value={i.RepoTags[0]} primaryText={i.RepoTags[0]}/>
						) )
					}
				</SelectField>

				{ /**** expose ports ****/ }
				{
					this.state.ports.map( ( p, idx ) => (
						<div key={p} style={style.portDiv}>
							<TextField
								disabled={true}
								value={p}
								floatingLabelText={'Container Port'}
								inputStyle={{color:'rgb(0,0,0)'}}
								style={style.portElem}
							/>
							<span> {'->'} </span>
							<TextField
								ref={`port${idx}`}
								floatingLabelText="Host Port"
								style={style.envElem}
							/>
						</div>
					) )
				}

				{
					//<RadioButtonGroup name="mode" defaultSelected="start" style={style.input}>
					//	<RadioButton
					//		value="create"
					//		label="Create only"
					//	/>
					//	<RadioButton
					//		value="start"
					//		label="Create and start"
					//	/>
					//</RadioButtonGroup>
				}

				{ /**** volume from ****/ }
				<SelectField
					value={this.state.volumeFrom}
					floatingLabelText="Volumes From"
					onChange={this.onVolumeFromChange}
					style={style.input}
				>
					{
						containers.map( c => (
							<MenuItem key={c.id} value={c.name} primaryText={c.name}/>
						) )
					}
				</SelectField>

				{ /**** volumes ****/ }
				{
					this.state.volumes.map( ( id ) => (
						<div key={id} style={style.envDiv}>
							<TextField
								ref={`volume${id}`}
								floatingLabelText="Volume"
								style={style.envElem}
							/>
							<IconButton
								iconClassName="material-icons"
								onTouchTap={this.delVol(id)}
							>
								delete_forever
							</IconButton>
						</div>
					) )
				}
				<RaisedButton
					label="Add Volumes"
					icon={<FontIcon className="material-icons">playlist_add</FontIcon>}
					onTouchTap={this.addVol}
					style={style.input}
				/>

				{ /**** env ****/ }
				{
					this.state.env.map( ( id ) => (
						<div key={id} style={style.envDiv}>
							<TextField
								ref={`envKey${id}`}
								floatingLabelText="Key"
								style={style.envElem}
							/>
							=
							<TextField
								ref={`envValue${id}`}
								floatingLabelText="Value"
								style={style.envElem}
							/>
							<IconButton
								iconClassName="material-icons"
								onTouchTap={this.delEnv(id)}
							>
								delete_forever
							</IconButton>

						</div>
					) )
				}
				<RaisedButton
					label="Add Environment"
					icon={<FontIcon className="material-icons">playlist_add</FontIcon>}
					onTouchTap={this.addEnv}
					style={style.input}
				/>

				<Toggle
					ref={`start`}
					label="Start"
					style={ Object.assign( {}, style.input, {width:256} )}
				/>


			</Dialog>
		);
	}
} );

ContainerRun.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const { hostId } = props.params;
	//const h1         = Meteor.subscribe( 'hosts.public' );
	//const h2         = Meteor.subscribe( 'containersOfHost', hostId );
	const hosts      = Hosts.find( {} ).fetch();
	const containers = Containers.find( { hostId } ).fetch();

	return {
		hosts,
		containers: containers.map( c => formatContainerInfo( c ) )
	}
}, ContainerRun );