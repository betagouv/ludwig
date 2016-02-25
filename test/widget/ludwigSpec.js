'use strict'
import {assert} from 'chai'
import sinon from 'sinon'
import {Ludwig} from '../../js/ludwig'

describe('Widget : Sugestion link retrieval', () => {
	let ludwig
	beforeEach(() => {
		ludwig = new Ludwig({})
	})

	describe('generateSuggestionName', () => {
		it('should generate suggestion names based on configured prefix and current time', () => {
			//setup
			ludwig.prefix = 'suggestion-prefix'
			//action
			let actual = ludwig.generateSuggestionName()
			//assert
			assert.match(actual, /^suggestion-prefix[0-9]{13}$/)
		})
		it('should not return NaN if prefix is undefined, just the timestamp', () => {
			//setup
			delete ludwig.prefix
			//action
			let actual = ludwig.generateSuggestionName()
			//assert
			assert.match(actual, /^[0-9]{13}$/)
		})

	})

	describe('generateSuggestionURL', () => {
		it('should concatenate the url and template data from the configuration and generate a unique suggestion name', () => {
			//setup
			ludwig.repoUrl = 'my_url'
			ludwig.web = {addPath: '/new/master'}
			//ludwig.accepted_suggestions_path = '/tree/master/tests'
			ludwig.template = 'some+template'
			ludwig.prefix = 'suggestions/ludwig-suggestion'
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234')
			//action
			let actual = ludwig.generateSuggestionURL()
			//assert
			assert.equal(actual, 'my_url/new/master?filename=suggestions/ludwig-suggestion-1234&value=some+template')
		})
		it('should append state data if present', () => {
			//setup
			ludwig.repoUrl = 'my_url'
			ludwig.web = {addPath: '/new/master'}
			ludwig.template = 'some+template'
			ludwig.prefix = 'suggestions/ludwig-suggestion'
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234')
			//action
			let actual = ludwig.generateSuggestionURL({some: 'state'})
			//assert
			assert.equal(actual, 'my_url/new/master?filename=suggestions/ludwig-suggestion-1234&value=some+template%7B%22some%22%3A%22state%22%7D')
		})
	})

	describe('acceptedTestsURL', () => {
		it('should concatenate the base URL of the repo and the public URL of the directory in the master branch of the repo where the tests are', () => {
			//setup
			ludwig.repoUrl = 'my_url'
			ludwig.web = {acceptedTestsPath: '/tree/master/tests'}
			//action
			let actual = ludwig.acceptedTestsURL()
			//assert
			assert.equal(actual, 'my_url/tree/master/tests')
		})
	})

	describe('suggestionsURL', () => {
		it('should  concatenate the base URL of the repo and the public URL of the open pull requests', () => {
			//setup
			ludwig.repoUrl = 'my_url'
			ludwig.web = {suggestedTestsPath: '/pulls?utf8=✓&q=is%3Apr+is%3Aopen'}
			//action
			let actual = ludwig.suggestedTestsURL()
			//assert
			assert.equal(actual, 'my_url/pulls?utf8=✓&q=is%3Apr+is%3Aopen')
		})
	})

	describe('generateLudwigSuggestionHandlerURL', () => {

		const suggestionURLGeneratorFailCases = [
			{
				testTitle: 'title',
				title: null,
				description: null,
				currentState: null,
				expectedState: null,
				ludwigCreateSuggestionURL: null
			},
			{
				testTitle: 'description',
				title: 'title',
				description: null,
				currentState: null,
				expectedState: null,
				ludwigCreateSuggestionURL: null
			},
			{
				testTitle: 'current state',
				title: 'title',
				description: 'description',
				currentState: null,
				expectedState: null,
				ludwigCreateSuggestionURL: null
			},
			{
				testTitle: 'expected state',
				title: 'title',
				description: 'description',
				currentState: {},
				expectedState: null,
				ludwigCreateSuggestionURL: null
			},
			{
				testTitle: 'Ludwig suggestion creation endpoint URL',
				title: 'title',
				description: 'description',
				currentState: {},
				expectedState: {},
				ludwigCreateSuggestionURL: null
			}
		]

		suggestionURLGeneratorFailCases.forEach((testCase) => {
			it(`should throw an error if ${testCase.testTitle} is missing`, () => {
				//setup
				//action
				try {
					ludwig.generateLudwigSuggestionEndpointURL()
					assert.fail('call without proper parameters should throw an error')
				} catch (err) {
					//assert
					assert.equal(err.message, 'Cannot generate Ludwig suggestions creation endpoint URL')
				}
			})
		})

		it('should return a correctly formatted URL to a Ludwig endpoint if all necessary data is set', () => {
			ludwig.ludwigCreateSuggestionURL = 'http://ludwig.foo:3000/createSuggestion'
			let actual = ludwig.generateLudwigSuggestionEndpointURL('customTitle', 'suggestion description', {one: 2}, '{"three":"four"}')
			assert.equal(actual, 'http://ludwig.foo:3000/createSuggestion?title=customTitle&description=suggestion%20description&state=%7B%22one%22%3A2%7D&expectedState=%7B%22three%22%3A%22four%22%7D')
		})
	})
})
