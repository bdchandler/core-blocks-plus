import {
	store as blockEditorStore,
	useStyleOverride,
} from '@wordpress/block-editor';
import { hasBlockSupport } from '@wordpress/blocks';
import { createHigherOrderComponent, useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';

import { InFlowToolbar } from './controls/in-flow-toolbar';
import { PositionControl } from './controls/position-control';
import { store } from './store';
import { getRules, getTypes, hasPosition, rulesToCss } from './utils/position';

// Switch off core's own Position dropdown and editor preview for blocks we
// handle, so they don't compete with ours. Core reads these two settings for both.
addFilter(
	'blockEditor.useSetting.before',
	'core-blocks-plus/position-disable-core-position',
	( value, path, clientId, blockName ) => {
		if (
			( 'position.sticky' === path || 'position.fixed' === path ) &&
			blockName &&
			hasBlockSupport( blockName, 'position' )
		) {
			return false;
		}

		return value;
	}
);

const withPositionControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! props.isSelected ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				{ hasBlockSupport( props.name, 'position' ) && (
					<PositionControl { ...props } />
				) }
				<InFlowToolbar clientId={ props.clientId } />
			</>
		);
	},
	'withPositionControls'
);

addFilter(
	'editor.BlockEdit',
	'core-blocks-plus/position-controls',
	withPositionControls
);

/**
 * Adds the same position CSS the front end gets to a block in the editor canvas.
 *
 * @param {Object}    props                Block list block props.
 * @param {Component} props.BlockListBlock Wrapped component.
 * @return {Element} Block.
 */
const PositionedBlockListBlock = ( { BlockListBlock, ...props } ) => {
	const { clientId, attributes } = props;
	const className = useInstanceId( PositionedBlockListBlock, 'wp-position' );

	// Skip the CSS while a parent shows its positioned blocks in normal flow.
	const isInFlow = useSelect(
		( select ) =>
			select( store ).hasInFlow(
				select( blockEditorStore ).getBlockParents( clientId )
			),
		[ clientId ]
	);

	const rules =
		! isInFlow && hasPosition( attributes.style )
			? getRules( attributes.style )
			: [];

	useStyleOverride( {
		css: rules.length
			? rulesToCss( `.${ className }.${ className }`, rules )
			: undefined,
	} );

	if ( ! rules.length ) {
		return <BlockListBlock { ...props } />;
	}

	const types = getTypes( rules );

	return (
		<BlockListBlock
			{ ...props }
			className={ [
				props.className,
				className,
				// Readable classes for themes to target, matching core's own
				// is-position-sticky, which core's CSS also uses for the admin bar offset.
				...types.map( ( type ) => `is-position-${ type }` ),
				// Lets the editor canvas CSS bring a selected overlay to the front.
				types.some( ( type ) => [ 'absolute', 'fixed' ].includes( type ) ) &&
					'has-block-position-overlay',
			]
				.filter( Boolean )
				.join( ' ' ) }
		/>
	);
};

const withPositionStyles = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) =>
		hasBlockSupport( props.name, 'position' ) ? (
			<PositionedBlockListBlock
				{ ...props }
				BlockListBlock={ BlockListBlock }
			/>
		) : (
			<BlockListBlock { ...props } />
		),
	'withPositionStyles'
);

addFilter(
	'editor.BlockListBlock',
	'core-blocks-plus/position-styles',
	withPositionStyles
);
