const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    pageLoadTimeout: 30000, 
    browser: 'chrome', 
    video: true,
  },
});
