import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    canStreamVideo = createRequest({
        method: 'GET',
        url: '/api/streamer/video/:path',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            path: 'test.mp4',
        },
    });
}
