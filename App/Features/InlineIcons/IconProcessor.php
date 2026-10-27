<?php
/**
 * IconProcessor class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\InlineIcons;

use WP_HTML_Tag_Processor;
use WP_HTML_Text_Replacement;

/**
 * IconProcessor class - an HTML tag processor that can replace a whole tag.
 *
 * The tag processor can only change attributes, so this extends it the same
 * way core's Interactivity API does (WP_Interactivity_API_Directives_Processor).
 */
final class IconProcessor extends WP_HTML_Tag_Processor {

	/**
	 * Replace the current tag with other HTML.
	 *
	 * Intended for void tags such as `img`, which have no content or closing tag.
	 * Replacements are applied together by get_updated_html().
	 *
	 * @param  string $html Replacement HTML.
	 * @return bool Whether the tag was replaced.
	 */
	public function replace_tag( string $html ): bool {
		if ( null === $this->get_tag() || $this->is_tag_closer() ) {
			return false;
		}

		$bookmark = 'core_blocks_plus_inline_icon';
		if ( ! $this->set_bookmark( $bookmark ) ) {
			return false;
		}

		$tag                     = $this->bookmarks[ $bookmark ];
		$this->lexical_updates[] = new WP_HTML_Text_Replacement( $tag->start, $tag->length, $html );

		$this->release_bookmark( $bookmark );

		return true;
	}
}
