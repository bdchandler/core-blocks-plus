<?php
/**
 * Render class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\GroupLink;

use WP_HTML_Tag_Processor;
use WP_Http;

/**
 * Render class - adds the link to linked blocks on the front end.
 *
 * Rather than making the block itself a link (links can't contain the links
 * and buttons cards usually have), a link is added as the block's last child
 * and stretched over it with CSS. Links and buttons inside stay clickable above
 * it. Being a direct child, it always covers the whole block, even if something
 * inside is positioned.
 *
 * For accessibility, the added link is:
 * - hidden from screen readers and keyboard users if a link inside already goes
 *   to the same URL, so it isn't a duplicate (it's just a bigger click target);
 * - otherwise named by its label, or else by the block's first heading.
 */
final class Render {

	public const CLASS_NAME = 'has-group-link';

	public const LINK_CLASS = 'wp-group-link';

	/**
	 * Register the render hooks.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_filter( 'render_block', [ self::class, 'add_link' ], 10, 2 );
	}

	/**
	 * Add the stretched link to a linked block.
	 *
	 * @param  string               $block_content Rendered block markup.
	 * @param  array<string, mixed> $block         Parsed block.
	 * @return string
	 */
	public static function add_link( string $block_content, array $block ): string {
		if ( '' === $block_content || ! in_array( $block['blockName'] ?? '', Attributes::BLOCKS, true ) ) {
			return $block_content;
		}

		$link = $block['attrs'][ Attributes::NAME ] ?? null;
		$url  = is_array( $link ) && is_string( $link['url'] ?? null ) ? esc_url( trim( $link['url'] ) ) : '';
		if ( '' === $url ) {
			return $block_content;
		}

		$label = is_string( $link['label'] ?? null ) ? trim( $link['label'] ) : '';

		$processor = new WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		$root_tag = strtolower( (string) $processor->get_tag() );
		$processor->add_class( self::CLASS_NAME );

		$has_duplicate = false;
		$heading_id    = null;

		while ( $processor->next_tag() ) {
			$tag = $processor->get_tag();

			// Any accessible link counts, including a nested linked block's own link,
			// but not one already hidden as a duplicate.
			if ( 'A' === $tag && ! $has_duplicate && 'true' !== $processor->get_attribute( 'aria-hidden' ) ) {
				$href          = $processor->get_attribute( 'href' );
				$has_duplicate = is_string( $href ) && self::is_same_url( $href, $url );
			}

			// The first heading names the link, if it needs a name and there's no label.
			if ( null === $heading_id && '' === $label && preg_match( '/^H[1-6]$/', (string) $tag ) ) {
				$heading_id = $processor->get_attribute( 'id' );
				if ( ! is_string( $heading_id ) || '' === $heading_id ) {
					$heading_id = wp_unique_id( 'wp-group-link-heading-' );
					$processor->set_attribute( 'id', $heading_id );
				}
			}
		}

		$html = $processor->get_updated_html();

		// Insert the link just before the block's closing tag.
		$closer = strripos( $html, "</{$root_tag}" );
		if ( false === $closer ) {
			return $block_content;
		}

		Assets::enqueue_style();

		return substr_replace( $html, self::get_link_html( $url, $link, $label, $has_duplicate, $heading_id ), $closer, 0 );
	}

	/**
	 * Build the stretched link.
	 *
	 * @param  string               $url           Link URL, already escaped.
	 * @param  array<string, mixed> $link          The groupLink attribute.
	 * @param  string               $label         Link label, if set.
	 * @param  bool                 $has_duplicate Whether a link inside goes to the same URL.
	 * @param  string|null          $heading_id    ID of the block's first heading, if any.
	 * @return string
	 */
	private static function get_link_html( string $url, array $link, string $label, bool $has_duplicate, ?string $heading_id ): string {
		$attributes = sprintf( ' class="%s" href="%s"', esc_attr( self::LINK_CLASS ), $url );

		if ( ! empty( $link['opensInNewTab'] ) ) {
			$attributes .= ' target="_blank" rel="noopener noreferrer"';
		}

		$text = '';

		if ( $has_duplicate ) {
			$attributes .= ' aria-hidden="true" tabindex="-1"';
		} elseif ( '' !== $label ) {
			$text = $label;
		} elseif ( null !== $heading_id ) {
			$attributes .= sprintf( ' aria-labelledby="%s"', esc_attr( $heading_id ) );
		} else {
			$text = __( 'Read more', 'core-blocks-plus' );
		}

		if ( '' !== $text ) {
			$text = sprintf( '<span class="screen-reader-text">%s</span>', esc_html( $text ) );
		}

		return "<a{$attributes}>{$text}</a>";
	}

	/**
	 * Whether two URLs point to the same place, ignoring a trailing slash and
	 * whether they're relative or absolute.
	 *
	 * @param  string $a First URL.
	 * @param  string $b Second URL.
	 * @return bool
	 */
	private static function is_same_url( string $a, string $b ): bool {
		$normalise = static fn ( string $url ): string => untrailingslashit(
			WP_Http::make_absolute_url( html_entity_decode( trim( $url ) ), home_url( '/' ) )
		);

		return '' !== trim( $a ) && $normalise( $a ) === $normalise( $b );
	}
}
