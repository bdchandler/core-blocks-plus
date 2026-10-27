<?php
/**
 * Render class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Position;

use BDChandler\CoreBlocksPlus\Shared\Viewports;
use WP_Block_Type_Registry;
use WP_HTML_Tag_Processor;


/**
 * Render class - outputs position CSS on the front end, replacing core's position support.
 *
 * CSS goes through core's style engine into the same `block-supports` stylesheet
 * core uses for its own responsive (`wp-states-*`) styles. Saved markup is never
 * changed, so deactivating the plugin hands Sticky back to core.
 */
final class Render {

	private const CORE_RENDER_CALLBACK = 'wp_render_position_support';

	/**
	 * Register the render hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		// Only replace core's output if it's where we expect, so a renamed callback can't double up styles.
		if ( false !== has_filter( 'render_block', self::CORE_RENDER_CALLBACK ) ) {
			remove_filter( 'render_block', self::CORE_RENDER_CALLBACK );
		}

		add_filter( 'render_block', [ self::class, 'add_styles' ], 10, 2 );
	}

	/**
	 * Add position styles and classes to a block.
	 *
	 * @param  string               $block_content Rendered block markup.
	 * @param  array<string, mixed> $block         Parsed block.
	 * @return string
	 */
	public static function add_styles( string $block_content, array $block ): string {
		$style = $block['attrs']['style'] ?? null;
		if ( '' === $block_content || ! is_array( $style ) || ! self::has_position( $style ) ) {
			return $block_content;
		}

		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( (string) ( $block['blockName'] ?? '' ) );
		if ( ! $block_type || ! block_has_support( $block_type, 'position', false ) ) {
			return $block_content;
		}

		$rules = Styles::get_rules( $style, Viewports::get_media_queries(), Styles::get_allowed_types() );
		if ( empty( $rules ) ) {
			return $block_content;
		}

		$class_name = 'wp-position-' . substr( md5( (string) wp_json_encode( $rules ) ), 0, 8 );

		// Doubled class, as core does, to win over layout rules such as the block gap.
		$selector = ".$class_name.$class_name";

		wp_style_engine_get_stylesheet_from_css_rules(
			array_map(
				static fn ( array $rule ): array => array_filter(
					[
						'selector'     => $selector,
						'declarations' => $rule['declarations'],
						'rules_group'  => $rule['media'],
					]
				),
				$rules
			),
			[
				'context'  => 'block-supports',
				'prettify' => false,
			]
		);

		$processor = new WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		$processor->add_class( $class_name );

		// Readable classes for themes to target, matching core's own is-position-sticky,
		// which core's CSS also uses to set the admin bar offset.
		foreach ( Styles::get_types( $rules ) as $type ) {
			$processor->add_class( "is-position-$type" );
		}

		return $processor->get_updated_html();
	}

	/**
	 * Whether a style attribute has position settings at the base or any viewport.
	 *
	 * @param  array<string, mixed> $style The block's style attribute.
	 * @return bool
	 */
	private static function has_position( array $style ): bool {
		if ( ! empty( $style['position'] ) ) {
			return true;
		}

		foreach ( Viewports::get_keys() as $viewport ) {
			if ( ! empty( $style[ $viewport ]['position'] ) ) {
				return true;
			}
		}

		return false;
	}
}
