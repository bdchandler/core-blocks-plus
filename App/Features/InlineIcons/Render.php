<?php
/**
 * Render class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\InlineIcons;

/**
 * Render class - swaps inline icon placeholders for their SVG on the front end.
 *
 * Content only stores the icon's name, as an image tag like core's inline image:
 * `<img class="wp-inline-icon" data-icon="gdr/download" alt="">`. Rich text saves
 * inline objects as void tags, so it has to be an `img`. Only storing the name
 * means it's allowed for all users (SVG is stripped for users without
 * `unfiltered_html`), patterns only need the name, and changes to an icon apply
 * everywhere it's used.
 */
final class Render {

	public const CLASS_NAME = 'wp-inline-icon';

	/**
	 * Register the render hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_filter( 'render_block', [ self::class, 'add_icons' ], 10, 1 );
	}

	/**
	 * Replace each inline icon placeholder with a span containing its SVG.
	 *
	 * @param  string $block_content Rendered block markup.
	 * @return string
	 */
	public static function add_icons( string $block_content ): string {
		if ( ! str_contains( $block_content, self::CLASS_NAME ) ) {
			return $block_content;
		}

		$processor = new IconProcessor( $block_content );
		$has_icons = false;

		while ( $processor->next_tag(
			[
				'tag_name'   => 'img',
				'class_name' => self::CLASS_NAME,
			]
		) ) {
			$name = $processor->get_attribute( 'data-icon' );
			if ( ! is_string( $name ) || '' === $name ) {
				continue;
			}

			// The span carries any label, so the SVG itself is always hidden from assistive tech.
			$svg = trim( wp_get_icon( $name, [ 'size' => null ] ) );

			if ( '' !== $svg && $processor->replace_tag( self::get_icon_html( $processor, $name, $svg ) ) ) {
				$has_icons = true;
			}
		}

		if ( ! $has_icons ) {
			return $block_content;
		}

		Assets::enqueue_style();

		return $processor->get_updated_html();
	}

	/**
	 * Build the span that replaces an icon placeholder, keeping its classes,
	 * style and label.
	 *
	 * @param  IconProcessor $processor Processor, at the placeholder tag.
	 * @param  string        $name      Icon name.
	 * @param  string        $svg       Icon SVG.
	 * @return string
	 */
	private static function get_icon_html( IconProcessor $processor, string $name, string $svg ): string {
		$class = $processor->get_attribute( 'class' );
		$style = $processor->get_attribute( 'style' );
		$label = trim( (string) $processor->get_attribute( 'alt' ) );

		$attributes = sprintf( ' class="%s" data-icon="%s"', esc_attr( (string) $class ), esc_attr( $name ) );

		if ( is_string( $style ) && '' !== $style ) {
			$attributes .= sprintf( ' style="%s"', esc_attr( $style ) );
		}

		$attributes .= '' === $label
			? ' aria-hidden="true"'
			: sprintf( ' role="img" aria-label="%s"', esc_attr( $label ) );

		return "<span{$attributes}>{$svg}</span>";
	}
}
