import { useStyleOverride } from '@wordpress/block-editor';
import { createHigherOrderComponent, useInstanceId } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

import { ColumnSizingControl } from './controls/column-sizing-control';
import { NoShrinkControl } from './controls/no-shrink-control';
import { COLUMN_SIZING, getRules, rulesToCss } from './utils/flex-sizing';

// "Don't squash" is saved in core's style attribute, so only Column needs a new attribute.
const addColumnSizingAttribute = ( settings, name ) => {
	if ( 'core/column' !== name || settings.attributes?.[ COLUMN_SIZING ] ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			[ COLUMN_SIZING ]: {
				type: 'string',
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'core-blocks-plus/flex-attribute',
	addColumnSizingAttribute
);

const withFlexSizingControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! props.isSelected ) {
			return <BlockEdit { ...props } />;
		}

		const Control =
			'core/column' === props.name
				? ColumnSizingControl
				: NoShrinkControl;

		return (
			<>
				<BlockEdit { ...props } />
				<Control { ...props } />
			</>
		);
	},
	'withFlexSizingControls'
);

addFilter(
	'editor.BlockEdit',
	'core-blocks-plus/flex-controls',
	withFlexSizingControls
);

/**
 * Adds the same sizing CSS the front end gets to a block in the editor canvas.
 *
 * Used for every block, as any block can sit in a Row: switching wrapper
 * components when a setting changes would remount the block.
 *
 * @param {Object}    props                Block list block props.
 * @param {Component} props.BlockListBlock Wrapped component.
 * @return {Element} Block.
 */
const FlexSizedBlockListBlock = ( { BlockListBlock, ...props } ) => {
	const className = useInstanceId( FlexSizedBlockListBlock, 'wp-flex' );
	const rules = getRules( props.name, props.attributes );

	useStyleOverride( {
		css: rules.length ? rulesToCss( className, rules ) : undefined,
	} );

	if ( ! rules.length ) {
		return <BlockListBlock { ...props } />;
	}

	return (
		<BlockListBlock
			{ ...props }
			className={ [ props.className, className ]
				.filter( Boolean )
				.join( ' ' ) }
		/>
	);
};

const withFlexSizingStyles = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => (
		<FlexSizedBlockListBlock { ...props } BlockListBlock={ BlockListBlock } />
	),
	'withFlexSizingStyles'
);

addFilter(
	'editor.BlockListBlock',
	'core-blocks-plus/flex-styles',
	withFlexSizingStyles
);
