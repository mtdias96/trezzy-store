import esbuildPluginTsc from 'esbuild-plugin-tsc';

export default () => ({
  bundle: true,
  minify: true,
  keepNames: true,
  sourcemap: false,
  plugins: [esbuildPluginTsc({ forceEsm: true })],
});
