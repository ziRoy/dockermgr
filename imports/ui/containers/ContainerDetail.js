import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

import {
	GridList,
	GridTile
} from 'material-ui/GridList';

import Snackbar from 'material-ui/Snackbar';

// collections
import { Containers } from '/imports/api/container/containers';

import { formatContainerInfo } from '/imports/api/Tools';

const ContainerDetail = React.createClass( {

	getInitialState()
	{
		return {
			snackOpen: false,
			snackMsg : '',
			stopping : false
		};
	},

	componentWillUpdate()
	{
		if ( this.props.container == null )
		{
			this.context.router.goBack();
		}
	},

	getField( info )
	{
		var t    = formatContainerInfo( info );
		var none = '\<none\>';

		var field = [];

		field.push( { cols: 3, value: t.name, displayName: 'Name' } );
		field.push( { cols: 3, value: t.id, displayName: 'ID' } );
		field.push( { cols: 6, value: t.cmd == '' ? none : t.cmd, displayName: 'Cmd' } );
		field.push( { cols: 3, value: t.image, displayName: 'Image' } );
		field.push( { cols: 3, value: t.status, displayName: 'Status' } );

		if ( t.mounts.length == 0 )
		{
			field.push( { cols: 6, value: none, displayName: 'Mount' } );
		}
		else
		{
			t.mounts.forEach( m => {
				field.push( { cols: 6, value: m, displayName: 'Mount' } );
			} );
		}

		if ( t.ports.length == 0 )
		{
			field.push( { cols: 2, value: none, displayName: 'Port' } );
		}
		else
		{
			t.ports.forEach( p => {
				field.push( { cols: 2, value: p, displayName: 'Port' } );
			} );
		}
		return field;
	},

	onRequestClose()
	{
		this.context.router.goBack();
	},

	onSnackRequestClose()
	{
		if ( !this.state.stopping )
		{
			this.setState( {
				snackOpen: false
			} );
		}
	},

	onClickStart()
	{
		const { hostId, containerId } = this.props.params;
		Meteor.call( 'containers.start', hostId, containerId );
	},

	onClickStop()
	{
		const { hostId, containerId } = this.props.params;

		this.setState( {
			snackOpen: true,
			snackMsg : 'Stopping...',
			stopping : true
		} );

		Meteor.call( 'containers.stop', hostId, containerId, ( err, res ) => {

			var msg = err ? err.toString() : `Stop with exit code ${res}`;

			this.setState( {
				snackOpen: true,
				snackMsg : msg,
				stopping : false
			} );

		} )
	},

	onClickRemove()
	{
		const { hostId, containerId } = this.props.params;
		this.context.router.push( {
			pathname: `/container/${hostId}/${containerId}/remove`
		} );
	},

	onClickExec()
	{
		const { hostId, containerId } = this.props.params;
		this.context.router.push( {
			pathname: `/container/${hostId}/${containerId}/console`,
			query   : { cmd: 'exec' }
		} );
	},

	onClickLog()
	{
		const { hostId, containerId } = this.props.params;
		this.context.router.push( {
			pathname: `/container/${hostId}/${containerId}/console`,
			query   : { cmd: 'log' }
		} );
		//Meteor.call( 'containers.log', hostId, containerId );
	},

	onClickAttach()
	{
		const { hostId, containerId } = this.props.params;
		this.context.router.push( {
			pathname: `/container/${hostId}/${containerId}/console`,
			query   : { cmd: 'attach' }
		} );
	},

	render()
	{
		const { container } = this.props;
		const style = {
			button: {
				marginRight: 15
			}
		};

		return (
			<Dialog
				title={'容器详情'}
				modal={false}
				autoScrollBodyContent={true}
				open={true}
				onRequestClose={this.onRequestClose}
			>
				{
					!container ? '' :
						<div style={{paddingTop:5}}>
							<div>

								<RaisedButton
									label="Start"
									primary={true}
									style={style.button}
									disabled={container.State.Running}
									icon={<FontIcon className="material-icons">launch</FontIcon>}
									onTouchTap={this.onClickStart}
								/>

								<RaisedButton
									label="Stop"
									primary={true}
									style={style.button}
									disabled={!container.State.Running}
									icon={<FontIcon className="material-icons">stop</FontIcon>}
									onTouchTap={this.onClickStop}
								/>

								<RaisedButton
									label="Remove"
									primary={true}
									style={style.button}
									disabled={container.State.Running}
									icon={<FontIcon className="material-icons">delete</FontIcon>}
									onTouchTap={this.onClickRemove}
								/>

								<RaisedButton
									label="Attach"
									primary={true}
									style={style.button}
									disabled={!container.State.Running}
									icon={<FontIcon className="material-icons">attachment</FontIcon>}
									onTouchTap={this.onClickAttach}
								/>

								<RaisedButton
									label="Exec"
									primary={true}
									style={style.button}
									disabled={!container.State.Running}
									icon={<FontIcon className="material-icons">open_in_browser</FontIcon>}
									onTouchTap={this.onClickExec}
								/>

								<RaisedButton
									label="Log"
									primary={true}
									style={style.button}
									icon={<FontIcon className="material-icons">description</FontIcon>}
									onTouchTap={this.onClickLog}
								/>
							</div>

							<GridList cols={6} cellHeight={70}>
								{
									this.getField( container ).map( ( f, idx ) => (
										<GridTile
											key={idx}
											cols={f.cols}
											style={{paddingLeft:20, paddingRight:20}}>
											<TextField
												disabled={true}
												value={f.value}
												floatingLabelText={f.displayName}
												inputStyle={{color:'rgb(0,0,0)'}}
												fullWidth={true}
											/>
										</GridTile>
									) )
								}
							</GridList>

							<Snackbar
								open={this.state.snackOpen}
								message={this.state.snackMsg}
								onRequestClose={this.onSnackRequestClose}
							/>

						</div>
				}
			</Dialog>
		);
	}
} );

ContainerDetail.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {
	var container = Containers.findOne( { Id: props.params.containerId } );

	console.log( 'detail container', container );

	return {
		container: container
	}
}, ContainerDetail );