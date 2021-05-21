// Example config for adding a loader that depends on babel-loader
// This source was taken from the @next/mdx plugin source:
// https://github.com/vercel/next.js/tree/canary/packages/next-mdx
module.exports = {
  images: {
    loader: 'imgix',
    path: '',
  },
	webpack: config => {
		config.module.rules.push(
			{
				test: /\.(vert|frag)$/i,
				use: 'raw-loader',
			}
		)

		return config
	},
}
