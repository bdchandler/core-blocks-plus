<?php
/**
 * Attributes class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus\Features\Flex;

/**
 * Attributes class - registers the plugin's block attributes.
 *
 * "Don't squash" is responsive, so it lives in core's `style` attribute
 * (`style.flexSizing`, `style['@mobile'].flexSizing`, ...) the same way core
 * stores its own responsive Width setting. Column sizing isn't responsive, so it
 * is a plain attribute, like core's column `width`.
 */
final class Attributes {

	public const STYLE_KEY = 'flexSizing';

	public const COLUMN_SIZING = 'columnSizing';

	/**
	 * Register the attribute hooks.
	 *
	 * Hooked immediately, as core blocks register on `init`.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_filter( 'register_block_type_args', [ self::class, 'add_attributes' ], 10, 2 );
	}

	/**
	 * Add the columnSizing attribute to the Column block.
	 *
	 * @param  array<string, mixed> $args       Block type arguments.
	 * @param  string               $block_name Block name.
	 * @return array<string, mixed>
	 */
	public static function add_attributes( array $args, string $block_name ): array {
		if ( 'core/column' !== $block_name ) {
			return $args;
		}

		$args['attributes'] ??= [];

		if ( is_array( $args['attributes'] ) && ! isset( $args['attributes'][ self::COLUMN_SIZING ] ) ) {
			$args['attributes'][ self::COLUMN_SIZING ] = [ 'type' => 'string' ];
		}

		return $args;
	}
}
