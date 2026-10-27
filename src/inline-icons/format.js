import { RichTextToolbarButton } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import { insert } from '@wordpress/rich-text';

import { IconPickerModal } from './components/icon-picker-modal';
import { InlineIconPopover } from './components/inline-icon-popover';
import { getIconAttributes, readIconAttributes } from './utils/attributes';

export const FORMAT_NAME = 'core-blocks-plus/inline-icon';

const title = __( 'Inline icon', 'core-blocks-plus' );

// Rich text's placeholder character for an inline object.
const OBJECT_REPLACEMENT_CHARACTER = '￼';

/**
 * Toolbar button, icon picker and selected-icon popover.
 *
 * @param {Object}   props                        Format edit props from rich text.
 * @param {Object}   props.value                  Rich text value.
 * @param {Function} props.onChange               Rich text change handler.
 * @param {Function} props.onFocus                Returns focus to the text.
 * @param {boolean}  props.isObjectActive         Whether an inline icon is selected.
 * @param {Object}   props.activeObjectAttributes The selected icon's attributes.
 * @param {Object}   props.contentRef             Ref to the rich text element.
 * @return {Element} Controls.
 */
const Edit = ( {
	value,
	onChange,
	onFocus,
	isObjectActive,
	activeObjectAttributes,
	contentRef,
} ) => {
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );

	const onSelectIcon = ( icon ) => {
		if ( isObjectActive ) {
			// Swap the icon, keeping the selected icon's other settings.
			const replacements = value.replacements.slice();
			replacements[ value.start ] = {
				type: FORMAT_NAME,
				attributes: getIconAttributes( {
					...readIconAttributes( activeObjectAttributes ),
					icon,
				} ),
			};
			onChange( { ...value, replacements } );
		} else {
			// Unlike insertObject(), keep the formats active where it's inserted,
			// so an icon added inside a link is part of the link.
			onChange(
				insert( value, {
					formats: [ value.activeFormats ?? [] ],
					replacements: [
						{
							type: FORMAT_NAME,
							attributes: getIconAttributes( { icon } ),
						},
					],
					text: OBJECT_REPLACEMENT_CHARACTER,
				} )
			);
		}

		setIsPickerOpen( false );
		onFocus();
	};

	return (
		<>
			<RichTextToolbarButton
				icon={ starEmpty }
				title={ title }
				onClick={ () => setIsPickerOpen( true ) }
				isActive={ isObjectActive }
			/>
			{ isPickerOpen && (
				<IconPickerModal
					value={
						isObjectActive ? activeObjectAttributes.icon : undefined
					}
					onSelect={ onSelectIcon }
					onClose={ () => setIsPickerOpen( false ) }
				/>
			) }
			{ isObjectActive && ! isPickerOpen && (
				<InlineIconPopover
					// Reset the popover's fields when a different icon is selected or changed.
					key={ `${ value.start }-${ activeObjectAttributes.icon }` }
					value={ value }
					onChange={ onChange }
					activeObjectAttributes={ activeObjectAttributes }
					contentRef={ contentRef }
					settings={ inlineIcon }
					formatName={ FORMAT_NAME }
					onChangeIcon={ () => setIsPickerOpen( true ) }
				/>
			) }
		</>
	);
};

/**
 * An inline object, like core's inline image: an image tag naming its icon.
 * Rich text saves objects as void tags, so it has to be an img. The front end
 * swaps it for the SVG; the editor draws it as a mask.
 */
export const inlineIcon = {
	title,
	keywords: [
		__( 'icon', 'core-blocks-plus' ),
		__( 'svg', 'core-blocks-plus' ),
	],
	object: true,
	tagName: 'img',
	className: 'wp-inline-icon',
	attributes: {
		icon: 'data-icon',
		alt: 'alt',
		style: 'style',
		className: 'class',
	},
	edit: Edit,
};
