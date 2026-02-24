const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

// Ensure Babel runs on node_modules that use import.meta
// This is often needed for libraries like 'zustand' or 'lucide-react-native'
config.transformer.minifierPath = 'metro-minify-terser';

module.exports = withNativeWind(config, { input: "./global.css" });
