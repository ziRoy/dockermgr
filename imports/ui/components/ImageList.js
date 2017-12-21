import React from 'react'
import { createContainer } from 'meteor/react-meteor-data';

// components
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

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
import { cyan500 } from 'material-ui/styles/colors';

const ImageList = React.createClass( {

	columnStyle( width, left = 0 )
	{
		return {
			width,
			paddingRight: 0,
			paddingLeft : left
		};
	},

	//onInspect( containerInfo )
	//{
	//	return () => {
	//		this.context.router.push( `/container/${this.props.hostId}/${containerInfo.Id}/inspect` );
	//	};
	//},

	parseRepoAndTag( name )
	{
		var arr  = name.split( ':' );
		var tag  = arr.pop();
		var repo = arr.join( ':' );
		return { repo, tag };
	},

	render()
	{
		const { images } = this.props;

		var rows = [];
		images.forEach( ( i ) => {
			i.RepoTags.forEach( r => {
				rows.push( Object.assign( {}, this.parseRepoAndTag(r), i ) );
			});
		});

		return (
			<div>
				{
					//true ? <CircularProgress size={2} style={{float:'none', position:'relative', marginLeft:'50%'}}/>
					// : ''
				}

				<Table
					fixedHeader={true}
					selectable={false}
				>
					<TableHeader
						displaySelectAll={false}
						adjustForCheckbox={false}
					>
						<TableRow>
							<TableHeaderColumn style={this.columnStyle(200, 20)}>名称</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>TAG</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(100)}>镜像容量</TableHeaderColumn>
							<TableHeaderColumn style={this.columnStyle(80)}>操作</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody
						displayRowCheckbox={false}
					>
						{
							rows.map( (r, idx) => (
								<TableRow key={idx}>
									<TableRowColumn style={this.columnStyle(200, 20)}>{r.repo}</TableRowColumn>
									<TableRowColumn style={this.columnStyle(80)}>{r.tag}</TableRowColumn>
									<TableRowColumn style={this.columnStyle(100)}>{Math.floor(r.Size / 1e6) + ' MB'}</TableRowColumn>
									<TableRowColumn style={this.columnStyle(80)}>
										<IconButton
											iconClassName="material-icons"
											iconStyle={{color:cyan500}}
										>find_in_page</IconButton>
									</TableRowColumn>
								</TableRow>
							))
						}
					</TableBody>
				</Table>
			</div>
		)
	}
} );

ImageList.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default ImageList;