import React from 'react'
import { Meteor } from 'meteor/meteor';
import TextField from 'material-ui/TextField';
import async from 'async';
import { Parser, refEquals } from './Assist';

const FTextField = React.createClass( {

	getInitialState()
	{
		return {
			value: ""
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

		new Parser( refs ).getValue( config.default, ( err, v ) => {
			this.setState( { value: v } );
		} );
	},

	onValueChange( evt, value )
	{
		this.setState( { value: value } );

		const { onChange } = this.props;
		onChange( value );
	},

	render()
	{
		const { config, style } = this.props;

		return (
			<TextField
				value={ this.state.value }
				floatingLabelText={ config.name }
				onChange={ this.onValueChange }
				style={ style }
			/>
		)
	}

} );

export default FTextField;