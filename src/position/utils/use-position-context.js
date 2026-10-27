import { store as blockEditorStore } from '@wordpress/block-editor';
import { hasBlockSupport } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

import { ALLOWED_TYPES, resolvePosition } from './position';

/**
 * Find what an Absolute block is positioned against at a viewport.
 *
 * @param {string} clientId Block client ID.
 * @param {string} viewport Viewport key.
 * @return {{contextId: string|null, candidateId: string|null}} The nearest
 *         positioned ancestor, or if there's none, the nearest ancestor that
 *         could be set to Relative.
 */
export const usePositionContext = ( clientId, viewport ) =>
	useSelect(
		( select ) => {
			const { getBlockParents, getBlockAttributes, getBlockName } =
				select( blockEditorStore );

			let candidateId = null;

			// Nearest parent first.
			for ( const parentId of getBlockParents( clientId, true ) ) {
				const { type } = resolvePosition(
					getBlockAttributes( parentId )?.style,
					viewport
				);

				if ( ALLOWED_TYPES.includes( type ) ) {
					return { contextId: parentId, candidateId: null };
				}

				if (
					! candidateId &&
					hasBlockSupport( getBlockName( parentId ), 'position' )
				) {
					candidateId = parentId;
				}
			}

			return { contextId: null, candidateId };
		},
		[ clientId, viewport ]
	);
