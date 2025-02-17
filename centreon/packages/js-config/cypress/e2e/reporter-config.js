module.exports = {
  mochawesomeReporterOptions: {
    consoleReporter: 'none',
    html: false,
    json: true,
    overwrite: true,
    reportDir: 'cypress/results/reports',
    reportFilename: '[name]-report.json'
  },
  reporterEnabled: `mochawesome,${require.resolve(
    '@badeball/cypress-cucumber-preprocessor/pretty-reporter'
  )}`
};
