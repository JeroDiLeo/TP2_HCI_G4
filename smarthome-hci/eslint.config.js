import vuetify from 'eslint-config-vuetify'

export default vuetify(
  {
    ts: true,
    antfu: false,
    perfectionist: false,
    stylistic: false,
    unicorn: false,
  },
  {
    rules: {
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      complexity: 'off',
      curly: 'off',
      'vue/attributes-order': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-multi-spaces': 'off',
      'vue/no-template-shadow': 'off',
      'vue/padding-line-between-tags': 'off',
      'vue/script-indent': 'off',
    },
  },
)
