module.exports = {
    module: {
      target: "node", // Or "async-node"
      mode: 'production', // "production" | "development" | "none"
      resolve: {
        extensions: ['*', '.mjs', '.js', '.json']
      },
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto",
          use: []
        },
      ]
    }
  }