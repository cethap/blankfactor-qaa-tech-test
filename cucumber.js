module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['src/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml',
      'allure-cucumberjs/reporter:reports/allure-results/allure-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await',
      resultsDir: 'reports/allure-results'
    },
    publishQuiet: true,
  }
};
