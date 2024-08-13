const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config')
 
const config = {
  resolver: {
    assetExts: ['tflite', ...getDefaultConfig(__dirname)?.resolver?.assetExts],
  },
}
 
module.exports = mergeConfig(getDefaultConfig(__dirname), config)