const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    projectId: "19uf39",
    pageLoadTimeout: 30000, 
    video: false
  },
});
