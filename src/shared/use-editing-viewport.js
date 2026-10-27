import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

// Core's key for "not editing a viewport", i.e. the base value that applies to desktop.
export const DEFAULT_VIEWPORT = 'default';

/**
 * Get the viewport being edited in core's responsive editing mode:
 * '@tablet', '@mobile', or 'default' when not editing a viewport.
 *
 * Core only exposes this through a private selector that plugins can't unlock,
 * so it is read from the block editor store's state. If core changes that
 * state, this falls back to 'default' and the control edits the base value.
 *
 * @return {string} Viewport key.
 */
export const useEditingViewport = () =>
	useSelect( ( select, registry ) => {
		// Subscribes this hook to block editor store changes.
		select( blockEditorStore ).getSettings();

		try {
			const viewport = registry.stores?.[ blockEditorStore.name ]?.store
				?.getState?.()?.styleStateViewport;

			return 'string' === typeof viewport ? viewport : DEFAULT_VIEWPORT;
		} catch {
			return DEFAULT_VIEWPORT;
		}
	}, [] );
