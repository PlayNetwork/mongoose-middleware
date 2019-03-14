import chai from 'chai';
import utils from '../../src/utils';

const should = chai.should();

describe('utils', () => {
	it('should do things', () => {
		let
			base = {
				filter : {
					mandatory : {
						contains : {
							deviceId : ['100010001002']
						},
						endsWith : {
							deviceId : '100010001006'
						},
						exact : {
							deviceId : '100010001000'
						},
						ne : {
							deviceId : '100010001007'
						},
						startsWith : {
							deviceId : ['100010001003']
						}
					}
				}
			},
			merged,
			model = {
				filter : {
					mandatory : {
						contains : {
							deviceId : ['100010001003']
						},
						endsWith : {
							deviceId : ['100010001005']
						},
						exact : {
							deviceId : '100010001001'
						},
						ne : 'testbrokenstring',
						startsWith : {
							deviceId : '100010001004'
						}
					},
					optional : {
						exact : {
							deviceId : '100010001002'
						}
					}
				}
			};

		merged = utils.mergeFilters(base, model);

		should.exist(merged);

		merged.filter.mandatory.exact.deviceId.should.be.an('Array');
		merged.filter.mandatory.exact.deviceId.length.should.equal(2);

		merged.filter.optional.exact.deviceId.should.equal('100010001002');

		merged.filter.mandatory.contains.deviceId.should.be.an('Array');
		merged.filter.mandatory.contains.deviceId.length.should.equal(2);

		merged.filter.mandatory.startsWith.deviceId.should.be.an('Array');
		merged.filter.mandatory.startsWith.deviceId.length.should.equal(2);

		merged.filter.mandatory.endsWith.deviceId.length.should.equal(2);

		merged.filter.mandatory.ne.deviceId.should.equal('100010001007');


	});
});
