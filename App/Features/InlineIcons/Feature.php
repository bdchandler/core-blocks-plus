<?php
/**
 * Feature class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\InlineIcons;

/**
 * Feature class - Inline icons from the WordPress icon library in rich text.
 */
final class Feature {

	/**
	 * Register the feature.
	 *
	 * @return void
	 */
	public static function register(): void {
		Assets::register();
		Render::register();
	}
}
