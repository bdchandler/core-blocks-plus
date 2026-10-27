import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Get the resolved layout of a block's parent at a viewport: its viewport
 * layout over its saved layout, over its block type's default layout.
 *
 * @param {string} clientId Block client ID.
 * @param {string} viewport Viewport key.
 * @return {{type: string, orientation: string, allowSizingOnChildren: boolean}|null} Parent layout, or null at the root.
 */
export const useParentLayout = ( clientId, viewport ) =>
	useSelect(
		( select ) => {
			const { getBlockRootClientId, getBlockName, getBlockAttributes } =
				select( blockEditorStore );

			const parentId = getBlockRootClientId( clientId );
			if ( ! parentId ) {
				return null;
			}

			const support = select( blocksStore ).getBlockSupport(
				getBlockName( parentId ),
				'layout'
			);
			const { default: defaultLayout = {}, allowSizingOnChildren } =
				support && 'object' === typeof support ? support : {};
			const parentAttributes = getBlockAttributes( parentId );
			const layout = {
				...defaultLayout,
				...parentAttributes?.layout,
				...parentAttributes?.style?.[ viewport ]?.layout,
			};

			return {
				type: layout.type ?? 'default',
				orientation: layout.orientation ?? 'horizontal',
				allowSizingOnChildren: !! allowSizingOnChildren,
			};
		},
		[ clientId, viewport ]
	);
