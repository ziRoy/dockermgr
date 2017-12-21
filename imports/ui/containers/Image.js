import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// collections
import { Hosts } from '/imports/api/host/hosts';

// components
import ImageList from '/imports/ui/components/ImageList';
import ImageToolbar from '/imports/ui/components/ImageToolbar';

const Image = React.createClass( {

	getInitialState()
	{
		return {
			images: []
		}
	},

	componentDidMount()
	{
		this.fetchImage( this.props.params.hostId );
	},

	componentWillReceiveProps( nextProps )
	{
		if ( this.props.params.hostId != nextProps.params.hostId )
		{
			this.fetchImage( nextProps.params.hostId );
		}
	},

	fetchImage( hostId )
	{
		if ( hostId )
		{
			console.log( 'fetch image', hostId );
			Meteor.call( 'image.fetch', hostId, ( err, images ) => {
				this.setState( { images } );
			} );
		}
	},

	render()
	{
		const { hosts  } = this.props;
		const { hostId } = this.props.params;

		return (
			<div>
				<ImageToolbar
					hosts={hosts}
					hostId={hostId}
					selectedHostId={1}
				/>

				<ImageList
					hostId={hostId}
					images={this.state.images}
				/>

				{ this.props.children }

			</div>
		);
	}
} );

export default createContainer( ( props ) => {

	const h1 = Meteor.subscribe( 'hosts.public' );

	return {
		hosts: Hosts.find( {} ).fetch()
	};

}, Image );