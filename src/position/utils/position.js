import { DEFAULT_VIEWPORT } from '../../shared/use-editing-viewport';

/**
 * Position settings use core's style.position shape plus zIndex, with viewport
 * overrides at style['@mobile'].position and style['@tablet'].position.
 *
 * Mirrors App/Features/Position/Styles.php, which builds the same rules on the front end.
 */

// From Assets.php: media queries keyed by viewport, and the types the site allows.
const { mediaQueries = {}, allowedTypes = [] } =
	window.coreBlocksPlus?.position ?? {};

export const SIDES = [ 'top', 'right', 'bottom', 'left' ];

// Position types that create a positioning context and can use inset and z-index.
export const TYPES = [ 'relative', 'sticky', 'absolute', 'fixed' ];

export const ALLOWED_TYPES = allowedTypes;

// Re-exported for this feature's controls; defined with the shared viewport hook.
export { DEFAULT_VIEWPORT };
const DESKTOP = '@desktop';

// Core's default z-index for sticky and fixed blocks, kept so existing content doesn't change.
export const DEFAULT_PINNED_Z_INDEX = 10;

const PINNED_TYPES = [ 'sticky', 'fixed' ];
const OUT_OF_FLOW_TYPES = [ 'absolute', 'fixed' ];

const isBase = ( viewport ) =>
	DEFAULT_VIEWPORT === viewport || DESKTOP === viewport;

/**
 * Get the effective position settings at a viewport.
 *
 * Viewport values replace the base (desktop) values: the type and z-index
 * individually, and the four sides as a set.
 *
 * @param {Object} style    Block style attribute.
 * @param {string} viewport Viewport key.
 * @return {Object} Resolved position settings.
 */
export const resolvePosition = ( style, viewport ) => {
	const base = style?.position ?? {};
	const override = isBase( viewport ) ? null : style?.[ viewport ]?.position;

	if ( ! override ) {
		return base;
	}

	const resolved = { ...base };
	[ 'type', 'zIndex' ].forEach( ( key ) => {
		if ( key in override ) {
			resolved[ key ] = override[ key ];
		}
	} );

	if ( SIDES.some( ( side ) => side in override ) ) {
		SIDES.forEach( ( side ) => {
			resolved[ side ] = override[ side ] ?? null;
		} );
	}

	return resolved;
};

/**
 * Add px to a bare number, as BoxControl's slider saves e.g. "10" before a unit
 * has been chosen. Zero stays unitless. Mirrors Styles::with_unit() in PHP.
 *
 * @param {string} value Inset value.
 * @return {string} Value with a unit.
 */
export const withUnit = ( value ) =>
	/^-?(\d+\.?\d*|\.\d+)$/.test( value ) && 0 !== Number( value )
		? `${ value }px`
		: value;

const isNumeric = ( value ) =>
	( 'number' === typeof value && Number.isFinite( value ) ) ||
	( 'string' === typeof value &&
		'' !== value.trim() &&
		! isNaN( Number( value ) ) );

/**
 * Get the CSS declarations for resolved position settings.
 *
 * @param {Object} position Resolved position settings.
 * @return {Object} Declarations keyed by property, in output order.
 */
export const getDeclarations = ( position ) => {
	const type = position?.type ?? '';
	if ( ! ALLOWED_TYPES.includes( type ) ) {
		return {};
	}

	const isPinned = PINNED_TYPES.includes( type );
	const declarations = { position: type };

	SIDES.forEach( ( side ) => {
		const raw = position[ side ];
		if ( 'string' !== typeof raw && ! Number.isInteger( raw ) ) {
			return;
		}

		let value = withUnit( String( raw ).trim() );
		if ( '' === value ) {
			return;
		}

		// Match core: keep pinned blocks below the logged-in admin bar.
		if ( 'top' === side && isPinned ) {
			value = `calc(${
				'0' === value ? '0px' : value
			} + var(--wp-admin--admin-bar--position-offset, 0px))`;
		}

		declarations[ side ] = value;
	} );

	if ( isNumeric( position.zIndex ) ) {
		declarations[ 'z-index' ] = String( Math.trunc( Number( position.zIndex ) ) );
	} else if ( isPinned ) {
		declarations[ 'z-index' ] = String( DEFAULT_PINNED_Z_INDEX );
	}

	// Out-of-flow blocks shouldn't pick up the block gap their parent gives to siblings.
	if ( OUT_OF_FLOW_TYPES.includes( type ) ) {
		declarations[ 'margin-block-start' ] = '0';
	}

	return declarations;
};

