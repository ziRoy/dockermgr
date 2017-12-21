import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App				from '/imports/ui/containers/App';
import Host				from '/imports/ui/containers/Host';
import Image        	from '/imports/ui/containers/Image';
import Container    	from '/imports/ui/containers/Container';
import ContainerDetail 	from '/imports/ui/containers/ContainerDetail';
import ContainerConsole from '/imports/ui/containers/ContainerConsole';
import ContainerRemove	from '/imports/ui/containers/ContainerRemove';
import ContainerRun		from '/imports/ui/containers/ContainerRun';
import Registry			from '/imports/ui/containers/Registry';
import RegistryDownload	from '/imports/ui/containers/RegistryDownload';
import RegistrySetDialog from '/imports/ui/containers/RegistrySetDialog';
import Game 			from '/imports/ui/containers/Game';
import GameWizard		from '/imports/ui/containers/GameWizard';
import GameUpdate		from '/imports/ui/containers/GameUpdate';
import Production		from '/imports/ui/containers/Production';
import ProductionBuild	from '/imports/ui/containers/ProductionBuild';
import ProductionDeploy from '/imports/ui/containers/ProductionDeploy';
import ProductionUpdate from '/imports/ui/containers/ProductionUpdate';
import ProductionRemove from '/imports/ui/containers/ProductionRemove';

//import FlowDeploy		from '/imports/ui/containers/FlowDeploy';
//import FlowBuild		from '/imports/ui/containers/FlowBuild';

//<Route path="flow-deploy(/:id)" component={FlowDeploy}>
//	<Route path="build" component={FlowBuild}> </Route>
//</Route>

import Test				from '/imports/ui/containers/Test';

const routes = () => (

	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Container}/>
			<Route path="host" component={Host}></Route>
			<Route path="image(/:hostId)" component={Image}>

			</Route>
			<Route path="container(/:hostId)" component={Container}>
				<Route path=":containerId/inspect"	component={ContainerDetail}></Route>
				<Route path=":containerId/console"	component={ContainerConsole}></Route>
				<Route path=":containerId/remove"	component={ContainerRemove}></Route>
				<Route path="run" component={ContainerRun}> </Route>
			</Route>
			<Route path="registry" component={Registry}>
				<Route path="set" component={RegistrySetDialog}></Route>
				<Route path="pull" component={RegistryDownload}></Route>
			</Route>

			<Route path="game" component={Game}>
				<Route path="wizard" component={GameWizard}></Route>
				<Route path=":id/update" component={GameUpdate}></Route>
				<Route path=":id/remove" component={ProductionRemove}></Route>
			</Route>

			<Route path="prod(/:network)" component={Production}>
				<Route path="build" component={ProductionBuild}></Route>
				<Route path="deploy" component={ProductionDeploy}></Route>
				<Route path=":id/update" component={ProductionUpdate}></Route>
				<Route path=":id/remove" component={ProductionRemove}></Route>
			</Route>

			<Route path="test" component={Test}>

			</Route>
		</Route>
	</Router>

);

export default routes;