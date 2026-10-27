const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

// One set of assets per feature, in build/<feature>/, so a feature that's
// turned off loads nothing.
module.exports = {
	...defaultConfig,
	entry: {
		'flex/editor': './src/flex/editor.js',
		'position/editor': './src/position/editor.js',
		'position/editor-canvas': './src/position/editor-canvas.css',
		'inline-icons/editor': './src/inline-icons/editor.js',
		'inline-icons/frontend': './src/inline-icons/frontend.css',
		'inline-icons/editor-canvas': './src/inline-icons/editor-canvas.css',
		'group-link/editor': './src/group-link/editor.js',
		'group-link/frontend': './src/group-link/frontend.css',
	},
};
