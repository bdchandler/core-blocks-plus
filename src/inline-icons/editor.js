import { registerPlugin } from '@wordpress/plugins';
import { registerFormatType } from '@wordpress/rich-text';

import { IconMaskStyles } from './components/icon-mask-styles';
import { FORMAT_NAME, inlineIcon } from './format';

import './editor.css';

registerFormatType( FORMAT_NAME, inlineIcon );

registerPlugin( 'core-blocks-plus-inline-icons', {
	render: IconMaskStyles,
} );
