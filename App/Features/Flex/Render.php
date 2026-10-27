<?php
/**
 * Render class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Flex;

use BDChandler\CoreBlocksPlus\Shared\Viewports;
use WP_HTML_Tag_Processor;


/**
 * Render class - outputs sizing CSS on the front end.
 *
 * CSS goes through core's style engine into the same `block-supports` stylesheet
 * core uses for its own layout and responsive styles, under a generated
 * `wp-flex-*` class. Saved markup is never changed, so deactivating the plugin
 * leaves content valid.
 */
final class Render {

	/**
	 * Register the render hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_filter( 'render_block', [ self::class, 'add_styles' ], 10, 2 );
	}

	/**
	 * Add sizing styles and their class to a block.
	 *
	 * @param  string               $block_content Rendered block markup.
	 * @param  array<string, mixed> $block         Parsed block.
	 * @return string
	 */
	public static function add_styles( string $block_content, array $block ): string {
		if ( '' === $block_content || empty( $block['attrs'] ) ) {
			return $block_content;
		}

		$rules = Styles::get_rules( (string) ( $block['blockName'] ?? '' ), $block['attrs'], Viewports::get_media_queries() );
		if ( empty( $rules ) ) {
			return $block_content;
		}

		$class_name = 'wp-flex-' . substr( md5( (string) wp_json_encode( $rules ) ), 0, 8 );

		wp_style_engine_get_stylesheet_from_css_rules(
			array_map(
				static fn ( array $rule ): array => array_filter(
					[
						'selector'     => str_replace( '&', ".$class_name", $rule['selector'] ),
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

		return $processor->get_updated_html();
	}
}
