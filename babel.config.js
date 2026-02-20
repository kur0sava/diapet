module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@core': './src/core',
            '@features': './src/features',
            '@shared': './src/shared',
            '@storage': './src/storage',
            '@navigation': './src/navigation',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
