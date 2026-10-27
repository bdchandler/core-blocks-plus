import {
	Button,
	Modal,
	SearchControl,
	SelectControl,
	Spinner,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { IconSvg } from './icon-svg';
import { useIcons } from '../utils/use-icons';

/**
 * Modal for choosing a registered icon, filtered by search and collection.
 *
 * @param {Object}   props          Component props.
 * @param {string}   props.value    Name of the current icon, if any.
 * @param {Function} props.onSelect Called with the chosen icon's name.
 * @param {Function} props.onClose  Called when the modal is closed.
 * @return {Element} Modal.
 */
export const IconPickerModal = ( { value, onSelect, onClose } ) => {
	const [ search, setSearch ] = useState( '' );
	const [ collection, setCollection ] = useState( '' );
	const { icons, collections, hasResolved } = useIcons();

	const term = search.trim().toLowerCase();
	const shown = ( icons ?? [] ).filter(
		( icon ) =>
			( ! collection || icon.collection === collection ) &&
			( ! term ||
				icon.label?.toLowerCase().includes( term ) ||
				icon.name.includes( term ) )
	);

	let results = <Spinner />;
	if ( hasResolved && ! shown.length ) {
		results = <p>{ __( 'No icons found.', 'core-blocks-plus' ) }</p>;
	} else if ( hasResolved ) {
		results = (
			<div className="core-blocks-plus-inline-icons-picker__grid">
				{ shown.map( ( icon ) => (
					<Button
						key={ icon.name }
						label={ icon.label }
						showTooltip
						isPressed={ icon.name === value }
						onClick={ () => onSelect( icon.name ) }
					>
						<IconSvg content={ icon.content } />
					</Button>
				) ) }
			</div>
		);
	}

	return (
		<Modal
			title={ __( 'Select icon', 'core-blocks-plus' ) }
			onRequestClose={ onClose }
			size="medium"
			className="core-blocks-plus-inline-icons-picker"
		>
			<div className="core-blocks-plus-inline-icons-picker__filters">
				<SearchControl
					__nextHasNoMarginBottom
					value={ search }
					onChange={ setSearch }
					placeholder={ __(
						'Search icons',
						'core-blocks-plus'
					) }
				/>
				{ ( collections?.length ?? 0 ) > 1 && (
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Library', 'core-blocks-plus' ) }
						hideLabelFromVision
						value={ collection }
						options={ [
							{
								value: '',
								label: __(
									'All icons',
									'core-blocks-plus'
								),
							},
							...collections.map( ( { slug, label } ) => ( {
								value: slug,
								label,
							} ) ),
						] }
						onChange={ setCollection }
					/>
				) }
			</div>
			{ results }
		</Modal>
	);
};
