<?php
/**
 * Plugin Name:       Core Blocks Plus
 * Description:       Extra options for WordPress's core blocks: flex sizing, responsive positioning, inline icons and linked Groups.
 * Version:           0.1.0
 * Requires at least: 7.1
 * Requires PHP:      8.3
 * Author:            Ben Chandler
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       core-blocks-plus
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Composer's autoloader may not be loaded on the host site, so register our own.
spl_autoload_register(
	static function ( string $class ): void {
		$prefix = __NAMESPACE__ . '\\';
		if ( ! str_starts_with( $class, $prefix ) ) {
			return;
		}

		$file = __DIR__ . '/App/' . str_replace( '\\', '/', substr( $class, strlen( $prefix ) ) ) . '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}
);

Plugin::register( __FILE__ );
