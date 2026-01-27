module.exports = {
  default: {
    // Don't hardcode paths - allows test explorer to run individual features
    // If no feature path is provided via CLI, defaults to all features
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
    parallel: 1,
  }
};
