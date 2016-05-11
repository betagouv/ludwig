'use strict';
const MAX_URI_LENGTH = 8000;
const GITHUB_URL = 'https://github.com';

class Ludwig {
	constructor(configuration) {
		if (!configuration.repo) {
			throw new Error('"repo" field in configuration is mandatory');
		}
		this.repo = configuration.repo;
		this.branch = configuration.branch || 'master';
		this.template = configuration.template;
		this.prefix = configuration.prefix;
		this.ludwigCreateSuggestionURL = configuration.ludwigCreateSuggestionURL;
		this.expectedTemplate = configuration.expectedTemplate || '';
	}

	defaultSuggestionFormatter(currentState, expectedResult)  {
		let result = this.template;
		if (currentState) {
			result += `\r\n${JSON.stringify(currentState, null, '\t')}`;
		}
		if (expectedResult) {
			result += `\r\n${JSON.stringify(expectedResult, null, '\t')}`;
		}
		return result;
	}

	validateSuggestionURL(suggestionURL) {
		function suggestionURLIsEitherEmptyOrTooLong(suggestion) {
			return !suggestion || suggestion.length > MAX_URI_LENGTH;
		}

		if (suggestionURLIsEitherEmptyOrTooLong(suggestionURL)) {
			return false;
		}
		return true;
	}
	/*
	 @returns the URL to call to create a pull request
	 */
	generateSuggestionURL(currentState, expectedResult, customSuggestionFormatter) {
		let suggestionURL = `${GITHUB_URL}/${this.repo}/new/${this.branch}?filename=${this.generateSuggestionName()}&value=`;

		if (customSuggestionFormatter) {
			if (typeof customSuggestionFormatter === 'function') {
				suggestionURL+=encodeURIComponent(customSuggestionFormatter(currentState, expectedResult));
			} else {
				throw new Error('customSuggestionFormatter expected to be a clojure');
			}
		} else {
			suggestionURL+=encodeURIComponent(this.defaultSuggestionFormatter(currentState, expectedResult));
		}

		if (!this.validateSuggestionURL(suggestionURL)) {
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

	generateLudwigSuggestionEndpointURL(title, description, currentState, expectedState, customSuggestionFormatter) {
		if (!this.canGenerateLudwigSuggestionEndpointURL(title, description, currentState, expectedState)) {
			throw new Error('Cannot generate Ludwig suggestions creation endpoint URL');
		} else {
			let URIEncodedState;

			if (customSuggestionFormatter) {
				if (typeof customSuggestionFormatter === 'function') {
					URIEncodedState=encodeURIComponent(customSuggestionFormatter(currentState, expectedState));
				} else {
					throw new Error('customSuggestionFormatter expected to be a clojure');
				}
			} else {
				URIEncodedState=encodeURIComponent(this.defaultSuggestionFormatter(currentState, expectedState));
			}
			let URIEncodedExpectedState = encodeURIComponent(expectedState);
			let URIEncodedTitle = encodeURIComponent(title);
			let URIEncodedDescription = encodeURIComponent(description);
			return `${this.ludwigCreateSuggestionURL}?title=${URIEncodedTitle}&description=${URIEncodedDescription}&state=${URIEncodedState}&expectedState=${URIEncodedExpectedState}`;
		}
	}

	acceptedTestsURL() {
		return `${GITHUB_URL}/${this.repo}/tree/${this.branch}/tests`;
	}

	suggestedTestsURL() {
		return `${GITHUB_URL}/${this.repo}/pulls?utf8=✓&q=is%3Apr+is%3Aopen`;
	}
}

export {Ludwig};
