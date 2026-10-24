const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    extraNodeModules: {
      'react-native/asset-registry': path.resolve(__dirname, 'node_modules/@react-native/assets-registry/registry.js'),
    },
  },
  transformer: {
    assetRegistryPath: '@react-native/assets-registry/registry.js',
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
