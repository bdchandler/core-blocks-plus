import { useSettings } from '@wordpress/block-editor';
// Core builds its own inspector controls from these; there is no stable equivalent yet.
/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	BaseControl,
	Button,
	ColorPalette,
	Popover,
	TabPanel,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalNumberControl as NumberControl,
	__experimentalVStack as VStack,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
/* eslint-enable @wordpress/no-unsafe-wp-apis */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAnchor } from '@wordpress/rich-text';

import { IconSvg } from './icon-svg';
import { getIconAttributes, readIconAttributes } from '../utils/attributes';
import { useColors } from '../utils/use-colors';
import { useIcons } from '../utils/use-icons';

/**
 * Whether the selected icon is inside a link or button, where a hover colour applies:
 * a Button block's text, or a link within other text. In the editor, a Button's
 * text isn't a link element, so it's matched by its class.
 *
 * @param {Object} value      Rich text value.
 * @param {Object} contentRef Ref to the rich text element.
 * @return {boolean} Whether it's in a link or button.
 */
const isInLink = ( value, contentRef ) =>
	!! contentRef.current?.closest( 'a, button, .wp-block-button__link' ) ||
	!! value.formats[ value.start ]?.some(
		( { type } ) => 'core/link' === type
	);

/**
 * Popover for a selected inline icon, like core's inline image popover:
 * change icon, width, colour (and hover colour inside a link or button) and label.
 *
 * Colours apply straight away, like core's text colour, so they can be seen on
 * the icon. Width and label are applied with the Apply button, as core's
 * inline image does, so typing doesn't move focus back to the text.
 *
 * @param {Object}   props                        Component props.
 * @param {Object}   props.value                  Rich text value.
 * @param {Function} props.onChange               Rich text change handler.
 * @param {Object}   props.activeObjectAttributes The selected icon's attributes.
 * @param {Object}   props.contentRef             Ref to the rich text element.
 * @param {Object}   props.settings               The format's settings, for anchoring.
 * @param {string}   props.formatName             The format's name.
 * @param {Function} props.onChangeIcon           Opens the icon picker.
 * @return {Element} Popover.
 */
export const InlineIconPopover = ( {
	value,
	onChange,
	activeObjectAttributes,
	contentRef,
	settings,
	formatName,
	onChangeIcon,
} ) => {
	const current = readIconAttributes( activeObjectAttributes );
	const [ width, setWidth ] = useState( current.width ?? '' );
	const [ label, setLabel ] = useState( current.label );

	const { icons } = useIcons();
	const { palettes, toSaved, toDisplayed } = useColors();
	// Match core's colour controls: only offer custom colours if the theme allows them.
	const [ allowCustomColors ] = useSettings( 'color.custom' );
	const icon = icons?.find( ( { name } ) => name === current.icon );
	const showHover = isInLink( value, contentRef );

	const anchor = useAnchor( {
		editableContentElement: contentRef.current,
		settings,
	} );

	const update = ( changes ) => {
		const replacements = value.replacements.slice();
		replacements[ value.start ] = {
			type: formatName,
			attributes: getIconAttributes( { ...current, ...changes } ),
		};

		onChange( { ...value, replacements } );
	};

	const onSubmit = ( event ) => {
		event.preventDefault();

		update( {
			label: label.trim(),
			width: parseInt( width, 10 ) || undefined,
		} );
	};

	// With a single palette, show its colours without the palette's name, as core does.
	const colors = 1 === palettes.length ? palettes[ 0 ].colors : palettes;

	const renderPalette = ( key ) => (
		<ColorPalette
			colors={ colors }
			value={ toDisplayed( current[ key ] ) }
			onChange={ ( next ) => update( { [ key ]: toSaved( next ) } ) }
			disableCustomColors={ ! allowCustomColors }
			__experimentalIsRenderedInSidebar
			clearable
		/>
	);

	return (
		<Popover
			// Positioned like core's link popover, which keeps it clear of the sidebar.
			placement="bottom"
			offset={ 8 }
			shift
			focusOnMount={ false }
			anchor={ anchor }
			className="core-blocks-plus-inline-icons-popover"
		>
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<HStack className="core-blocks-plus-inline-icons-popover__header">
						<HStack
							justify="flex-start"
							className="core-blocks-plus-inline-icons-popover__icon"
						>
							{ icon && <IconSvg content={ icon.content } /> }
							<span>{ icon?.label ?? current.icon }</span>
						</HStack>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ onChangeIcon }
						>
							{ __( 'Change', 'core-blocks-plus' ) }
						</Button>
					</HStack>

					<fieldset className="core-blocks-plus-inline-icons-popover__colors">
						<BaseControl.VisualLabel as="legend">
							{ __( 'Color', 'core-blocks-plus' ) }
						</BaseControl.VisualLabel>
						{ showHover ? (
							<TabPanel
								tabs={ [
									{
										name: 'color',
										title: __(
											'Default',
											'core-blocks-plus'
										),
									},
									{
										name: 'hoverColor',
										title: __(
											'Hover',
											'core-blocks-plus'
										),
									},
								] }
							>
								{ ( tab ) => renderPalette( tab.name ) }
							</TabPanel>
						) : (
							renderPalette( 'color' )
						) }
					</fieldset>

					<NumberControl
						__next40pxDefaultSize
						label={ __( 'Width', 'core-blocks-plus' ) }
						help={ __(
							'Leave empty to use the default size.',
							'core-blocks-plus'
						) }
						value={ width }
						min={ 1 }
						onChange={ setWidth }
						suffix={
							<InputControlSuffixWrapper>px</InputControlSuffixWrapper>
						}
					/>

					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Label', 'core-blocks-plus' ) }
						help={ __(
							'Describe the icon for screen readers. Leave empty if it is decorative.',
							'core-blocks-plus'
						) }
						value={ label }
						onChange={ setLabel }
					/>

					<HStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
						>
							{ __( 'Apply', 'core-blocks-plus' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Popover>
	);
};
