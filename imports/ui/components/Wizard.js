import React from 'react';
import { Meteor } from 'meteor/meteor';

import {
	Step,
	Stepper,
	StepLabel,
	StepContent
} from 'material-ui/Stepper';

import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

const Wizard = React.createClass( {

	//updateCompletedSteps( currentStep )
	//{
	//	return currentStep < this.props.activeStep;
	//},
	//
	//createIcon( step )
	//{
	//	if ( step.props.isCompleted )
	//	{
	//		return (
	//			<FontIcon className="material-icons" style={{fontSize: 14}}>
	//				done
	//			</FontIcon>
	//		);
	//	}
	//	return <span>{step.props.orderStepLabel}</span>;
	//},

	onClickClose()
	{
		this.context.router.goBack();
	},

	render() {
		const { title, activeStep, steps } = this.props;

		const actions = [
			<RaisedButton
				label="Close"
				primary={ true }
				disabled={ activeStep > 0 && activeStep < steps.length }
				onTouchTap={ this.onClickClose }
				style={{margin:15}}
			/>
		];

		return (
			<Dialog
				title={title}
				modal={true}
				open={true}
				actions={actions}
				autoScrollBodyContent={true}
				contentStyle={{height:700}}
			>
				<Stepper
					activeStep={ activeStep }
					linear={true}
					orientation="vertical"
				>
					{
						steps.map( ( s, idx ) => {
							return (
								<Step key={idx}>
									<StepLabel> {s.label} </StepLabel>
									<StepContent> { s.content ? s.content : <CircularProgress /> } </StepContent>
								</Step>
							);
						} )
					}
				</Stepper>
			</Dialog>
		);
	},
} );

Wizard.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Wizard;
