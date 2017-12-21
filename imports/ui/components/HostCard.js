import React from 'react'

import {
	Card,
	CardActions,
	CardHeader,
	CardTitle,
	CardText
} from 'material-ui/Card';

import FlatButton from 'material-ui/FlatButton';

import {
	GridList,
	GridTile
} from 'material-ui/GridList';

import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';

const HostCard = React.createClass( {

	render()
	{
		const field = [

			{ cols: 3, fieldName: 'OperatingSystem', displayName: '操作系统' },
			{ cols: 3, fieldName: 'KernelVersion', displayName: '内核版本' },
			{ cols: 2, fieldName: 'NCPU', displayName: 'CPU个数' },
			{ cols: 2, fieldName: 'MemTotal', displayName: '总内存' },
			{ cols: 2, fieldName: 'ServerVersion', displayName: 'Docker版本' }

		];

		const { host } = this.props;

		return (
			<Card style={{marginBottom:30}}>
				<CardHeader
					avatar={<Avatar icon={<FontIcon className="material-icons">dvr</FontIcon>} />}
					title={<span style={{fontSize:24}}>{host.Name}</span>}
					subtitle={host.ip + ':' + host.port}
					actAsExpander={true}
					showExpandableButton={true}
				/>
				<CardText expandable={true}>
					<GridList cols={6} cellHeight={70}>
						{
							field.map( ( f, idx ) => (
								<GridTile
									key={idx}
									cols={f.cols}
									style={{paddingLeft:20, paddingRight:20}}>
									<TextField
										disabled={true}
										value={host[f.fieldName]}
										floatingLabelText={f.displayName}
										inputStyle={{color:'rgb(0,0,0)'}}
										fullWidth={true}
									/>
								</GridTile>
							) )
						}
					</GridList>
				</CardText>
				{
					/*
					<CardActions expandable={true}>
						<FlatButton label="Action1"/>
						<FlatButton label="Action2"/>
					</CardActions>
					*/
				}
			</Card>
		);
	}
} );

export default HostCard;