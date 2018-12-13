import { expect } from 'chai';
import { StreamerValidator } from './streamer.validator';
import { PathInvalidError, RangeHeaderInvalidError } from '../../utils/errors/userErrors';
import { config } from '../../config';

describe('Streamer Validator Middleware', function () {

    describe('#validatePath', function () {
        it('Should return undefined when path is valid', function () {
            expect(StreamerValidator.validatePath('video.mp4', config.sourceType.video)).to.be.undefined;
        });
        it('Should return PathInvalidError when path is too long', function () {
            expect(StreamerValidator.validatePath('a'.repeat(1025), config.sourceType.video)).to.be.instanceOf(PathInvalidError);
        });
        it('Should return PathInvalidError when path doesn\'t have mp4 extension', function () {
            expect(StreamerValidator.validatePath('video.avi', config.sourceType.video)).to.be.instanceOf(PathInvalidError);
        });
        it('Should return PathInvalidError when path doesn\'t have any extension', function () {
            expect(StreamerValidator.validatePath('video', config.sourceType.video)).to.be.instanceOf(PathInvalidError);
        });
    });

    describe('#validateRangeHeader', function () {
        it('Should return undefined when range header is valid', function () {
            expect(StreamerValidator.validateRangeHeader('bytes=100-2000')).to.be.undefined;
        });
        it('Should return undefined when range header is valid but not contains the `end` property', function () {
            expect(StreamerValidator.validateRangeHeader('bytes=100-')).to.be.undefined;
        });
        it('Should return RangeHeaderInvalidError when range header does not contain `start` property', function () {
            const err = StreamerValidator.validateRangeHeader('bytes=-100');
            expect(err).to.be.instanceOf(RangeHeaderInvalidError);
        });
        it('Should return RangeHeaderInvalidError when range header is not in a bytes format', function () {
            const err = StreamerValidator.validateRangeHeader('test=0-100');
            expect(err).to.be.instanceOf(RangeHeaderInvalidError);
        });
    });
});
