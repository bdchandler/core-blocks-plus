import { InspectorControls } from '@wordpress/block-editor';
// Core builds its own Dimensions panel controls from these; there is no stable equivalent yet.
/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	ToggleControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
/* eslint-enable @wordpress/no-unsafe-wp-apis */
import { __ } from '@wordpress/i18n';

import {
	getNoShrink,
	getSelfStretch,
	hasNoShrinkValue,
	setNoShrink,
} from '../utils/flex-sizing';
import { useEditingViewport } from '../../shared/use-editing-viewport';
import { useParentLayout } from '../utils/use-parent-layout';

const HELP_ON = __(
	"Stays wide enough for its content, so buttons and text won't break onto two lines. Other blocks shrink instead.",
	'core-blocks-plus'
);
const HELP_OFF = __(
	'Can get narrower when space is tight, which may push its content onto more lines.',
	'core-blocks-plus'
);

/**
 * "Don't squash" option for children of a Row, shown when core's Width is "Fit".
 *
 * Follows core's responsive editing: when a viewport is being edited, the value
 * is saved under style[ viewport ], the same way core saves its Width setting.
 *
 * @param {Object}   props               Block edit props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element|null} Control, or null when it doesn't apply.
 */
export const NoShrinkControl = ( { clientId, attributes, setAttributes } ) => {
	const viewport = useEditingViewport();
	const parentLayout = useParentLayout( clientId, viewport );

	// Match where core shows its Width control, but only for horizontal rows.
	const isRowChild =
		'flex' === parentLayout?.type &&
		'horizontal' === parentLayout.orientation &&
		parentLayout.allowSizingOnChildren;

	if ( ! isRowChild || 'fit' !== getSelfStretch( attributes.style, viewport ) ) {
		return null;
	}

	const { style } = attributes;
	const noShrink = getNoShrink( style, viewport );

	const onChange = ( value ) =>
		setAttributes( { style: setNoShrink( style, viewport, value ) } );

	return (
		<InspectorControls group="dimensions">
			<ToolsPanelItem
				panelId={ clientId }
				label={ __( "Don't squash", 'core-blocks-plus' ) }
				hasValue={ () => hasNoShrinkValue( style, viewport ) }
				onDeselect={ () => onChange( undefined ) }
				resetAllFilter={ ( next ) => ( {
					style: setNoShrink( next.style, viewport, undefined ),
				} ) }
				isShownByDefault
			>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( "Don't squash", 'core-blocks-plus' ) }
					help={ noShrink ? HELP_ON : HELP_OFF }
					checked={ noShrink }
					onChange={ onChange }
				/>
			</ToolsPanelItem>
		</InspectorControls>
	);
};
