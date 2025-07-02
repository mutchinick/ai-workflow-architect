import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import prettierPlugin from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-expressions': 'off',
      'object-shorthand': ['error', 'always'],
    },
  },
  {
    files: ['**/*.js', '**/*.ts'],
    plugins: {
      jsdoc: pluginJsdoc,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
        },
      ],
    },
  },
  {
    files: ['*.spec.ts', '*.test.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowedNames: ['testingFunc'],
        },
      ],
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/'],
  },
  prettierConfig,
)
