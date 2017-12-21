import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// components
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import CircularProgress from 'material-ui/CircularProgress';

import RegistryList from '../components/RegistryList';

// collections
import { Config } from '/imports/api/config/config';
import { Hosts } from '../../api/host/hosts';

const Registry = React.createClass( {

	getInitialState()
	{
		return {
			repoList  : [],
			refreshing: false,
		};
	},

	onClickSetRegistry()
	{
		this.context.router.push( '/registry/set' );
	},

	onClickFetch()
	{
		const { host, port } = this.props;

		this.setState( {
			refreshing: true
		} );
		Meteor.call( 'registry.fetch', host, port, ( err, list ) => {
			this.setState( {
				repoList  : list,
				refreshing: false
			} );
		} );
	},

	render()
	{
		const { loading, host, port, hosts } = this.props;

		console.log( loading, host, port );

		if ( loading )
		{
			return (
				<div>loading</div>
			);
		}

		return (
			<div>
				<div>
					<RaisedButton
						label={ host && port ? `${host}:${port} (Modify)` : 'Set Private Registry'}
						primary={true}
						icon={<FontIcon className="material-icons">settings</FontIcon>}
						style={{display:'block', marginBottom:15}}
						onTouchTap={this.onClickSetRegistry}
					/>
				</div>

				{
					host && port ?
						<RaisedButton
							label="刷新"
							primary={true}
							icon={<FontIcon className="material-icons">refresh</FontIcon>}
							style={{display:'block'}}
							onTouchTap={this.onClickFetch}
						/> : ''
				}
				{
					host && port && !this.state.refreshing ?
						<RegistryList
							repoList={this.state.repoList}
							hosts={hosts}
							addr={`${host}:${port}`}
						/> : <CircularProgress size={2} style={{marginLeft:'50%'}}/>
				}

				{ this.props.children }
			</div>
		);
	}
} );

Registry.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const h1 = Meteor.subscribe( 'config.public' );
	const h2 = Meteor.subscribe( 'hosts.public' );

	const rh = Config.findOne( { k: 'registryHost' } );
	const rp = Config.findOne( { k: 'registryPort' } );

	return {
		loading: !h1.ready() || !h2.ready(),
		host   : rh ? rh.v : null,
		port   : rp ? rp.v : null,
		hosts  : Hosts.find( {} ).fetch()
	};

}, Registry );