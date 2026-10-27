import {
	store as blockEditorStore,
	useBlockDisplayInformation,
} from '@wordpress/block-editor';
import { Notice } from '@wordpress/components';
import { useDispatch, useRegistry } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

import { DEFAULT_VIEWPORT, setPosition } from '../utils/position';
import { usePositionContext } from '../utils/use-position-context';

/**
 * Shows what an Absolute block is placed within, or warns when nothing around
 * it is positioned, with a button to set the nearest suitable parent to Relative.
 *
 * Without a positioned parent, the block would be placed against the editor
 * canvas in the editor but against the whole page on the front end.
 *
 * @param {Object} props          Component props.
 * @param {string} props.clientId Block client ID.
 * @param {string} props.viewport Viewport being edited.
 * @return {Element} Help text or notice.
 */
export const PositionContextNotice = ( { clientId, viewport } ) => {
	const { contextId, candidateId } = usePositionContext( clientId, viewport );
	const contextInfo = useBlockDisplayInformation( contextId );
	const candidateInfo = useBlockDisplayInformation( candidateId );
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const registry = useRegistry();

	if ( contextId ) {
		return (
			<p className="components-base-control__help">
				{ sprintf(
					/* translators: %s: name of the block it's positioned within. */
					__( 'Placed within: %s', 'core-blocks-plus' ),
					contextInfo?.title
				) }
			</p>
		);
	}

	const setCandidateRelative = () => {
		const style = registry
			.select( blockEditorStore )
			.getBlockAttributes( candidateId )?.style;

		// Set it where it takes effect: the viewport if that overrides the type, otherwise everywhere.
		const target =
			undefined !== style?.[ viewport ]?.position?.type
				? viewport
				: DEFAULT_VIEWPORT;

		updateBlockAttributes( candidateId, {
			style: setPosition( style, target, { type: 'relative' } ),
		} );
	};

	const message = __(
		'No block around this one is set to Relative, so it will be placed against the whole page.',
		'core-blocks-plus'
	);

	if ( ! candidateId ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ message }{ ' ' }
				{ __(
					'Put it inside a Group set to Relative.',
					'core-blocks-plus'
				) }
			</Notice>
		);
	}

	const actions = [
		{
			label: sprintf(
				/* translators: %s: name of the parent block. */
				__( 'Set %s to Relative', 'core-blocks-plus' ),
				candidateInfo?.title
			),
			onClick: setCandidateRelative,
			variant: 'secondary',
		},
	];

	return (
		<Notice status="warning" isDismissible={ false } actions={ actions }>
			{ message }
		</Notice>
	);
};
