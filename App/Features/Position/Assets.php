<?php
/**
 * Assets class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Position;

use BDChandler\CoreBlocksPlus\Plugin;
use BDChandler\CoreBlocksPlus\Shared\Viewports;

/**
 * Assets class - registers and enqueues the editor script and editor canvas styles.
 */
final class Assets {

	public const HANDLE = 'core-blocks-plus-position';

	/**
	 * Register all asset hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_action( 'enqueue_block_editor_assets', [ self::class, 'enqueue_editor_script' ] );
		add_action( 'enqueue_block_assets', [ self::class, 'enqueue_editor_canvas_style' ] );
	}

	/**
	 * Enqueue the editor controls.
	 *
	 * @return void
	 */
	public static function enqueue_editor_script(): void {
		$asset = Plugin::get_asset( 'position/editor' );

		wp_enqueue_script(
			self::HANDLE . '-editor',
			Plugin::url( 'build/position/editor.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( self::HANDLE . '-editor', Plugin::TEXT_DOMAIN );

		// The editor builds the same CSS as Render, so it needs the same viewports and allowed types.
		wp_add_inline_script(
			self::HANDLE . '-editor',
			'window.coreBlocksPlus = window.coreBlocksPlus || {}; window.coreBlocksPlus.position = ' . wp_json_encode(
				[
					'mediaQueries' => Viewports::get_media_queries(),
					'allowedTypes' => Styles::get_allowed_types(),
				]
			) . ';',
			'before'
		);
	}

	/**
	 * Enqueue editor-only helper styles inside the editor canvas.
	 *
	 * @return void
	 */
	public static function enqueue_editor_canvas_style(): void {
		if ( ! is_admin() ) {
			return;
		}

		$asset = Plugin::get_asset( 'position/editor-canvas' );

		wp_enqueue_style( self::HANDLE . '-editor-canvas', Plugin::url( 'build/position/editor-canvas.css' ), [], $asset['version'] );
	}
}
