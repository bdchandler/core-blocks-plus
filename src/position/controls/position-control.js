import { InspectorControls } from '@wordpress/block-editor';
import { getBlockSupport } from '@wordpress/blocks';
// Core builds its own inspector controls from these; there is no stable equivalent yet.
/* eslint-disable @wordpress/no-unsafe-wp-apis */
import {
	BoxControl,
	Button,
	CustomSelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
/* eslint-enable @wordpress/no-unsafe-wp-apis */
import { __, _x } from '@wordpress/i18n';

import { PositionContextNotice } from './position-context-notice';
import {
	ALLOWED_TYPES,
	DEFAULT_PINNED_Z_INDEX,
	DEFAULT_VIEWPORT,
	SIDES,
	clearViewportPosition,
	resolvePosition,
	setPosition,
	withUnit,
} from '../utils/position';
import { useEditingViewport } from '../../shared/use-editing-viewport';

const OPTIONS = [
	{
		key: '',
		name: __( 'Default', 'core-blocks-plus' ),
	},
	{
		key: 'relative',
		name: _x(
			'Relative',
			'Name for the value of the CSS position property',
			'core-blocks-plus'
		),
		hint: __(
			'Blocks inside it set to Absolute are placed within it.',
			'core-blocks-plus'
		),
	},
	{
		key: 'sticky',
		name: _x(
			'Sticky',
			'Name for the value of the CSS position property',
			'core-blocks-plus'
		),
		hint: __(
			'The block will stick to the top of the window instead of scrolling.',
			'core-blocks-plus'
		),
	},
	{
		key: 'absolute',
		name: _x(
			'Absolute',
			'Name for the value of the CSS position property',
			'core-blocks-plus'
		),
		hint: __(
			"Placed over its surroundings. It won't push other blocks down.",
			'core-blocks-plus'
		),
	},
	{
		key: 'fixed',
		name: _x(
			'Fixed',
			'Name for the value of the CSS position property',
			'core-blocks-plus'
		),
		hint: __(
			'The block will not move when the page is scrolled.',
			'core-blocks-plus'
		),
	},
];

const PINNED_TYPES = [ 'sticky', 'fixed' ];

/**
 * Whether a block supports a position type, matching core's rules for its
 * own dropdown: sticky and fixed need block support and the theme setting.
 *
 * @param {string} name Block name.
 * @param {string} type Position type.
 * @return {boolean} Whether the type is available.
 */
const isTypeAvailable = ( name, type ) => {
	if ( '' === type ) {
		return true;
	}

	if ( ! ALLOWED_TYPES.includes( type ) ) {
		return false;
	}

	if ( ! PINNED_TYPES.includes( type ) ) {
		return true;
	}

	const support = getBlockSupport( name, 'position' );

	return true === support || !! support?.[ type ];
};

/**
 * Position panel for blocks that support position, replacing core's dropdown.
 *
 * Follows core's responsive editing: when a viewport is being edited, values
 * are saved under style[ viewport ].position.
 *
 * @param {Object}   props               Block edit props.
 * @param {string}   props.clientId      Block client ID.
 * @param {string}   props.name          Block name.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element} Controls.
 */
export const PositionControl = ( {
	clientId,
	name,
	attributes,
	setAttributes,
} ) => {
	const viewport = useEditingViewport();
	const { style } = attributes;
	const position = resolvePosition( style, viewport );
	const type = position.type ?? '';
	const isViewport = DEFAULT_VIEWPORT !== viewport;

	const options = OPTIONS.filter(
		( option ) => option.key === type || isTypeAvailable( name, option.key )
	);
	const selectedOption =
		options.find( ( option ) => option.key === type ) ?? options[ 0 ];

	const update = ( changes ) =>
		setAttributes( { style: setPosition( style, viewport, changes ) } );

	const onChangeType = ( { selectedItem } ) => {
		const nextType = selectedItem.key;
		const changes = { type: nextType };

		if ( '' === nextType ) {
			// Back to Default clears this level's inset and layer too.
			SIDES.forEach( ( side ) => ( changes[ side ] = undefined ) );
			changes.zIndex = undefined;
		} else if (
			PINNED_TYPES.includes( nextType ) &&
			! SIDES.some( ( side ) => position[ side ] )
		) {
			// Match core: sticky and fixed blocks start pinned to the top.
			changes.top = '0px';
		}

		update( changes );
	};

	const onChangeInset = ( values ) =>
		update(
			Object.fromEntries(
				SIDES.map( ( side ) => [
					side,
					undefined === values?.[ side ]
						? undefined
						: withUnit( values[ side ] ),
				] )
			)
		);

	const onChangeLayer = ( value ) => {
		const zIndex = parseInt( value, 10 );

		update( { zIndex: Number.isNaN( zIndex ) ? undefined : zIndex } );
	};

	return (
		<InspectorControls group="position">
			<VStack spacing={ 4 }>
				<CustomSelectControl
					__next40pxDefaultSize
					__experimentalShowSelectedHint
					label={ __( 'Position', 'core-blocks-plus' ) }
					hideLabelFromVision
					options={ options }
					value={ selectedOption }
					onChange={ onChangeType }
				/>

				{ 'absolute' === type && (
					<PositionContextNotice
						clientId={ clientId }
						viewport={ viewport }
					/>
				) }

				{ '' !== type && (
					<>
						<BoxControl
							__next40pxDefaultSize
							label={ __( 'Inset', 'core-blocks-plus' ) }
							values={ Object.fromEntries(
								SIDES.map( ( side ) => [
									side,
									position[ side ] ?? undefined,
								] )
							) }
							onChange={ onChangeInset }
						/>

						<NumberControl
							__next40pxDefaultSize
							label={ __( 'Layer', 'core-blocks-plus' ) }
							help={ __(
								'Higher numbers appear in front of other blocks.',
								'core-blocks-plus'
							) }
							placeholder={
								PINNED_TYPES.includes( type )
									? String( DEFAULT_PINNED_Z_INDEX )
									: __( 'Auto', 'core-blocks-plus' )
							}
							value={ position.zIndex ?? '' }
							onChange={ onChangeLayer }
						/>
					</>
				) }

				{ isViewport && style?.[ viewport ]?.position && (
					<Button
						variant="link"
						onClick={ () =>
							setAttributes( {
								style: clearViewportPosition( style, viewport ),
							} )
						}
					>
						{ __(
							'Use desktop settings',
							'core-blocks-plus'
						) }
					</Button>
				) }
			</VStack>
		</InspectorControls>
	);
};
