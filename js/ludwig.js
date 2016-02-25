'use strict'
import configuration from '../ludwig-widget-conf.js'
class Ludwig {
	constructor() {
		this.repo_url = configuration.repo_url
		this.web = configuration.web
		this.template = configuration.template
		this.prefix = configuration.prefix
		this.expectedTemplate = configuration.expectedTemplate
	}

	/*
	 @returns the URL to call to create a pull request
	 */
	generateSuggestionURL(currentState) {
		let suggestionURL = `${this.repo_url}${this.web.add_path}?filename=${this.generateSuggestionName()}&value=${this.template}`
		if (currentState) {
			suggestionURL += encodeURIComponent(JSON.stringify(currentState))
		}
		return suggestionURL
	}

	/*
	 @returns a suggestion name that is generated on the fly
	 using the configured prefix and the current timestamp
	 */
	generateSuggestionName() {
		let date = new Date()
		let suggestionName = ''
		if (this.prefix) {
			suggestionName = this.prefix + date.getTime()
		} else {
			suggestionName = date.getTime()
		}
		return suggestionName
	}

	acceptedTestsURL() {
		return this.repo_url + this.web.accepted_tests_path
	}

	suggestedTestsURL() {
		return this.repo_url + this.web.suggested_tests_path
	}
}

export {Ludwig}