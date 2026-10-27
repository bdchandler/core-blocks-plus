import { createReduxStore, register } from '@wordpress/data';

/**
 * Editor-only state, never saved: blocks whose positioned children are
 * temporarily shown in normal flow so the blocks beneath can be reached.
 */
export const STORE_NAME = 'core-blocks-plus/position';

const reducer = ( state = { inFlow: {} }, action ) => {
	if ( 'TOGGLE_IN_FLOW' === action.type ) {
		const { [ action.clientId ]: isInFlow, ...rest } = state.inFlow;

		return {
			...state,
			inFlow: isInFlow ? rest : { ...rest, [ action.clientId ]: true },
		};
	}

	return state;
};

export const store = createReduxStore( STORE_NAME, {
	reducer,
	actions: {
		toggleInFlow: ( clientId ) => ( { type: 'TOGGLE_IN_FLOW', clientId } ),
	},
	selectors: {
		isInFlow: ( state, clientId ) => !! state.inFlow[ clientId ],
		hasInFlow: ( state, clientIds ) =>
			clientIds.some( ( clientId ) => !! state.inFlow[ clientId ] ),
	},
} );

register( store );
