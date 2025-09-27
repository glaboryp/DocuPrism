// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Disable rules that conflict with Tailwind CSS
      'vue/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow Tailwind CSS class names
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    },
    ignores: [
      // Ignore Tailwind CSS generated files
      '**/*.css',
      '**/dist/**',
      '**/.output/**'
    ]
  }
)
