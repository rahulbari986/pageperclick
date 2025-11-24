// FIX: Changed from module.exports to export default (ESM syntax)
// This resolves the "type": "module" conflict in your package.json
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
