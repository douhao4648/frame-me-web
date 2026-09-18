import frameMe from '@frame-me/config/eslint';

export default [
  ...frameMe,
  {
    // 契约类型为生成物，不参与 lint
    ignores: ['src/api/gen/**'],
  },
];
