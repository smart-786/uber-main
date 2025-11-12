module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          alias: {
            "@": "./app",
          },
        },
      ],
      // 👇 MUST BE LAST
      "react-native-reanimated/plugin",
    ],
  };
};
