var assert = require('assert');
var calculator = require('../sampleTest');

describe('test', function ()
{
	describe('add function', function ()
	{
		it('adds numbers', function ()
		{
			var result = calculator.add(1, 1);
			assert.equal(result, 2);
		});
	});
});