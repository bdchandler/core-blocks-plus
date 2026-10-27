<?php
/**
 * Feature class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Flex;

/**
 * Feature class - Flex sizing: "Don't squash" for Row children and "Column sizing" for Columns.
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
