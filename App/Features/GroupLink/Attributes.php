<?php
/**
 * Attributes class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\GroupLink;

/**
 * Attributes class - registers the groupLink attribute on the supported blocks.
 *
 * The link is stored as an attribute, `groupLink: { url, opensInNewTab, label }`,
 * and added at render time, so saved markup never changes. It's namespaced to
 * avoid clashing with block attributes such as Cover's `url`.
 */
final class Attributes {

	public const NAME = 'groupLink';

	/**
	 * Blocks that can be linked. Group covers its Row, Stack and Grid variations.
	 */
	public const BLOCKS = [ 'core/group', 'core/column', 'core/cover' ];

	/**
	 * Register the attribute hooks.
	 *
	 * Hooked immediately, as core blocks register on `init`.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_filter( 'register_block_type_args', [ self::class, 'add_attribute' ], 10, 2 );
	}

	/**
	 * Add the groupLink attribute to the supported blocks.
	 *
	 * @param  array<string, mixed> $args       Block type arguments.
	 * @param  string               $block_name Block name.
	 * @return array<string, mixed>
	 */
	public static function add_attribute( array $args, string $block_name ): array {
		if ( ! in_array( $block_name, self::BLOCKS, true ) ) {
			return $args;
		}

		$args['attributes'] ??= [];

		if ( is_array( $args['attributes'] ) && ! isset( $args['attributes'][ self::NAME ] ) ) {
			$args['attributes'][ self::NAME ] = [ 'type' => 'object' ];
		}

		return $args;
	}
}
