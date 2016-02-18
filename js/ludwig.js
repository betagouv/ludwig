'use strict';
const configuration = require('../ludwig-widget-conf.js');

let Ludwig = function () {
    this.repo_url = configuration.repo_url;
    this.web = configuration.web;
    this.template = configuration.template;
    this.prefix = configuration.prefix;
};

/*
 @returns the URL to call to create a pull request
 */
Ludwig.prototype.generateSuggestionURL = function (currentState) {
    let suggestionURL = `${this.repo_url}${this.web.add_path}?filename=${this.generateSuggestionName()}&value=${this.template}`;
    if (currentState) {
        suggestionURL += encodeURIComponent(JSON.stringify(currentState));
    }
    return suggestionURL;
};

/*
 @returns a suggestion name that is generated on the fly
 using the configured prefix and the current timestamp
 */
Ludwig.prototype.generateSuggestionName = function () {
    let date = new Date();
    let suggestionName = '';
    if (this.prefix) {
        suggestionName = this.prefix + date.getTime();
    } else {
        suggestionName = date.getTime();
    }
    return suggestionName;
};

Ludwig.prototype.acceptedTestsURL = function () {
    return this.repo_url + this.web.accepted_tests_path;
};

Ludwig.prototype.suggestedTestsURL = function () {
    return this.repo_url + this.web.suggested_tests_path;
};

module.exports = Ludwig;
