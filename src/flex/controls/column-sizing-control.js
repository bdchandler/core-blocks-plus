import { InspectorControls } from '@wordpress/block-editor';
// Core builds its own inspector panels from these; there is no stable equivalent yet.
/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
/* eslint-enable @wordpress/no-unsafe-wp-apis */
import { __, _x } from '@wordpress/i18n';

import { COLUMN_SIZING } from '../utils/flex-sizing';

const EQUAL = 'equal';
const FIT = 'fit';

const HELP_FIT = __(
	"As wide as its content, so buttons and short text won't be squashed. Best for short content.",
	'core-blocks-plus'
);
const HELP_EQUAL = __(
	'Shares the available space with the other columns.',
	'core-blocks-plus'
);

/**
 * "Column sizing" option for core/column: an equal share, or fit to content.
 *
 * Shown in the Settings tab beside core's column Width, which isn't responsive either.
 *
 * @param {Object}   props               Block edit props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element|null} Control, or null when the column has a set width.
 */
export const ColumnSizingControl = ( {
	clientId,
	attributes,
	setAttributes,
} ) => {
	// A width set in the column's own settings takes precedence.
	if ( attributes.width ) {
		return null;
	}

	const value = attributes[ COLUMN_SIZING ] ?? EQUAL;

	const onChange = ( nextValue ) =>
		setAttributes( {
			[ COLUMN_SIZING ]: FIT === nextValue ? FIT : undefined,
		} );

	return (
		<InspectorControls>
			<ToolsPanel
				label={ __( 'Sizing', 'core-blocks-plus' ) }
				resetAll={ () => onChange( EQUAL ) }
			>
				<ToolsPanelItem
					panelId={ clientId }
					label={ __( 'Column sizing', 'core-blocks-plus' ) }
					hasValue={ () => FIT === value }
					onDeselect={ () => onChange( EQUAL ) }
					isShownByDefault
				>
					<ToggleGroupControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Column sizing', 'core-blocks-plus' ) }
						value={ value }
						onChange={ onChange }
						help={ FIT === value ? HELP_FIT : HELP_EQUAL }
					>
						<ToggleGroupControlOption
							value={ EQUAL }
							label={ _x(
								'Equal share',
								'Column sizing',
								'core-blocks-plus'
							) }
						/>
						<ToggleGroupControlOption
							value={ FIT }
							label={ _x(
								'Fit content',
								'Column sizing',
								'core-blocks-plus'
							) }
						/>
					</ToggleGroupControl>
				</ToolsPanelItem>
			</ToolsPanel>
		</InspectorControls>
	);
};
