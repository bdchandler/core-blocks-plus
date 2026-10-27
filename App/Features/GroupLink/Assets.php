<?php
/**
 * Assets class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\GroupLink;

use BDChandler\CoreBlocksPlus\Plugin;

/**
 * Assets class - registers and enqueues the editor script and link styles.
 */
final class Assets {

	public const HANDLE = 'core-blocks-plus-group-link';

	/**
	 * Register all asset hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_action( 'init', [ self::class, 'register_style' ] );
		add_action( 'enqueue_block_editor_assets', [ self::class, 'enqueue_editor_script' ] );
		add_action( 'enqueue_block_assets', [ self::class, 'enqueue_editor_canvas_style' ] );
	}

	/**
	 * Register the link stylesheet, enqueued on demand by Render.
	 *
	 * @return void
	 */
	public static function register_style(): void {
		$asset = Plugin::get_asset( 'group-link/frontend' );

		wp_register_style( self::HANDLE, Plugin::url( 'build/group-link/frontend.css' ), [], $asset['version'] );
	}

	/**
	 * Enqueue the link stylesheet.
	 *
	 * @return void
	 */
	public static function enqueue_style(): void {
		wp_enqueue_style( self::HANDLE );
	}

	/**
	 * Enqueue the link styles inside the editor canvas, so linked blocks are
	 * positioned the same as on the front end.
	 *
	 * @return void
	 */
	public static function enqueue_editor_canvas_style(): void {
		if ( is_admin() ) {
			self::enqueue_style();
		}
	}

	/**
	 * Enqueue the editor controls and their styles.
	 *
	 * @return void
	 */
	public static function enqueue_editor_script(): void {
		$asset = Plugin::get_asset( 'group-link/editor' );

		wp_enqueue_script(
			self::HANDLE . '-editor',
			Plugin::url( 'build/group-link/editor.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( self::HANDLE . '-editor', Plugin::TEXT_DOMAIN );

		wp_enqueue_style( self::HANDLE . '-editor', Plugin::url( 'build/group-link/editor.css' ), [ 'wp-components' ], $asset['version'] );
	}
}
