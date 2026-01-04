module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    require: ['src/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    publishQuiet: true,
  }
};