/**
 * Get the CSS rules for a block, one per viewport, or a single unscoped rule
 * when every viewport is the same. Mirrors Styles::get_rules() in PHP.
 *
 * @param {Object} style Block style attribute.
 * @return {Array<{media: string|null, declarations: Object}>} CSS rules.
 */
export const getRules = ( style ) => {
	const byViewport = Object.keys( mediaQueries ).map( ( viewport ) => [
		viewport,
		getDeclarations( resolvePosition( style, viewport ) ),
	] );

	const unique = new Set(
		byViewport.map( ( [ , declarations ] ) => JSON.stringify( declarations ) )
	);

	if ( 1 === unique.size ) {
		const [ [ , declarations ] ] = byViewport;

		return Object.keys( declarations ).length
			? [ { media: null, declarations } ]
			: [];
	}

	return byViewport
		.filter( ( [ , declarations ] ) => Object.keys( declarations ).length )
		.map( ( [ viewport, declarations ] ) => ( {
			media: mediaQueries[ viewport ],
			declarations,
		} ) );
};

/**
 * Get the position types used across all viewports.
 *
 * @param {Array} rules CSS rules from getRules().
 * @return {string[]} Position types.
 */
export const getTypes = ( rules ) => [
	...new Set( rules.map( ( { declarations } ) => declarations.position ) ),
];

/**
 * Turn CSS rules into a stylesheet for a selector.
 *
 * @param {string} selector CSS selector.
 * @param {Array}  rules    CSS rules from getRules().
 * @return {string} CSS.
 */
export const rulesToCss = ( selector, rules ) =>
	rules
		.map( ( { media, declarations } ) => {
			const css = `${ selector }{${ Object.entries( declarations )
				.map( ( [ property, value ] ) => `${ property }:${ value };` )
				.join( '' ) }}`;

			return media ? `${ media }{${ css }}` : css;
		} )
		.join( '' );

/**
 * Whether a block is taken out of normal flow (Absolute or Fixed) at any viewport.
 *
 * @param {Object} style Block style attribute.
 * @return {boolean} Whether it overlays other content.
 */
export const isOverlay = ( style ) =>
	getTypes( getRules( style ) ).some( ( type ) =>
		OUT_OF_FLOW_TYPES.includes( type )
	);

/**
 * Whether a style attribute has position settings at the base or any viewport.
 *
 * @param {Object} style Block style attribute.
 * @return {boolean} Whether it has position settings.
 */
export const hasPosition = ( style ) =>
	!! style?.position ||
	Object.keys( mediaQueries ).some(
		( viewport ) => !! style?.[ viewport ]?.position
	);

const withoutEmpty = ( object ) => {
	const next = Object.fromEntries(
		Object.entries( object ?? {} ).filter(
			( [ , value ] ) => undefined !== value
		)
	);

	return Object.keys( next ).length ? next : undefined;
};

/**
 * Merge position changes into a style object, at the base or a viewport.
 *
 * Undefined removes a key, and empty objects are removed. At the base, an
 * empty type is removed as it's the default; at a viewport it's kept, as it
 * overrides a positioned base with "Default".
 *
 * @param {Object} style    Current style attribute.
 * @param {string} viewport Viewport key, or DEFAULT_VIEWPORT for the base.
 * @param {Object} changes  Position values to merge.
 * @return {Object|undefined} New style attribute.
 */
export const setPosition = ( style, viewport, changes ) => {
	if ( isBase( viewport ) ) {
		const position = withoutEmpty( { ...style?.position, ...changes } );
		if ( position && '' === position.type ) {
			delete position.type;
		}

		return withoutEmpty( { ...style, position: withoutEmpty( position ) } );
	}

	return withoutEmpty( {
		...style,
		[ viewport ]: withoutEmpty( {
			...style?.[ viewport ],
			position: withoutEmpty( {
				...style?.[ viewport ]?.position,
				...changes,
			} ),
		} ),
	} );
};

/**
 * Remove a viewport's position overrides so it uses the desktop settings again.
 *
 * @param {Object} style    Current style attribute.
 * @param {string} viewport Viewport key.
 * @return {Object|undefined} New style attribute.
 */
export const clearViewportPosition = ( style, viewport ) =>
	withoutEmpty( {
		...style,
		[ viewport ]: withoutEmpty( {
			...style?.[ viewport ],
			position: undefined,
		} ),
	} );
