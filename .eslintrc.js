// https://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,

	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 2017,
		sourceType: 'module',
	},

	env: {
		browser: true,
	},

	extends: [
		'eslint:recommended',
	],

	// required to lint *.vue files
	plugins: [],

	globals: {
		Promise: true,
		Uint32Array: true,
		Float32Array: true,
		module: true,
		require: true,
		__dirname: true,
		__filename: true,
		process: true,
		describe: true,
		it: true,
		before: true,
		after: true,
		beforeEach: true,
		afterEach: true,
		Buffer: true,
		Set: true,
		expect: true,
	},

	// add your custom rules here
	rules: {
		quotes: [ 'error', 'single' ],

		'quote-props': [ 'error', 'as-needed' ],

		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

		semi: 'error',

		'comma-dangle': [ 'error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'always-multiline',
			functions: 'ignore',
		} ],

		'lines-around-comment': [ 'error', {
			beforeLineComment: false,
			beforeBlockComment: true,
		} ],

		'newline-per-chained-call': [ 'error', {
			ignoreChainWithDepth: 2,
		} ],

		'arrow-parens': [
			'error',
			'as-needed',
		],

		'space-in-parens': [
			'error',
			'always',
		],

		'computed-property-spacing': [
			'error',
			'always',
		],

		'object-curly-spacing': [
			'error',
			'always',
		],

		'array-bracket-spacing': [
			'error',
			'always',
		],

		'no-cond-assign': 'error',
		'no-constant-condition': 'error',
		'no-dupe-args': 'error',
		'no-sparse-arrays': 'error',
		'no-unreachable': 'error',
		'valid-typeof': 'error',
		curly: [
			'error',
			'all',
		],
		'dot-notation': 'error',
		'guard-for-in': 'error',
		'no-caller': 'error',
		'no-eval': 'error',
		'no-lone-blocks': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-param-reassign': [
			'error', {
				props: false,
			},
		],
		'no-redeclare': 'error',
		'no-self-compare': 'error',
		'no-with': 'error',
		radix: 'error',
		'vars-on-top': 'error',
		'wrap-iife': 'error',
		yoda: [
			'error',
			'never',
		],
		'no-shadow': 'error',
		'no-undef': 'error',
		'no-unused-vars': 'error',
		'brace-style': [
			'error',
			'stroustrup',
		],
		camelcase: [
			'error', {
				properties: 'always',
			},
		],
		'func-style': [
			'error',
			'declaration',
		],
		'max-nested-callbacks': [
			'error',
			7,
		],
		'no-array-constructor': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-nested-ternary': 'error',
		'no-var': 'off',
		'object-shorthand': [
			'error',
			'always',
		],
		'prefer-const': 'error',
		'max-params': 'off',
		'space-before-function-paren': [
			'error', {
				anonymous: 'never',
				named: 'never',
			},
		],
		'prefer-arrow-callback': 'off',
		'max-depth': [
			'error',
			4,
		],
		'no-implicit-coercion': 'off',
		complexity: 'off',
		'prefer-template': 'off',
		'babel/new-cap': 'off',
		'new-cap': [
			'error', {
				properties: false,
			},
		],
		'no-loop-func': 'off',
		'no-warning-comments': [ 'error', {
			terms: [ 'fixme' ],
			location: 'anywhere',
		} ],
		'no-console': 'off',
		indent: [ 'error', 'tab', { SwitchCase: 1 } ],
	},
};
