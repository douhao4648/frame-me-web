// @frame-me/config eslint 基础配置（flat config，ESLint 10 + typescript-eslint 8）。
// 消费方：eslint.config.js 中 `import frameMe from '@frame-me/config/eslint'; export default [...frameMe, ...自有覆盖]`
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // 显式类型导入，配合 verbatimModuleSyntax
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
