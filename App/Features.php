<?php
/**
 * Features class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus;

/**
 * Features class - decides which features are on, and registers them.
 *
 * All features are on by default. A feature can be turned off in two ways:
 *
 *     // wp-config.php, per site. Takes priority over the filter.
 *     define( 'CORE_BLOCKS_PLUS_DISABLE_POSITION', true );
 *
 *     // A theme's functions.php, or another plugin.
 *     add_filter( 'core_blocks_plus_features', fn ( $features ) => array_diff( $features, [ 'inline-icons' ] ) );
 *
 * A feature that's off registers nothing and loads no code. None of the
 * features change saved block markup, so turning one off just stops its
 * styling applying, and turning it back on restores it.
 */
final class Features {

	/**
	 * Feature slugs and the class that registers each one.
	 *
	 * @var array<string, class-string>
	 */
	public const ALL = [
		'flex'         => Features\Flex\Feature::class,
		'position'     => Features\Position\Feature::class,
		'inline-icons' => Features\InlineIcons\Feature::class,
		'group-link'   => Features\GroupLink\Feature::class,
	];

	/**
	 * Enabled feature slugs, worked out once per request.
	 *
	 * @var string[]|null
	 */
	private static ?array $enabled = null;

	/**
	 * Register each enabled feature.
	 *
	 * @return void
	 */
	public static function boot(): void {
		foreach ( self::get_enabled() as $slug ) {
			( self::ALL[ $slug ] )::register();
		}
	}

	/**
	 * Get the enabled feature slugs.
	 *
	 * @return string[]
	 */
	public static function get_enabled(): array {
		if ( null !== self::$enabled ) {
			return self::$enabled;
		}

		/**
		 * Filters which Core Blocks Plus features are enabled.
		 *
		 * @param string[] $features Feature slugs: 'flex', 'position', 'inline-icons' and 'group-link'.
		 */
		$features = apply_filters( 'core_blocks_plus_features', array_keys( self::ALL ) );
		$features = is_array( $features ) ? $features : [];

		self::$enabled = array_values(
			array_filter(
				array_keys( self::ALL ),
				static fn ( string $slug ): bool => in_array( $slug, $features, true )
					&& ! self::is_disabled_by_constant( $slug )
					&& ! LegacyPlugins::is_active( $slug )
			)
		);

		return self::$enabled;
	}

	/**
	 * Whether a feature is enabled.
	 *
	 * @param  string $slug Feature slug.
	 * @return bool
	 */
	public static function is_enabled( string $slug ): bool {
		return in_array( $slug, self::get_enabled(), true );
	}

	/**
	 * Get the constant that turns a feature off, e.g. CORE_BLOCKS_PLUS_DISABLE_INLINE_ICONS.
	 *
	 * @param  string $slug Feature slug.
	 * @return string
	 */
	public static function get_constant_name( string $slug ): string {
		return 'CORE_BLOCKS_PLUS_DISABLE_' . strtoupper( str_replace( '-', '_', $slug ) );
	}

	/**
	 * Whether a feature is turned off by its wp-config.php constant.
	 *
	 * @param  string $slug Feature slug.
	 * @return bool
	 */
	private static function is_disabled_by_constant( string $slug ): bool {
		$constant = self::get_constant_name( $slug );

		return defined( $constant ) && (bool) constant( $constant );
	}
}
