'use strict';
const MAX_URI_LENGTH = 8000;

class Ludwig {
	constructor(configuration) {
		this.repoUrl = configuration.repoUrl;
		this.web = configuration.web;
		this.template = configuration.template;
		this.prefix = configuration.prefix;
		this.ludwigCreateSuggestionURL = configuration.ludwigCreateSuggestionURL;
	}

	defaultSuggestionFormatter(currentState, expectedResult)  {
		let result = this.template;
		if (currentState) {
			result += `\r\n${JSON.stringify(currentState, null, '\t')}`;
		}
		if(expectedResult) {
			result += `\r\n${JSON.stringify(expectedResult, null, '\t')}`;
		}
		return result;
	}

	validateSuggestionURL(suggestionURL) {
		function suggestionURLIsEitherEmptyOrTooLong(suggestion) {
			return !suggestion || suggestion.length > MAX_URI_LENGTH;
		}

		if(suggestionURLIsEitherEmptyOrTooLong(suggestionURL)) {
			return false;
		}
		return true;
	}
	/*
	 @returns the URL to call to create a pull request
	 */
	generateSuggestionURL(currentState, expectedResult, customSuggestionFormatter) {
		let suggestionURL = `${this.repoUrl}${this.web.addPath}?filename=${this.generateSuggestionName()}&value=`;

		if(customSuggestionFormatter) {
			if(typeof customSuggestionFormatter === 'function') {
				suggestionURL+=encodeURIComponent(customSuggestionFormatter(currentState, expectedResult));
			} else {
				throw new Error('customSuggestionFormatter expected to be a clojure');
			}
		} else {
			suggestionURL+=encodeURIComponent(this.defaultSuggestionFormatter(currentState, expectedResult));
		}

		if(!this.validateSuggestionURL(suggestionURL)) {
			throw new Error('Resulting URI is invalid. It\'s either too long for GitHub (you probably want to use Ludwig\'s WS in that case), or empty (check with the developer of your service)');
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