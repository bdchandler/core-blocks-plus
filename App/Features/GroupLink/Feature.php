<?php
/**
 * Feature class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\GroupLink;

/**
 * Feature class - Clickable Group, Column and Cover blocks.
 */
final class Feature {

	/**
	 * Register the feature.
	 *
	 * @return void
	 */
	public static function register(): void {
		Attributes::register();
		Assets::register();
		Render::register();
	}
}
