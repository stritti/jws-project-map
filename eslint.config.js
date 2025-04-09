import eslint from 'eslint';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

const { defineConfig } = eslint;

export default defineConfig({
  plugins: {
    vue: pluginVue,
  },
  languageOptions: {
    parser: pluginVue.parser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      extraFileExtensions: ['.vue'],
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  extends: [
    ...tseslint.configs.recommended,
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  ignores: [
    'node_modules',
    'dist',
    'dev-dist',
    '.git',
    '.github',
    'public',
  ],
});
