import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

/**
 * Get the registered icons and icon collections, the same data core's Icon
 * block uses (/wp/v2/icons and /wp/v2/icon-collections).
 *
 * @return {{icons: Array|null, collections: Array|null, hasResolved: boolean}} Icons and collections.
 */
export const useIcons = () =>
	useSelect( ( select ) => {
		const { getEntityRecords, hasFinishedResolution } = select( coreStore );

		return {
			icons: getEntityRecords( 'root', 'icon' ),
			collections: getEntityRecords( 'root', 'iconCollection' ),
			hasResolved: hasFinishedResolution( 'getEntityRecords', [
				'root',
				'icon',
			] ),
		};
	}, [] );
