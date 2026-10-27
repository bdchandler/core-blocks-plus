<?php
/**
 * Plugin class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus;

/**
 * Plugin class - boots the enabled features and provides shared paths and assets.
 */
final class Plugin {

	public const TEXT_DOMAIN = 'core-blocks-plus';

	/**
	 * Absolute path to the main plugin file.
	 *
	 * @var string
	 */
	private static string $file = '';

	/**
	 * Register the plugin.
	 *
	 * Features are booted on `after_setup_theme`, so a theme's functions.php can
	 * turn features off with the `core_blocks_plus_features` filter. That's still
	 * before `init`, when core registers its blocks.
	 *
	 * @param  string $file Absolute path to the main plugin file.
	 * @return void
	 */
	public static function register( string $file ): void {
		self::$file = $file;

		add_action( 'after_setup_theme', [ Features::class, 'boot' ], 100 );
		add_action( 'admin_notices', [ LegacyPlugins::class, 'render_notice' ] );
	}

	/**
	 * Get the absolute path to a file within the plugin.
	 *
	 * @param  string $relative_path Path relative to the plugin root.
	 * @return string
	 */
	public static function path( string $relative_path = '' ): string {
		return plugin_dir_path( self::$file ) . ltrim( $relative_path, '/' );
	}

	/**
	 * Get the URL to a file within the plugin.
	 *
	 * @param  string $relative_path Path relative to the plugin root.
	 * @return string
	 */
	public static function url( string $relative_path = '' ): string {
		return plugin_dir_url( self::$file ) . ltrim( $relative_path, '/' );
	}

	/**
	 * Get the generated asset metadata for a build entry, e.g. 'flex/editor'.
	 *
	 * @param  string $entry Build entry name.
	 * @return array{dependencies: string[], version: string|false}
	 */
	public static function get_asset( string $entry ): array {
		$file = self::path( "build/{$entry}.asset.php" );

		$asset = is_readable( $file ) ? require $file : [];

		return [
			'dependencies' => $asset['dependencies'] ?? [],
			'version'      => $asset['version'] ?? false,
		];
	}
}
