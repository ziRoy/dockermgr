import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import Wizard from '/imports/ui/components/Wizard';

// collections
import { Games } from '/imports/api/game/games';

const ProductionUpdate = React.createClass( {

	getInitialState()
	{
		return {
			activeStep: 0,
			images    : [],
			image     : null,
			fetching  : false,
			started   : false,
		};
	},

	componentDidMount()
	{
	},

	componentWillReceiveProps( nextProps )
	{
		const { server } = nextProps;

		if ( server )
		{
			if ( this.state.images.length == 0 )
			{
				this.setState( { fetching: true } );
				Meteor.call( 'registry.fetchServerImage', server.type, ( err, images ) => {
					if ( err ) return console.log( err );
					this.setState( { fetching: false, images: images } );
				} );
			}
			if ( this.state.started )
			{
				this.setState( { activeStep: server.updateProgress } );
			}
		}
	},

	onImageChange( evt, idx, key )
	{
		this.setState( { image: key } );
	},

	onSubmitSetting()
	{
		const { server } = this.props;
		Meteor.call( 'games.updateDeploy', server._id, this.state.image );
		this.setState( { started: true } );
	},

	render() {

		const { server } = this.props;
		const style = { display: 'block', margin: 10 };
		if ( !server ) return null;

		var tag = /:([^:]*)$/.exec( server.runArgs.image )[ 1 ];

		const firstStep = {
			label  : "Settings",
			content: (
				<div style={{padding: 10}}>
					<TextField
						disabled={true}
						value={tag}
						floatingLabelText='Current Image'
						inputStyle={{color:'rgb(0,0,0)'}}
						style={style}
					/>

					<div>
						<SelectField
							value={this.state.image}
							floatingLabelText="Update To Image"
							onChange={this.onImageChange}
							style={{margin:10}}
						>
							{
								this.state.images.map( im => (
									<MenuItem key={im.v} value={im.v} primaryText={im.tag}/>
								) )
							}
						</SelectField>
						{
							this.state.fetching ? <CircularProgress size={0.5} style={{bottom:15}}/> : ''
						}

					</div>

					<RaisedButton
						label="Continue"
						primary={true}
						onClick={this.onSubmitSetting}
					/>
				</div>
			)
		};

		const steps = [
			firstStep,
			{ label: 'Remove container' },
			{ label: 'Pull image' },
			{ label: 'Run new container' }
		];

		return (
			<Wizard
				title="Update"
				activeStep={this.state.activeStep}
				steps={steps}
			/> );
	},
} );

ProductionUpdate.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	var id = props.params.id;

	const h1      = Meteor.subscribe( 'games.public', false );
	const server  = Games.findOne( id );
	const loading = !h1.ready();

	return {
		id,
		server,
		loading
	};

}, ProductionUpdate );
