import { DEFAULT_VIEWPORT } from '../../shared/use-editing-viewport';

// "Don't squash" is responsive, so it lives in core's style attribute
// (style.flexSizing, style['@mobile'].flexSizing, ...), the same way core
// stores its own responsive Width setting.
export const STYLE_KEY = 'flexSizing';

// Column sizing isn't responsive, so it's a plain attribute, like core's column width.
export const COLUMN_SIZING = 'columnSizing';

// Re-exported for this feature's controls; defined with the shared viewport hook.
export { DEFAULT_VIEWPORT };
const DESKTOP = '@desktop';

// Media queries keyed by viewport ('@mobile', '@tablet', '@desktop'), from Assets.php.
const MEDIA_QUERIES = window.coreBlocksPlus?.flex?.mediaQueries ?? {};
const VIEWPORTS = Object.keys( MEDIA_QUERIES );

// Core's Columns breakpoint, where columns stop stacking (hardcoded in core's CSS).
const COLUMNS_MEDIA = '@media (min-width: 782px)';

const NO_SHRINK = { 'flex-shrink': '0', 'max-width': '100%' };

const COLUMN_FIT = {
	'flex-grow': '0',
	'flex-shrink': '0',
	'flex-basis': 'auto',
	'max-width': '100%',
};

const rule = ( selector, media, declarations ) => ( {
	selector,
	media,
	declarations,
} );

/**
 * Get core's Width setting ("selfStretch") at a viewport. Core stores null to
 * mean "cleared at this viewport", which falls back to Fit.
 *
 * @param {Object} style    Block style attribute.
 * @param {string} viewport Viewport key.
 * @return {string} selfStretch value.
 */
export const getSelfStretch = ( style, viewport ) => {
	const viewportLayout = style?.[ viewport ]?.layout;

	if ( viewportLayout && 'selfStretch' in viewportLayout ) {
		return viewportLayout.selfStretch ?? 'fit';
	}

	return style?.layout?.selfStretch ?? 'fit';
};

/**
 * Get the "Don't squash" value at a viewport; viewport values override the base.
 *
 * @param {Object} style    Block style attribute.
 * @param {string} viewport Viewport key.
 * @return {boolean} Whether it's switched on.
 */
export const getNoShrink = ( style, viewport ) =>
	style?.[ viewport ]?.[ STYLE_KEY ]?.noShrink ??
	!! style?.[ STYLE_KEY ]?.noShrink;

/**
 * Whether "Don't squash" is saved at exactly this viewport (not inherited).
 *
 * @param {Object} style    Block style attribute.
 * @param {string} viewport Viewport key.
 * @return {boolean} Whether a value is saved.
 */
export const hasNoShrinkValue = ( style, viewport ) =>
	DEFAULT_VIEWPORT === viewport
		? !! style?.[ STYLE_KEY ]?.noShrink
		: undefined !== style?.[ viewport ]?.[ STYLE_KEY ]?.noShrink;

const isNoShrink = ( style, viewport ) =>
	getNoShrink( style, viewport ) && 'fit' === getSelfStretch( style, viewport );

/**
 * Get the CSS rules for a block, with `&` in each selector for the block's
 * own class. Mirrors Styles::get_rules() in PHP.
 *
 * @param {string} name       Block name.
 * @param {Object} attributes Block attributes.
 * @return {Array<{selector: string, media: string|null, declarations: Object}>} CSS rules.
 */
export const getRules = ( name, attributes ) => {
	// Selectors match core's columns rules so these win, and stacking on mobile
	// still works. A width set in the column's own settings takes precedence.
	if ( 'core/column' === name ) {
		if ( 'fit' !== attributes?.[ COLUMN_SIZING ] || attributes.width ) {
			return [];
		}

		return [
			rule(
				'.wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column&',
				COLUMNS_MEDIA,
				COLUMN_FIT
			),
			rule(
				'.wp-block-columns.is-not-stacked-on-mobile > .wp-block-column&',
				null,
				COLUMN_FIT
			),
		];
	}

	const style = attributes?.style;
	const hasSetting =
		!! style?.[ STYLE_KEY ] ||
		VIEWPORTS.some( ( viewport ) => !! style?.[ viewport ]?.[ STYLE_KEY ] );

	if ( ! hasSetting ) {
		return [];
	}

	// Scoped to flex parents, so it has no effect if the block is moved elsewhere.
	const selector = '.is-layout-flex > &';
	const active = VIEWPORTS.filter( ( viewport ) =>
		isNoShrink( style, DESKTOP === viewport ? DEFAULT_VIEWPORT : viewport )
	);

	// One unscoped rule when it applies everywhere, otherwise one per viewport.
	if ( active.length === VIEWPORTS.length ) {
		return [ rule( selector, null, NO_SHRINK ) ];
	}

	return active.map( ( viewport ) =>
		rule( selector, MEDIA_QUERIES[ viewport ], NO_SHRINK )
	);
};

/**
 * Turn CSS rules into a stylesheet for a block's class.
 *
 * @param {string} className Block's class name.
 * @param {Array}  rules     CSS rules from getRules().
 * @return {string} CSS.
 */
export const rulesToCss = ( className, rules ) =>
	rules
		.map( ( { selector, media, declarations } ) => {
			const css = `${ selector.replace( '&', `.${ className }` ) }{${ Object.entries(
				declarations
			)
				.map( ( [ property, value ] ) => `${ property }:${ value };` )
				.join( '' ) }}`;

			return media ? `${ media }{${ css }}` : css;
		} )
		.join( '' );

const withoutEmpty = ( object ) => {
	const next = Object.fromEntries(
		Object.entries( object ?? {} ).filter(
			( [ , value ] ) => undefined !== value
		)
	);

	return Object.keys( next ).length ? next : undefined;
};

/**
 * Set "Don't squash" in a style object, at the base or a viewport.
 *
 * Empty objects are removed so untouched blocks don't save them. At the base,
 * false is removed as it's the default; at a viewport it's kept, as it
 * overrides a base value of true.
 *
 * @param {Object}            style    Current style attribute.
 * @param {string}            viewport Viewport key, or DEFAULT_VIEWPORT for the base.
 * @param {boolean|undefined} value    Value to set; undefined removes it.
 * @return {Object|undefined} New style attribute.
 */
export const setNoShrink = ( style, viewport, value ) => {
	if ( DEFAULT_VIEWPORT === viewport ) {
		return withoutEmpty( {
			...style,
			[ STYLE_KEY ]: withoutEmpty( {
				...style?.[ STYLE_KEY ],
				noShrink: value || undefined,
			} ),
		} );
	}

	return withoutEmpty( {
		...style,
		[ viewport ]: withoutEmpty( {
			...style?.[ viewport ],
			[ STYLE_KEY ]: withoutEmpty( {
				...style?.[ viewport ]?.[ STYLE_KEY ],
				noShrink: value,
			} ),
		} ),
	} );
};
