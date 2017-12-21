import React from 'react'

import getMuiTheme      from 'material-ui/styles/getMuiTheme';
import Spacing        from 'material-ui/styles/spacing';
import withWidth, {SMALL, MEDIUM, LARGE} from 'material-ui/utils/withWidth';

import AppBar       from 'material-ui/AppBar'
import IconButton   from 'material-ui/IconButton';
import FontIcon     from 'material-ui/FontIcon';
import MenuItem     from 'material-ui/MenuItem';

import NavBar        from '../components/NavBar';

const App = React.createClass( {

	getInitialState()
	{
		return {
			open : false,
			menus: [
				{ label: '主机', route: 1 },
				{ label: '容器', route: 2 }
			]
		};
	},

	componentWillMount() {
		this.setState( {
			muiTheme: getMuiTheme(),
		} );
	},

	childContextTypes: {
		muiTheme: React.PropTypes.object.isRequired,
	},

	contextTypes: {
		router: React.PropTypes.object.isRequired
	},

	getChildContext() {
		return {
			muiTheme: this.state.muiTheme,
		};
	},

	getStyles() {
		const styles = {
			appBar            : {
				position: 'fixed',
				// Needed to overlap the examples
				zIndex  : this.state.muiTheme.zIndex.navDrawer + 1,
				top     : 0,
				left    : 0,
				right   : 0
			},
			menuIcon          : {
				marginLeft: 4
			},
			menuIconWhenMedium: {
				marginLeft: 20
			},
			root              : {
				paddingTop   : Spacing.desktopKeylineIncrement,
				paddingBottom: Spacing.desktopKeylineIncrement,
				paddingLeft  : 256
			},
			content           : {
				margin: Spacing.desktopGutterMini,
			},
			contentWhenMedium : {
				margin: `${Spacing.desktopGutter}px ${Spacing.desktopGutter}px`,
			},
			logo              : {
				width : "75%",
				height: "75%"
			},
			iconRight         : {
				marginTop  : 4,
				marginRight: -80
			}
		};

		const { width } = this.props;

		if ( width == LARGE || width == MEDIUM )
		{
			styles.content  = Object.assign( styles.content, styles.contentWhenMedium );
			styles.menuIcon = Object.assign( styles.menuIcon, styles.menuIconWhenMedium );
		}

		return styles;
	},

	handleRequestChangeList( event, value )
	{
		this.context.router.push( value );
	},

	render()
	{
		const styles = this.getStyles();
		const { location } = this.props;

		//console.log( 'app props:', this.props );

		return (
			<div>

				<AppBar
					title="服务器管理"
					iconElementLeft={<IconButton iconClassName="material-icons" tooltip="菜单" style={styles.menuIcon}>menu</IconButton>}
					iconElementRight={<img src="img/docker-logo.png" style={styles.logo}></img>}
					iconStyleRight={styles.iconRight}
					style={styles.appBar}
				/>

				<div style={styles.root}>
					<div style={styles.content}>
						{this.props.children}
					</div>
				</div>

				<NavBar
					location={location}
					onRequestChangeList={this.handleRequestChangeList}
				/>

			</div>
		)
	}
} );

export default withWidth()( App );