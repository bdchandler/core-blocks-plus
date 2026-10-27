import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

import { ATTRIBUTE, GroupLinkControl } from './group-link-control';

import './editor.css';

// Group covers its Row, Stack and Grid variations. Matches Attributes::BLOCKS in PHP.
const BLOCKS = [ 'core/group', 'core/column', 'core/cover' ];

// Matches Render::CLASS_NAME in PHP.
const CLASS_NAME = 'has-group-link';

const addGroupLinkAttribute = ( settings, name ) => {
	if ( ! BLOCKS.includes( name ) || settings.attributes?.[ ATTRIBUTE ] ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			[ ATTRIBUTE ]: {
				type: 'object',
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'core-blocks-plus/group-link-attribute',
	addGroupLinkAttribute
);

const withGroupLinkControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! props.isSelected || ! BLOCKS.includes( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<GroupLinkControl { ...props } />
			</>
		);
	},
	'withGroupLinkControl'
);

addFilter(
	'editor.BlockEdit',
	'core-blocks-plus/group-link-control',
	withGroupLinkControl
);

// The front end's class, so linked blocks are positioned the same in the editor.
// The stretched link itself is front end only, so editing isn't blocked.
const withGroupLinkClassName = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		if (
			! BLOCKS.includes( props.name ) ||
			! props.attributes?.[ ATTRIBUTE ]?.url
		) {
			return <BlockListBlock { ...props } />;
		}

		return (
			<BlockListBlock
				{ ...props }
				className={ [ props.className, CLASS_NAME ]
					.filter( Boolean )
					.join( ' ' ) }
			/>
		);
	},
	'withGroupLinkClassName'
);

addFilter(
	'editor.BlockListBlock',
	'core-blocks-plus/group-link-class-name',
	withGroupLinkClassName
);
