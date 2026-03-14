import path from 'node:path';

const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';
const mode: string = IS_PRODUCTION ? 'production' : 'development';

const config = {
	mode,
	target: 'node',
	entry: './src/server.ts',
	output: { path: path.resolve(__dirname, 'build'), filename: 'server.js' },
	plugins: [
		// Add your plugins here
		// Learn more about plugins from https://webpack.js.org/configuration/plugins/
	],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				loader: 'ts-loader',
				exclude: ['/node_modules/'],
				options: {
					configFile: 'tsconfig.build.json',
				},
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},
			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
	},
};

export default config;
