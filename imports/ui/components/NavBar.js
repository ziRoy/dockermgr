import React from 'react'
import Drawer from 'material-ui/Drawer'
import {
	List,
	ListItem,
	MakeSelectable
} from 'material-ui/List';

import Divider from 'material-ui/Divider';
import FontIcon from 'material-ui/FontIcon';

let SelectableList = MakeSelectable( List );

const NavBar = React.createClass( {

	propTypes: {
		location           : React.PropTypes.object,
		onRequestChangeList: React.PropTypes.func
	},

	render()
	{
		const { location, onRequestChangeList } = this.props;

		var rootPath = location.pathname
		var reg      = /^(\/[^\/]+)/.exec( rootPath );
		if ( reg )
		{
			rootPath = reg[ 1 ];
		}

		return (
			<Drawer
				dockde={true}
				open={true}
			>
				<div style={{paddingTop:64}}></div>
				<SelectableList
					onChange={onRequestChangeList}
					value={rootPath}
				>
					<ListItem
						primaryText="Docker"
						leftIcon={<FontIcon className="material-icons">directions_boat</FontIcon>}
						primaryTogglesNestedList={true}
						initiallyOpen={true}
						nestedItems={[
							<ListItem
								primaryText="主机"
								value="/host"
								leftIcon={<FontIcon className="material-icons">computer</FontIcon>}
							/>,
							<ListItem
								primaryText="镜像"
								value="/image"
								leftIcon={<FontIcon className="material-icons">wallpaper</FontIcon>}
							/>,
							<ListItem
								primaryText="容器"
								value="/container"
								leftIcon={<FontIcon className="material-icons">panorama_vertical</FontIcon>}
							/>,
							<ListItem
								primaryText="仓库"
								value="/registry"
								leftIcon={<FontIcon className="material-icons">business</FontIcon>}
							/>
            			]}
					/>

					<ListItem
						primaryText="Game"
						leftIcon={<FontIcon className="material-icons">videogame_asset</FontIcon>}
						primaryTogglesNestedList={true}
						initiallyOpen={true}
						nestedItems={[
							<ListItem
								primaryText="部署"
								value="/prod"
								leftIcon={<FontIcon className="material-icons">language</FontIcon>}
							/>
						]}
					/>

					<ListItem
						primaryText="Test"
						value="/test"
						leftIcon={<FontIcon className="material-icons">videogame_asset</FontIcon>}
					/>
				</SelectableList>
			</Drawer>
		);
	}
} );

export default NavBar;