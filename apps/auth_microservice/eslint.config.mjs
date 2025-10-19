import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
