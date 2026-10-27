/**
 * An inline icon is saved as an image tag naming its icon, like core's inline
 * image, with any settings in its style attribute, e.g.
 *
 *     <img class="wp-inline-icon" data-icon="gdr/download" alt=""
 *         style="--wp-inline-icon--size:24px;--wp-inline-icon--color:var(--wp--preset--color--primary)">
 *
 * Rich text saves inline objects as void tags, so it has to be an img. The
 * front end replaces it with the icon's SVG. Everything here is allowed for
 * all users by WordPress's HTML filtering.
 */

export const SIZE_VAR = '--wp-inline-icon--size';
export const COLOR_VAR = '--wp-inline-icon--color';
export const HOVER_COLOR_VAR = '--wp-inline-icon--hover-color';

/**
 * Read the settings from an inline icon's style attribute.
 *
 * @param {string} style Style attribute.
 * @return {{width: number|undefined, color: string|undefined, hoverColor: string|undefined}} Settings.
 */
export const parseStyle = ( style = '' ) => {
	const declarations = Object.fromEntries(
		style
			.split( ';' )
			.map( ( declaration ) => {
				const index = declaration.indexOf( ':' );
				if ( index < 0 ) {
					return null;
				}

				return [
					declaration.slice( 0, index ).trim(),
					declaration.slice( index + 1 ).trim(),
				];
			} )
			.filter( Boolean )
	);

	return {
		width: parseInt( declarations[ SIZE_VAR ], 10 ) || undefined,
		color: declarations[ COLOR_VAR ] || undefined,
		hoverColor: declarations[ HOVER_COLOR_VAR ] || undefined,
	};
};

/**
 * Build an inline icon's style attribute, in the same format WordPress's
 * HTML filtering outputs so saved content doesn't change when it's filtered.
 *
 * @param {Object} settings            Settings.
 * @param {number} settings.width      Width (and height) in pixels.
 * @param {string} settings.color      Icon colour.
 * @param {string} settings.hoverColor Icon hover colour.
 * @return {string|undefined} Style attribute, or undefined when empty.
 */
export const buildStyle = ( { width, color, hoverColor } ) =>
	[
		width && `${ SIZE_VAR }:${ width }px`,
		color && `${ COLOR_VAR }:${ color }`,
		hoverColor && `${ HOVER_COLOR_VAR }:${ hoverColor }`,
	]
		.filter( Boolean )
		.join( ';' ) || undefined;

/**
 * Get the rich text attributes for an inline icon. The label is saved as the
 * image's alt text; empty means the icon is decorative.
 *
 * @param {Object} settings         Icon settings, plus width, color and hoverColor for buildStyle().
 * @param {string} settings.icon    Icon name, e.g. "gdr/download".
 * @param {string} settings.label   Accessible label; empty for a decorative icon.
 * @param {string} settings.classes Any other classes on the icon, kept as they are.
 * @return {Object} Format attributes.
 */
export const getIconAttributes = ( {
	icon,
	label,
	classes,
	...styleSettings
} ) => {
	const attributes = { icon, alt: label ?? '' };

	if ( classes ) {
		attributes.className = classes;
	}

	const style = buildStyle( styleSettings );
	if ( style ) {
		attributes.style = style;
	}

	return attributes;
};

/**
 * Read an inline icon's settings from its rich text attributes.
 *
 * @param {Object} attributes Format attributes.
 * @return {Object} Icon name, label, other classes, width, colour and hover colour.
 */
export const readIconAttributes = ( attributes = {} ) => ( {
	icon: attributes.icon,
	label: attributes.alt ?? '',
	classes: attributes.className ?? '',
	...parseStyle( attributes.style ),
} );
