const defaults = require("@wordpress/scripts/config/webpack.config");
const { resolve } = require("path");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
	...defaults,
	output: {
		filename: "[name].js",
		path: resolve(process.cwd(), "dist"),
	},
	entry: {
		blocks: resolve(process.cwd(), "src/blocks/index.ts"),
		"posts-slider": resolve(process.cwd(), "src/frontend/posts-slider.ts"),
	},
	resolve: {
		...defaults.resolve,
		alias: {
			...defaults.resolve.alias,
			"@": resolve(process.cwd(), "src"),
		},
	},
	plugins: [...defaults.plugins, new ForkTsCheckerPlugin()].filter(Boolean),
};
