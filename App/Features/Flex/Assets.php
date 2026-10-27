<?php
/**
 * Assets class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Flex;

use BDChandler\CoreBlocksPlus\Plugin;
use BDChandler\CoreBlocksPlus\Shared\Viewports;

/**
 * Assets class - registers and enqueues the editor script.
 */
final class Assets {

	public const HANDLE = 'core-blocks-plus-flex';

	/**
	 * Register all asset hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_action( 'enqueue_block_editor_assets', [ self::class, 'enqueue_editor_script' ] );
	}

	/**
	 * Enqueue the editor controls.
	 *
	 * @return void
	 */
	public static function enqueue_editor_script(): void {
		$asset = Plugin::get_asset( 'flex/editor' );

		wp_enqueue_script(
			self::HANDLE . '-editor',
			Plugin::url( 'build/flex/editor.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( self::HANDLE . '-editor', Plugin::TEXT_DOMAIN );

		// The editor builds the same CSS as Render, so it needs the same media queries.
		wp_add_inline_script(
			self::HANDLE . '-editor',
			'window.coreBlocksPlus = window.coreBlocksPlus || {}; window.coreBlocksPlus.flex = ' . wp_json_encode( [ 'mediaQueries' => Viewports::get_media_queries() ] ) . ';',
			'before'
		);
	}
}
