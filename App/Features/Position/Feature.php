<?php
/**
 * Feature class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Position;

/**
 * Feature class - Responsive Relative, Sticky, Absolute and Fixed positioning, with inset and layer.
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
