<?php
/**
 * Viewports class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Shared;

use WP_Theme_JSON;

/**
 * Viewports class - the site's responsive breakpoints, as used by core's responsive editing.
 *
 * Each viewport is a separate, non-overlapping range (e.g. tablet does not include mobile),
 * matching how core applies its own viewport overrides.
 */
final class Viewports {

	public const DESKTOP = '@desktop';

	/**
	 * Media queries keyed by viewport, cached per request.
	 *
	 * @var array<string, string>|null
	 */
	private static ?array $media_queries = null;

	/**
	 * Get the media query for each viewport, keyed by '@mobile', '@tablet' and '@desktop'.
	 *
	 * @return array<string, string>
	 */
	public static function get_media_queries(): array {
		if ( null === self::$media_queries ) {
			$settings = wp_get_global_settings( [ 'viewport' ] );

			self::$media_queries = WP_Theme_JSON::get_viewport_media_queries(
				is_array( $settings ) ? $settings : null,
				[ 'include_desktop' => true ]
			);
		}

		return self::$media_queries;
	}

	/**
	 * Get the viewport keys.
	 *
	 * @return string[]
	 */
	public static function get_keys(): array {
		return array_keys( self::get_media_queries() );
	}

	/**
	 * Get the class name suffix for a viewport, e.g. '@mobile' becomes 'mobile'.
	 *
	 * @param  string $viewport Viewport key.
	 * @return string
	 */
	public static function get_suffix( string $viewport ): string {
		return ltrim( $viewport, '@' );
	}
}
