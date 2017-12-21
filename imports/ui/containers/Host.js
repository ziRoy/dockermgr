import React from 'react'
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

// collections
import { Hosts } from '../../api/host/hosts';

// components
import HostCard from '../components/HostCard';
import HostAddDialog from '../components/HostAddDialog';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import CircularProgress from 'material-ui/CircularProgress';
import {
	Toolbar,
	ToolbarGroup
} from 'material-ui/Toolbar';

const Host = React.createClass( {

	getInitialState()
	{
		return {
			addHostOpen: false
		};
	},

	onClickAddHost()
	{
		this.setState( { addHostOpen: true } );
	},

	onCancelAddHost()
	{
		this.setState( { addHostOpen: false } );
	},

	onSubmitAddHost( ip, port, local )
	{
		this.setState( { addHostOpen: false } );
		Meteor.call( 'hosts.addHost', ip, ~~port, local );
	},

	render()
	{
		const { hosts, loading } = this.props;

		return (
			<div>

				<Toolbar>
					<ToolbarGroup firstChild={true}>
					</ToolbarGroup>

					<ToolbarGroup float="right">

						<RaisedButton
							label="新增主机"
							primary={true}
							icon={<FontIcon className="material-icons">add_circle_outline</FontIcon>}
							onTouchTap={this.onClickAddHost}
						/>

					</ToolbarGroup>

				</Toolbar>

				{
					loading ? <CircularProgress size={2} style={{marginLeft:'50%'}}/> : ''
				}

				<div style={{paddingTop:20}}>
					{
						hosts.map( h => (
							<HostCard
								key={h._id}
								host={h}
							/>
						) )
					}
				</div>
				<HostAddDialog
					open={this.state.addHostOpen}
					onSubmit={this.onSubmitAddHost}
					onCancel={this.onCancelAddHost}
				/>
			</div>
		)
	}
} );

export default createContainer( ( props ) => {
	//console.log( props );
	const handler = Meteor.subscribe( 'hosts.public' );
	return {
		loading: !handler.ready(),
		hosts  : Hosts.find( {} ).fetch()
	}
}, Host );