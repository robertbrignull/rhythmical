module.exports = {
    entry: "./src/index.tsx",
    devtool: "source-map",
    mode: "development",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            { test: /\.css$/, loader: "css-loader" }
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};
