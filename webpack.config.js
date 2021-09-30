const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "output"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      vm: require.resolve("vm-browserify"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
      os: require.resolve("os-browserify"),
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "./index.html",
    }),
  ],
};
