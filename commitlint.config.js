module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['wip', 'feat', 'fix', 'style', 'refactor', 'test', 'docs', 'chore', 'hotfix']],
    'scope-enum': [2, 'always', ['backend', 'frontend', 'root', 'ci', 'deps', 'release']],
    'subject-empty': [2, 'never'],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [2, 'always', 'lower-case'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [2, 'always', 200],
  },
};
