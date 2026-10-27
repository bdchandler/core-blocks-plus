<?php
/**
 * Styles class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Position;

use BDChandler\CoreBlocksPlus\Shared\Viewports;

/**
 * Styles class - turns a block's position settings into CSS rules.
 *
 * Settings use core's `style.position` shape plus `zIndex`, with viewport
 * overrides at `style['@mobile'].position` and `style['@tablet'].position`:
 *
 *     "style": {
 *         "position": { "type": "absolute", "top": "1rem", "right": "1rem", "zIndex": 5 },
 *         "@mobile": { "position": { "type": "" } }
 *     }
 *
 * The logic mirrors src/utils/position.js, which builds the same rules in the editor.
 */
final class Styles {

	public const SIDES = [ 'top', 'right', 'bottom', 'left' ];

	/**
	 * Position types that create a positioning context and can use inset and z-index.
	 */
	public const TYPES = [ 'relative', 'sticky', 'absolute', 'fixed' ];

	/**
	 * Core's default z-index for sticky and fixed blocks, kept so existing content doesn't change.
	 */
	private const DEFAULT_PINNED_Z_INDEX = 10;

	/**
	 * Get the position types the site allows, matching the rules core uses for sticky and fixed.
	 *
	 * @return string[]
	 */
	public static function get_allowed_types(): array {
		$settings = wp_get_global_settings( [ 'position' ] );
		$settings = is_array( $settings ) ? $settings : [];

		return array_values(
			array_filter(
				self::TYPES,
				static fn ( string $type ): bool => match ( $type ) {
					'sticky', 'fixed' => true === ( $settings[ $type ] ?? false ),
					default           => true,
				}
			)
		);
	}

	/**
	 * Get the effective position settings at a viewport.
	 *
	 * Viewport values replace the base (desktop) values: the type and z-index
	 * individually, and the four sides as a set, so a viewport can switch from
	 * e.g. top/left to bottom/right without inheriting the base sides.
	 *
	 * @param  array<string, mixed> $style    The block's style attribute.
	 * @param  string               $viewport Viewport key, e.g. '@mobile'.
	 * @return array<string, mixed>
	 */
	public static function resolve( array $style, string $viewport ): array {
		$base = is_array( $style['position'] ?? null ) ? $style['position'] : [];

		if ( Viewports::DESKTOP === $viewport ) {
			return $base;
		}

		$override = $style[ $viewport ]['position'] ?? null;
		if ( ! is_array( $override ) ) {
			return $base;
		}

		$resolved = $base;
		foreach ( [ 'type', 'zIndex' ] as $key ) {
			if ( array_key_exists( $key, $override ) ) {
				$resolved[ $key ] = $override[ $key ];
			}
		}

		if ( array_intersect( self::SIDES, array_keys( $override ) ) ) {
			foreach ( self::SIDES as $side ) {
				$resolved[ $side ] = $override[ $side ] ?? null;
			}
		}

		return $resolved;
	}

	/**
	 * Get the CSS declarations for resolved position settings.
	 *
	 * @param  array<string, mixed> $position      Resolved position settings.
	 * @param  string[]             $allowed_types Position types the site allows.
	 * @return array<string, string>
	 */
	public static function get_declarations( array $position, array $allowed_types ): array {
		$type = $position['type'] ?? '';
		if ( ! is_string( $type ) || ! in_array( $type, $allowed_types, true ) ) {
			return [];
		}

		$is_pinned    = in_array( $type, [ 'sticky', 'fixed' ], true );
		$declarations = [ 'position' => $type ];

		foreach ( self::SIDES as $side ) {
			$value = $position[ $side ] ?? null;
			if ( ! is_string( $value ) && ! is_int( $value ) ) {
				continue;
			}

			$value = self::with_unit( trim( (string) $value ) );
			if ( '' === $value ) {
				continue;
			}

			// Match core: keep pinned blocks below the logged-in admin bar.
			if ( 'top' === $side && $is_pinned ) {
				$value = 'calc(' . ( '0' === $value ? '0px' : $value ) . ' + var(--wp-admin--admin-bar--position-offset, 0px))';
			}

			$declarations[ $side ] = $value;
		}

		$z_index = $position['zIndex'] ?? null;
		if ( is_numeric( $z_index ) ) {
			$declarations['z-index'] = (string) (int) $z_index;
		} elseif ( $is_pinned ) {
			$declarations['z-index'] = (string) self::DEFAULT_PINNED_Z_INDEX;
		}

		// Out-of-flow blocks shouldn't pick up the block gap their parent gives to siblings.
		if ( in_array( $type, [ 'absolute', 'fixed' ], true ) ) {
			$declarations['margin-block-start'] = '0';
		}

		return $declarations;
	}

	/**
	 * Add px to a bare number, as BoxControl's slider saves e.g. "10" before a unit
	 * has been chosen. Zero stays unitless. Mirrors withUnit() in src/utils/position.js.
	 *
	 * @param  string $value Inset value.
	 * @return string
	 */
	public static function with_unit( string $value ): string {
		return preg_match( '/^-?(\d+\.?\d*|\.\d+)$/', $value ) && 0.0 !== (float) $value ? "{$value}px" : $value;
	}

	/**
	 * Get the CSS rules for a block, one per viewport, or a single unscoped rule
	 * when every viewport is the same.
	 *
	 * @param  array<string, mixed>  $style         The block's style attribute.
	 * @param  array<string, string> $media_queries Media queries keyed by viewport.
	 * @param  string[]              $allowed_types Position types the site allows.
	 * @return array<int, array{media: string|null, declarations: array<string, string>}>
	 */
	public static function get_rules( array $style, array $media_queries, array $allowed_types ): array {
		$by_viewport = [];
		foreach ( array_keys( $media_queries ) as $viewport ) {
			$by_viewport[ $viewport ] = self::get_declarations( self::resolve( $style, $viewport ), $allowed_types );
		}

		$unique = array_unique( array_map( 'wp_json_encode', $by_viewport ) );
		if ( 1 === count( $unique ) ) {
			$declarations = reset( $by_viewport );

			return empty( $declarations ) ? [] : [
				[
					'media'        => null,
					'declarations' => $declarations,
				],
			];
		}

		$rules = [];
		foreach ( $by_viewport as $viewport => $declarations ) {
			if ( ! empty( $declarations ) ) {
				$rules[] = [
					'media'        => $media_queries[ $viewport ],
					'declarations' => $declarations,
				];
			}
		}

		return $rules;
	}

	/**
	 * Get the position types used across all viewports.
	 *
	 * @param  array<int, array{media: string|null, declarations: array<string, string>}> $rules CSS rules.
	 * @return string[]
	 */
	public static function get_types( array $rules ): array {
		return array_values( array_unique( array_column( array_column( $rules, 'declarations' ), 'position' ) ) );
	}
}
