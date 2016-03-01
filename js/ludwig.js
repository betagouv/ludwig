'use strict';
class Ludwig {
	constructor(configuration) {
		this.repoUrl = configuration.repoUrl;
		this.web = configuration.web;
		this.template = configuration.template;
		this.prefix = configuration.prefix;
		this.expectedTemplate = configuration.expectedTemplate;
		this.ludwigCreateSuggestionURL = configuration.ludwigCreateSuggestionURL;
	}

	defaultSuggestionFormatter(template, currentState, expectedResult) {
		let result = this.template+'\r\n';
		if (currentState) {
			result += JSON.stringify(currentState, null, '\t');
		}
		if(expectedResult) {
			result += JSON.stringify(expectedResult, null, '\t');
		}
		return result;
	}
	/*
	 @returns the URL to call to create a pull request
	 */
	generateSuggestionURL(currentState, expectedResult, customFormatter) {
		let suggestionURL = `${this.repoUrl}${this.web.addPath}?filename=${this.generateSuggestionName()}&value=`;

		if(customFormatter) {
			suggestionURL+=encodeURIComponent(customFormatter(this.template, currentState, expectedResult));
		} else {
			suggestionURL+=encodeURIComponent(this.defaultSuggestionFormatter(this.template, currentState, expectedResult));
		}

		return suggestionURL;
	}

	/*
	 @returns a suggestion name that is generated on the fly
	 using the configured prefix and the current timestamp
	 */
	generateSuggestionName() {
		let date = new Date();
		let suggestionName = '';
		if (this.prefix) {
			suggestionName = this.prefix + date.getTime();
		} else {
			suggestionName = date.getTime();
		}
		return suggestionName;
	}

	canGenerateLudwigSuggestionEndpointURL(title, description, currentState, expectedState) {
		return title && description && currentState && expectedState && this.ludwigCreateSuggestionURL;
	}

	generateLudwigSuggestionEndpointURL(title, description, currentState, expectedState) {
		if (!this.canGenerateLudwigSuggestionEndpointURL(title, description, currentState, expectedState)) {
			throw new Error('Cannot generate Ludwig suggestions creation endpoint URL');
		} else {
			let URIEncodedState = encodeURIComponent(JSON.stringify(currentState));
			let URIEncodedExpectedState = encodeURIComponent(expectedState);
			let URIEncodedTitle = encodeURIComponent(title);
			let URIEncodedDescription = encodeURIComponent(description);
			return `${this.ludwigCreateSuggestionURL}?title=${URIEncodedTitle}&description=${URIEncodedDescription}&state=${URIEncodedState}&expectedState=${URIEncodedExpectedState}`;
		}
	}

	acceptedTestsURL() {
		return this.repoUrl + this.web.acceptedTestsPath;
	}

	suggestedTestsURL() {
		return this.repoUrl + this.web.suggestedTestsPath;
	}
}

export {Ludwig};