/*global describe it beforeEach*/
import {assert} from 'chai';
import sinon from 'sinon';
import {Ludwig} from '../../js/ludwig';

describe('Widget : Sugestion link retrieval', () => {
	let ludwig;
	beforeEach(() => {
		ludwig = new Ludwig({repo:'foobar'});
	});

	describe('constructor', () =>{
		it('should set branch to default to "master" if none is provided', () => {
			//setup
			//action
			ludwig = new Ludwig({repo:'foobar'});
			//assert
			assert.equal(ludwig.branch, 'master');
		});

		it('should set branch property to foobar, if foobar is provided as branch name', () => {
			//setup

			//action
			ludwig = new Ludwig({repo:'foobar', branch:'foobar'});
			//assert
			assert.equal(ludwig.branch, 'foobar');
		});


		it('should throw an error if mandatory "repo" config field seems to be empty', () => {
			//setup
			//action
			try {
				ludwig = new Ludwig({});
				assert.fail('constructor without repo field in configuration should throw an error');
			} catch (error) {
				//assert
				assert.equal(error.message, '"repo" field in configuration is mandatory');
			}
		});
	});

	describe('generateSuggestionName', () => {
		it('should generate suggestion names based on configured prefix and current time', () => {
			//setup
			ludwig.prefix = 'suggestion-prefix';
			//action
			let actual = ludwig.generateSuggestionName();
			//assert
			assert.match(actual, /^suggestion-prefix[0-9]{13}$/);
		});
		it('should not return NaN if prefix is undefined, just the timestamp', () => {
			//setup
			delete ludwig.prefix;
			//action
			let actual = ludwig.generateSuggestionName();
			//assert
			assert.match(actual, /^[0-9]{13}$/);
		});
	});

	describe('generateSuggestionURL', () => {
		it('should concatenate the url and template data from the configuration and generate a unique suggestion name', () => {
			//setup
			sinon.stub(ludwig, 'validateSuggestionURL').returns(true);
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234');
			//action
			let actual = ludwig.generateSuggestionURL();
			//assert
			assert.equal(actual, 'https://github.com/user/repo/new/foobar?filename=suggestions/ludwig-suggestion-1234&value=some%2Btemplate');
		});
		it('should append state data if present w/ a linefeed inbetween', () => {
			//setup
			sinon.stub(ludwig, 'validateSuggestionURL').returns(true);
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234');
			//action
			let actual = ludwig.generateSuggestionURL({some: 'state'});
			//assert
			assert.equal(actual, 'https://github.com/user/repo/new/foobar?filename=suggestions/ludwig-suggestion-1234&value=some%2Btemplate%0D%0A%7B%0A%09%22some%22%3A%20%22state%22%0A%7D');
		});

		it('should append the result to the query if it is given', () => {
			//setup
			sinon.stub(ludwig, 'validateSuggestionURL').returns(true);
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234');
			//action
			let actual = ludwig.generateSuggestionURL({some: 'state'}, {another: 'result'});
			//assert
			assert.equal(actual, 'https://github.com/user/repo/new/foobar?filename=suggestions/ludwig-suggestion-1234&value=some%2Btemplate%0D%0A%7B%0A%09%22some%22%3A%20%22state%22%0A%7D%0D%0A%7B%0A%09%22another%22%3A%20%22result%22%0A%7D');
		});

		it('should bypass standard formatting if a clojure is given as 3rd param and format currentState & expectedResult using that clojure instead', () => {
			//setup
			sinon.stub(ludwig, 'validateSuggestionURL').returns(true);
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234');
			const customFormatter = () => {
				return 'this is my custom formatted suggestion template';
			};
			//action
			let actual = ludwig.generateSuggestionURL({some: 'state'}, {another: 'result'}, customFormatter);
			//assert
			assert.equal(actual, 'https://github.com/user/repo/new/foobar?filename=suggestions/ludwig-suggestion-1234&value=this%20is%20my%20custom%20formatted%20suggestion%20template');
		});

		it('should return an error if given customSuggestionFormatter is not a function', () => {
			//setup
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'generateSuggestionName').returns('suggestions/ludwig-suggestion-1234');
			//action
			try {
				ludwig.generateSuggestionURL({}, {}, 'a');
				assert.fail('we should not be able to get there');
			} catch (error) {
				assert.equal(error.message, 'customSuggestionFormatter expected to be a clojure');
			}
		});

		it('should throw an error if request URI is invalid. Error message must inform of what is going on.', () => {
			//setup
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			ludwig.template = 'some+template';
			ludwig.prefix = 'suggestions/ludwig-suggestion';
			sinon.stub(ludwig, 'validateSuggestionURL').returns(false);
			//action
			try {
				ludwig.generateSuggestionURL({}, {});
				assert.isTrue(false, 'generateSuggestionURL should throw an error if produced request URI is too large');
			} catch (err) {
				//assert
				assert.equal(err.message, 'Resulting URI is invalid. It\'s either too long for GitHub (you probably want to use Ludwig\'s WS in that case), or empty (check with the developer of your service)');
			}
		});
	});

	describe('validateSuggestionURL', () => {
		it('should return false if suggestionURL is too long (8001+ chars)', () => {
			//setup
			//action
			let actual = ludwig.validateSuggestionURL('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');
			//assert
			assert.equal(actual, false);
		});

		it('should return true if suggestionURL is small enough', () => {
			//setup
			//action
			let actual = ludwig.validateSuggestionURL('some short enough string');
			//assert
			assert.equal(actual, true);
		});

		it('should return false if suggestionURL is empty', () => {
			//setup
			//action
			let actual = ludwig.validateSuggestionURL('');
			//assert
			assert.equal(actual, false);
		});
	});

	describe('acceptedTestsURL', () => {
		it('should concatenate the base URL of the repo and the public URL of the directory in the master branch of the repo where the tests are', () => {
			//setup
			ludwig.repo = 'user/repo';
			ludwig.branch = 'foobar';
			//action
			let actual = ludwig.acceptedTestsURL();
			//assert
			assert.equal(actual, 'https://github.com/user/repo/tree/foobar/tests');
		});
	});

	describe('suggestedTestsURL', () => {
		it('should  concatenate the base URL of the repo and the public URL of the open pull requests', () => {
			//setup
			ludwig.repo = 'user/repo';
			//action
			let actual = ludwig.suggestedTestsURL();
			//assert
			assert.equal(actual, 'https://github.com/user/repo/pulls?utf8=✓&q=is%3Apr+is%3Aopen');
		});
	});

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
		];

		suggestionURLGeneratorFailCases.forEach((testCase) => {
			it(`should throw an error if ${testCase.testTitle} is missing`, () => {
				//setup
				//action
				try {
					ludwig.generateLudwigSuggestionEndpointURL();
					assert.fail('call without proper parameters should throw an error');
				} catch (err) {
					//assert
					assert.equal(err.message, 'Cannot generate Ludwig suggestions creation endpoint URL');
				}
			});
		});

		it('should return a correctly formatted URL to a Ludwig endpoint if all necessary data is set', () => {
			ludwig.ludwigCreateSuggestionURL = 'http://ludwig.foo:3000/createSuggestion';
			let actual = ludwig.generateLudwigSuggestionEndpointURL('customTitle', 'suggestion description', {one: 2}, '{"three":"four"}');
			assert.equal(actual, 'http://ludwig.foo:3000/createSuggestion?title=customTitle&description=suggestion%20description&state=%7B%22one%22%3A2%7D&expectedState=%7B%22three%22%3A%22four%22%7D');
		});
	});
});
