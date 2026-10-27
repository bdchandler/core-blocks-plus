/**
 * Show an icon's SVG in the editor UI. The markup comes from core's icon
 * registry, which sanitises it when icons are registered.
 *
 * @param {Object} props         Component props.
 * @param {string} props.content SVG markup.
 * @return {Element} Icon.
 */
export const IconSvg = ( { content } ) => (
	<span
		className="core-blocks-plus-inline-icons__svg"
		aria-hidden="true"
		dangerouslySetInnerHTML={ { __html: content } }
	/>
);
