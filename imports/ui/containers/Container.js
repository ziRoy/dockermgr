import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// collections
import { Hosts } from '/imports/api/host/hosts';
import { Containers } from '/imports/api/container/containers';

// components
import ContainerList from '/imports/ui/components/ContainerList';
import ContainerToolbar from '/imports/ui/components/ContainerToolbar';

const Container = React.createClass( {

	render()
	{
		const { hosts, containers, loading } = this.props;
		const { hostId } = this.props.params;
		const { highlight } = this.props.location.query;

		return (
			<div>
				<ContainerToolbar
					hosts={hosts}
					hostId={hostId}
				/>

				<ContainerList
					hostId={hostId}
					containers={containers}
					highlightNamePrefix={highlight}
					loading={loading}
				/>

				{ this.props.children }

			</div>
		);
	}
} );

Container.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default createContainer( ( props ) => {

	const hostId = props.params.hostId;
	const h1     = Meteor.subscribe( 'hosts.public' );
	const h2     = hostId ? Meteor.subscribe( 'containersOfHost', hostId ) : null;

	const hosts      = Hosts.find( {} ).fetch();
	const containers = Containers.find( { hostId } ).fetch();
	const loading    = !h1.ready() || ( h2 && !h2.ready() );
	const newProps   = { loading, hosts, containers };

	//console.log( 'update', newProps );
	return newProps;

}, Container );