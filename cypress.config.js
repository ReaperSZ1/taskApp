const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    projectId: "19uf39",
    pageLoadTimeout: 30000, 
    video: disable
  },
});
