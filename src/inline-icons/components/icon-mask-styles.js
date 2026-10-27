import { useStyleOverride } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';

import { useIcons } from '../utils/use-icons';

/**
 * Turn an icon's SVG into valid XML for use as an image.
 *
 * Core's icon registry lowercases attribute names (e.g. viewBox becomes
 * viewbox). That's fine in HTML, which corrects the case, but an SVG image is
 * parsed as XML, where a lowercase viewbox is ignored and the icon can't scale.
 * Parsing as HTML and serialising as XML restores the correct names.
 *
 * @param {string} content SVG markup from the icon registry.
 * @return {string} SVG as XML, or an empty string if it isn't an SVG.
 */
const toXml = ( content ) => {
	const svg = new window.DOMParser()
		.parseFromString( content, 'text/html' )
		.querySelector( 'svg' );

	return svg ? new window.XMLSerializer().serializeToString( svg ) : '';
};

/**
 * Adds each registered icon's SVG to the editor canvas as a mask image, so
 * inline icons, which are saved as image tags without a source, can be drawn
 * in the editor.
 *
 * @return {null} Nothing; the CSS goes into the canvas.
 */
export const IconMaskStyles = () => {
	const { icons } = useIcons();

	const css = useMemo(
		() =>
			icons
				?.map(
					( { name, content } ) =>
						`.wp-inline-icon[data-icon="${ name }"]{--wp-inline-icon--mask:url("data:image/svg+xml,${ encodeURIComponent(
							toXml( content )
						) }")}`
				)
				.join( '' ),
		[ icons ]
	);

	useStyleOverride( { css } );

	return null;
};
