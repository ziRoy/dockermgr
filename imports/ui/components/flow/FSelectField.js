import React from 'react'
import { Meteor } from 'meteor/meteor';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { Parser, refEquals } from './Assist';

const FSelectField = React.createClass( {

	getInitialState()
	{
		return {
			value  : "",
			options: [],
		};
	},

	componentDidMount()
	{
		this.updateValue( this.props );
	},

	componentWillReceiveProps( nextProps )
	{
		if ( !refEquals( this.props.refs, nextProps.refs ) )
		{
			this.updateValue( nextProps );
		}
	},

	updateValue( props )
	{
		const { config, refs } = props;

		console.log( 'updateValue', config, refs );

		if ( config.default )
		{
			new Parser( refs ).getValue( config.default, ( err, v ) => {
				this.setState( { value: v } );
			} );
		}
		if ( config.options )
		{
			new Parser( refs ).getValue( config.options, ( err, v ) => {
				this.setState( { options: v } );
			} );
		}
	},

	onValueChange( evt, idx, value )
	{
		this.setState( { value: value } );

		const { onChange } = this.props;
		onChange( value );
	},

	render()
	{
		const { config, style } = this.props;

		return (
			<SelectField
				value={this.state.value}
				floatingLabelText={config.name}
				onChange={this.onValueChange}
				style={style}
			>
				{
					this.state.options.map( o => (
						<MenuItem key={o} value={o} primaryText={o}/>
					) )
				}
			</SelectField>
		)
	}

} );

export default FSelectField;