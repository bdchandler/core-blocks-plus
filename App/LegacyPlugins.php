<?php
/**
 * LegacyPlugins class file.
 *
 * @package core-blocks-plus
 */

declare(strict_types=1);

namespace BDChandler\CoreBlocksPlus;

/**
 * LegacyPlugins class - handles the separate Block Enhancements plugins that
 * Core Blocks Plus replaces.
 *
 * Content made with them works unchanged, but running both would output each
 * feature twice (e.g. two overlay links on a linked Group). So while an old
 * plugin is active, Core Blocks Plus leaves that feature off and shows a notice.
 */
final class LegacyPlugins {

	/**
	 * Each feature's old plugin, identified by its main class.
	 *
	 * @var array<string, array{name: string, class: string}>
	 */
	private const PLUGINS = [
		'flex'         => [
			'name'  => 'Block Enhancements: Flex',
			'class' => 'BDChandler\BlockEnhancements\Flex\Plugin',
		],
		'position'     => [
			'name'  => 'Block Enhancements: Position',
			'class' => 'BDChandler\BlockEnhancements\Position\Plugin',
		],
		'inline-icons' => [
			'name'  => 'Block Enhancements: Inline Icons',
			'class' => 'BDChandler\BlockEnhancements\InlineIcons\Plugin',
		],
		'group-link'   => [
			'name'  => 'Block Enhancements: Group Link',
			'class' => 'BDChandler\BlockEnhancements\GroupLink\Plugin',
		],
	];

	/**
	 * Whether a feature's old plugin is active.
	 *
	 * @param  string $slug Feature slug.
	 * @return bool
	 */
	public static function is_active( string $slug ): bool {
		return isset( self::PLUGINS[ $slug ] ) && class_exists( self::PLUGINS[ $slug ]['class'], false );
	}

	/**
	 * Show a notice to administrators while any old plugin is active.
	 *
	 * @return void
	 */
	public static function render_notice(): void {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		$active = array_filter( array_keys( self::PLUGINS ), [ self::class, 'is_active' ] );
		if ( empty( $active ) ) {
			return;
		}

		$names = array_map( static fn ( string $slug ): string => self::PLUGINS[ $slug ]['name'], $active );

		wp_admin_notice(
			sprintf(
				/* translators: %s: list of plugin names. */
				esc_html__( 'Core Blocks Plus replaces these plugins, which are still active: %s. Their features are off in Core Blocks Plus until they are deactivated. Content made with them keeps working.', 'core-blocks-plus' ),
				esc_html( wp_sprintf_l( '%l', $names ) )
			),
			[ 'type' => 'warning' ]
		);
	}
}
