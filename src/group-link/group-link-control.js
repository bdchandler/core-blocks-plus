import {
	BlockControls,
	// Core's Button, Navigation and link format use this; there is no stable equivalent yet.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { Popover, TextControl, ToolbarButton } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { link as linkIcon } from '@wordpress/icons';
import { prependHTTP } from '@wordpress/url';

export const ATTRIBUTE = 'groupLink';

const withoutEmpty = ( object ) => {
	const next = Object.fromEntries(
		Object.entries( object ).filter(
			( [ , value ] ) => undefined !== value && '' !== value && false !== value
		)
	);

	return next.url ? next : undefined;
};

/**
 * Toolbar link button for Group, Column and Cover, using core's link popover
 * (the same one Button and Navigation use), plus a label for screen readers.
 *
 * @param {Object}   props               Block edit props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element} Toolbar button and popover.
 */
export const GroupLinkControl = ( { attributes, setAttributes } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ anchor, setAnchor ] = useState( null );

	const link = attributes[ ATTRIBUTE ] ?? {};
	const hasLink = !! link.url;

	const update = ( changes ) =>
		setAttributes( { [ ATTRIBUTE ]: withoutEmpty( { ...link, ...changes } ) } );

	const onRemove = () => {
		setAttributes( { [ ATTRIBUTE ]: undefined } );
		setIsOpen( false );
	};

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					ref={ setAnchor }
					icon={ linkIcon }
					label={
						hasLink
							? __( 'Edit link', 'core-blocks-plus' )
							: __( 'Link', 'core-blocks-plus' )
					}
					isPressed={ hasLink }
					onClick={ () => setIsOpen( ! isOpen ) }
				/>
			</BlockControls>
			{ isOpen && (
				<Popover
					anchor={ anchor }
					placement="bottom"
					offset={ 8 }
					shift
					focusOnMount="firstElement"
					onClose={ () => setIsOpen( false ) }
				>
					<LinkControl
						value={ {
							url: link.url,
							opensInNewTab: !! link.opensInNewTab,
						} }
						onChange={ ( { url, opensInNewTab } ) =>
							update( {
								url: url ? prependHTTP( url ) : undefined,
								opensInNewTab,
							} )
						}
						onRemove={ onRemove }
						forceIsEditingLink={ ! hasLink }
						renderControlBottom={ () =>
							hasLink && (
								<div className="core-blocks-plus-group-link__label">
									<TextControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										label={ __(
											'Link label',
											'core-blocks-plus'
										) }
										help={ __(
											"Read by screen readers. Leave empty to use the block's first heading. Not needed if a link or button inside goes to the same address.",
											'core-blocks-plus'
										) }
										value={ link.label ?? '' }
										onChange={ ( label ) => update( { label } ) }
									/>
								</div>
							)
						}
					/>
				</Popover>
			) }
		</>
	);
};
