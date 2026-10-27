<?php
/**
 * Styles class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Flex;

use BDChandler\CoreBlocksPlus\Shared\Viewports;

/**
 * Styles class - turns a block's sizing settings into CSS rules.
 *
 * Each rule's selector uses `&` for the block's own generated class. The logic
 * mirrors src/utils/flex-sizing.js, which builds the same rules in the editor.
 */
final class Styles {

	/**
	 * Core's Columns breakpoint, where columns stop stacking (hardcoded in core's CSS).
	 */
	private const COLUMNS_MEDIA = '@media (min-width: 782px)';

	private const NO_SHRINK = [
		'flex-shrink' => '0',
		'max-width'   => '100%',
	];

	private const COLUMN_FIT = [
		'flex-grow'   => '0',
		'flex-shrink' => '0',
		'flex-basis'  => 'auto',
		'max-width'   => '100%',
	];

	/**
	 * Get the CSS rules for a block.
	 *
	 * @param  string                $block_name    Block name.
	 * @param  array<string, mixed>  $attrs         Block attributes.
	 * @param  array<string, string> $media_queries Media queries keyed by viewport.
	 * @return array<int, array{selector: string, media: string|null, declarations: array<string, string>}>
	 */
	public static function get_rules( string $block_name, array $attrs, array $media_queries ): array {
		if ( 'core/column' === $block_name ) {
			return self::get_column_rules( $attrs );
		}

		$style = is_array( $attrs['style'] ?? null ) ? $attrs['style'] : [];
		if ( ! self::has_no_shrink_setting( $style, array_keys( $media_queries ) ) ) {
			return [];
		}

		// Scoped to flex parents, so it has no effect if the block is moved elsewhere.
		$selector = '.is-layout-flex > &';
		$active   = array_filter(
			$media_queries,
			static fn ( string $viewport ): bool => self::is_no_shrink( $style, $viewport ),
			ARRAY_FILTER_USE_KEY
		);

		// One unscoped rule when it applies everywhere, otherwise one per viewport.
		if ( count( $active ) === count( $media_queries ) ) {
			return [ self::rule( $selector, null, self::NO_SHRINK ) ];
		}

		return array_values(
			array_map(
				static fn ( string $media ): array => self::rule( $selector, $media, self::NO_SHRINK ),
				$active
			)
		);
	}

	/**
	 * Get the rules for a Column set to "Fit content".
	 *
	 * Selectors match core's columns rules so these win, and stacking on mobile still works.
	 * A width set in the column's own settings takes precedence.
	 *
	 * @param  array<string, mixed> $attrs Block attributes.
	 * @return array<int, array{selector: string, media: string|null, declarations: array<string, string>}>
	 */
	private static function get_column_rules( array $attrs ): array {
		if ( 'fit' !== ( $attrs[ Attributes::COLUMN_SIZING ] ?? null ) || ! empty( $attrs['width'] ) ) {
			return [];
		}

		return [
			self::rule( '.wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column&', self::COLUMNS_MEDIA, self::COLUMN_FIT ),
			self::rule( '.wp-block-columns.is-not-stacked-on-mobile > .wp-block-column&', null, self::COLUMN_FIT ),
		];
	}

	/**
	 * Build a rule.
	 *
	 * @param  string                $selector     Selector, with `&` for the block's class.
	 * @param  string|null           $media        Media query, or null for none.
	 * @param  array<string, string> $declarations CSS declarations.
	 * @return array{selector: string, media: string|null, declarations: array<string, string>}
	 */
	private static function rule( string $selector, ?string $media, array $declarations ): array {
		return [
			'selector'     => $selector,
			'media'        => $media,
			'declarations' => $declarations,
		];
	}

	/**
	 * Whether "Don't squash" is set at the base or any viewport.
	 *
	 * @param  array<string, mixed> $style     The style attribute.
	 * @param  string[]             $viewports Viewport keys.
	 * @return bool
	 */
	private static function has_no_shrink_setting( array $style, array $viewports ): bool {
		if ( isset( $style[ Attributes::STYLE_KEY ] ) ) {
			return true;
		}

		foreach ( $viewports as $viewport ) {
			if ( isset( $style[ $viewport ][ Attributes::STYLE_KEY ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Whether "Don't squash" is in effect at a viewport.
	 *
	 * Viewport values override the base (desktop) value. It only applies alongside
	 * core's "Fit" width; Max and Fixed already set their own shrink.
	 *
	 * @param  array<string, mixed> $style    The style attribute.
	 * @param  string               $viewport Viewport key.
	 * @return bool
	 */
	private static function is_no_shrink( array $style, string $viewport ): bool {
		$self_stretch = $style['layout']['selfStretch'] ?? 'fit';
		$no_shrink    = ! empty( $style[ Attributes::STYLE_KEY ]['noShrink'] );

		if ( Viewports::DESKTOP !== $viewport ) {
			// Core stores null to mean "cleared at this viewport", which falls back to Fit.
			$viewport_layout = $style[ $viewport ]['layout'] ?? [];
			if ( is_array( $viewport_layout ) && array_key_exists( 'selfStretch', $viewport_layout ) ) {
				$self_stretch = $viewport_layout['selfStretch'] ?? 'fit';
			}

			$override = $style[ $viewport ][ Attributes::STYLE_KEY ]['noShrink'] ?? null;
			if ( is_bool( $override ) ) {
				$no_shrink = $override;
			}
		}

		return $no_shrink && 'fit' === $self_stretch;
	}
}
