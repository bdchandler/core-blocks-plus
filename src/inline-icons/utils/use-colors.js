// Core's colour controls use this for theme, default and custom palettes; there is no stable equivalent yet.
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients } from '@wordpress/block-editor';

// Matches how core names preset variables, e.g. "accent2" becomes "accent-2".
const kebabCase = ( slug ) =>
	slug
		.replace( /([a-z])([A-Z0-9])/g, '$1-$2' )
		.replace( /[\s_]+/g, '-' )
		.toLowerCase();

const PRESET_PATTERN = /^var\(--wp--preset--color--(.+)\)$/;

/**
 * Get the editor's colour palettes, and convert between the colours they show
 * and the values saved on an icon.
 *
 * Palette colours are saved as their preset variable, so changing the palette
 * in theme.json updates existing icons.
 *
 * @return {{palettes: Array, toSaved: Function, toDisplayed: Function}} Palettes and converters.
 */
export const useColors = () => {
	const { colors: palettes = [] } = useMultipleOriginColorsAndGradients();
	const colors = palettes.flatMap( ( palette ) => palette.colors ?? [] );

	const toSaved = ( value ) => {
		if ( ! value ) {
			return undefined;
		}

		const preset = colors.find( ( { color } ) => color === value );

		return preset
			? `var(--wp--preset--color--${ kebabCase( preset.slug ) })`
			: value;
	};

	const toDisplayed = ( value ) => {
		const [ , slug ] = value?.match( PRESET_PATTERN ) ?? [];
		if ( ! slug ) {
			return value;
		}

		return colors.find( ( preset ) => kebabCase( preset.slug ) === slug )
			?.color;
	};

	return { palettes, toSaved, toDisplayed };
};
