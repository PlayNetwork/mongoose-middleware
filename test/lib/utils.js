var
	chai = require('chai'),
	should = chai.should();

describe('utils', function () {
	'use strict';

	var utils = require('../../lib/utils')();

	it('should do things', function () {
		var base = {
				filter : {
					mandatory : {
						exact : {
							deviceId : '100010001000'
						},
						contains : {
							deviceId : ['100010001002']
						},
						startsWith : {
							deviceId : ['100010001003']
						},
						endsWith : {
							deviceId : '100010001006'
						},
						ne : {
							deviceId : '100010001007'
						}
					}
				}
			},
			model = {
				filter : {
					mandatory : {
						exact : {
							deviceId : '100010001001'
						},
						contains : {
							deviceId : ['100010001003']
						},
						startsWith : {
							deviceId : '100010001004'
						},
						endsWith : {
							deviceId : ['100010001005']
						},
						ne : 'testbrokenstring'
					},
					optional : {
						exact : {
							deviceId : '100010001002'
						}
					}
				}
			},
			merged = utils.mergeFilters(base, model);

		merged.filter.mandatory.exact.deviceId.should.be.an('Array');
		merged.filter.mandatory.exact.deviceId.length.should.equal(2);

		merged.filter.optional.exact.deviceId.should.equal('100010001002');

		merged.filter.mandatory.contains.deviceId.should.be.an('Array');
		merged.filter.mandatory.contains.deviceId.length.should.equal(2)

		merged.filter.mandatory.startsWith.deviceId.should.be.an('Array');
		merged.filter.mandatory.startsWith.deviceId.length.should.equal(2);

		merged.filter.mandatory.endsWith.deviceId.length.should.equal(2);

		merged.filter.mandatory.ne.deviceId.should.equal('100010001007');


	});
});
