import { BlockControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';

import { store } from '../store';
import { isOverlay } from '../utils/position';

/**
 * Toolbar toggle on a block with Absolute or Fixed blocks inside it, to show
 * them in normal flow while editing so the blocks beneath can be reached.
 * Editor-only; nothing is saved.
 *
 * @param {Object} props          Component props.
 * @param {string} props.clientId Block client ID.
 * @return {Element|null} Toolbar button, or null when nothing inside is positioned.
 */
export const InFlowToolbar = ( { clientId } ) => {
	const { hasOverlays, isInFlow } = useSelect(
		( select ) => {
			const { getClientIdsOfDescendants, getBlockAttributes } =
				select( blockEditorStore );

			return {
				hasOverlays: getClientIdsOfDescendants( clientId ).some(
					( id ) => isOverlay( getBlockAttributes( id )?.style )
				),
				isInFlow: select( store ).isInFlow( clientId ),
			};
		},
		[ clientId ]
	);
	const { toggleInFlow } = useDispatch( store );

	if ( ! hasOverlays && ! isInFlow ) {
		return null;
	}

	return (
		<BlockControls group="other">
			<ToolbarButton
				icon={ isInFlow ? unseen : seen }
				label={ __(
					'Show positioned blocks in normal flow',
					'core-blocks-plus'
				) }
				isPressed={ isInFlow }
				onClick={ () => toggleInFlow( clientId ) }
			/>
		</BlockControls>
	);
};
