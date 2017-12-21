import '/imports/api/host/publications';
import '/imports/api/host/methods';
import '/imports/api/container/publications';
import '/imports/api/container/methods';
import '/imports/api/config/publications';
import '/imports/api/config/methods';
import '/imports/api/registry/methods';
import '/imports/api/image/methods';
import '/imports/api/game/publications';
import '/imports/api/game/methods';
import '/imports/api/game/method-deploy';
import '/imports/api/flow/publications';
import '/imports/api/flow/methods';
import '/imports/api/plugin/methods';

import { Flows } from '/imports/api/flow/flows';

if ( Flows.find( {} ).count() == 0 )
{
	Flows.insert( JSON.parse( Assets.getText( 'hp/flow.json' ) ) );
}