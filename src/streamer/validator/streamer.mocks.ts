import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {
    readonly validProperty: string = '12345';
    readonly validProperty2: string = '23456';
    readonly validProperty3: string = '34567';

    readonly streamer = {
        property: this.validProperty,
    };

    readonly streamer2 = {
        property: this.validProperty2,
    };

    readonly streamer3 = {
        property: this.validProperty3,
    };

    readonly streamerFilter = this.streamer;

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    create = createRequest({
        method: 'POST',
        url: '/api/streamer/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            streamer: this.streamer,
        },
    });

    createMany = createRequest({
        method: 'POST',
        url: '/api/streamer/many/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            streamers: [
                this.streamer,
                this.streamer2,
                this.streamer3,
            ],
        },
    });

    updateMany = createRequest({
        method: 'PUT',
        url: '/api/streamer/many',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            streamerFilter: this.streamerFilter,
            streamer: this.streamer,
        },
    });

    updateById = createRequest({
        method: 'PUT',
        url: '/api/streamer/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
        body: {
            streamer: this.streamer,
        },
    });

    deleteById = createRequest({
        method: 'DELETE',
        url: '/api/streamer/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });

    getOne = createRequest({
        method: 'GET',
        url: `/api/streamer/one?streamerFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.streamer,
    });

    getMany = createRequest({
        method: 'GET',
        url: `/api/streamer/many?streamerFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.streamer,
    });

    getAmount = createRequest({
        method: 'GET',
        url: `/api/streamer/amount?streamerFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.streamer,
    });

    getById = createRequest({
        method: 'GET',
        url: '/api/streamer/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });
}
