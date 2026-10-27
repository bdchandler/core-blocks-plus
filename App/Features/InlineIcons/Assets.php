<?php
/**
 * Assets class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\InlineIcons;

use BDChandler\CoreBlocksPlus\Plugin;

/**
 * Assets class - registers and enqueues the editor script and inline icon styles.
 */
final class Assets {

	public const HANDLE = 'core-blocks-plus-inline-icons';

	/**
	 * Register all asset hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_action( 'init', [ self::class, 'register_style' ] );
		add_action( 'enqueue_block_editor_assets', [ self::class, 'enqueue_editor_assets' ] );
		add_action( 'enqueue_block_assets', [ self::class, 'enqueue_editor_canvas_styles' ] );
	}

	/**
	 * Register the inline icon stylesheet, enqueued on demand by Render.
	 *
	 * @return void
	 */
	public static function register_style(): void {
		$asset = Plugin::get_asset( 'inline-icons/frontend' );

		wp_register_style( self::HANDLE, Plugin::url( 'build/inline-icons/frontend.css' ), [], $asset['version'] );
	}

	/**
	 * Enqueue the inline icon stylesheet.
	 *
	 * @return void
	 */
	public static function enqueue_style(): void {
		wp_enqueue_style( self::HANDLE );
	}

	/**
	 * Enqueue the editor script and the styles for its controls.
	 *
	 * @return void
	 */
	public static function enqueue_editor_assets(): void {
		$asset = Plugin::get_asset( 'inline-icons/editor' );

		wp_enqueue_script(
			self::HANDLE . '-editor',
			Plugin::url( 'build/inline-icons/editor.js' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( self::HANDLE . '-editor', Plugin::TEXT_DOMAIN );

		wp_enqueue_style( self::HANDLE . '-editor', Plugin::url( 'build/inline-icons/editor.css' ), [ 'wp-components' ], $asset['version'] );
	}

	/**
	 * Enqueue the icon styles inside the editor canvas, plus the editor-only preview styles.
	 *
	 * @return void
	 */
	public static function enqueue_editor_canvas_styles(): void {
		if ( ! is_admin() ) {
			return;
		}

		$asset = Plugin::get_asset( 'inline-icons/editor-canvas' );

		self::enqueue_style();
		wp_enqueue_style( self::HANDLE . '-editor-canvas', Plugin::url( 'build/inline-icons/editor-canvas.css' ), [ self::HANDLE ], $asset['version'] );
	}
}
