import { expect } from 'chai';
import { StreamerValidator } from './streamer.validator';
import { ValidRequestMocks, responseMock } from './streamer.mocks';
import { PathInvalidError } from '../../utils/errors/userErrors';

describe('Streamer Validator Middleware', function () {
    describe('#isVideoIdValid', function () {
        it('Should not throw an error', function () {
            StreamerValidator.canStreamVideo(new ValidRequestMocks().canStreamVideo, responseMock, (error: Error) => {
                expect(error).to.not.exist;
            });
        });

        it('Should throw PathInvalidError when id is invalid', function () {
            const invalidRequestMock = new ValidRequestMocks().canStreamVideo;
            invalidRequestMock.params.path = `${'a'.repeat(1025)}.mp4`;
            StreamerValidator.canStreamVideo(invalidRequestMock, responseMock, (error: Error) => {
                expect(error).to.exist;
                expect(error).to.be.instanceOf(PathInvalidError);
            });
        });
    });
});
