import * as fs from 'fs';
import { sign } from 'jsonwebtoken';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { deleteFile, uploadFile } from '../utils/s3';

const streamerApiEndpoint = '/api/streamer/';
const apiVideoEndpoint = `${streamerApiEndpoint}/video`;
const apiThumbnailEndpoint = `${streamerApiEndpoint}/thumbnail`;
const apiPreviewEndpoint = `${streamerApiEndpoint}/preview`;
const testFilesPath = './src/test-files';
const { maxChunkSize } = config.streamer;
const testVideoFilename = 'video.mp4';
const testPreviewFilename = 'preview.gif';
const testThumbnailFilename = 'thumbnail.png';
const testTextFilename = 'text.txt';

describe('Streamer Module', () => {
    let server: Server;
    let videoFileSize: number;
    const authCookie = `${config.authentication.cookieName}=${sign({ id: 'user@domain' }, config.authentication.secret)}`;
    const videoToken = sign({ user: 'user@domain', path: testVideoFilename }, config.videoToken.secret);

    before(async () => {
        await uploadFile(`${testFilesPath}/${testVideoFilename}`, testVideoFilename, 'video/mp4');
        await uploadFile(`${testFilesPath}/${testTextFilename}`, testTextFilename);
        await uploadFile(`${testFilesPath}/${testThumbnailFilename}`, testThumbnailFilename, 'image/png');
        await uploadFile(`${testFilesPath}/${testPreviewFilename}`, testPreviewFilename);

        videoFileSize = fs.statSync(`${testFilesPath}/${testVideoFilename}`).size;

        server = Server.bootstrap();
    });

    after(async () => {
        await deleteFile(testVideoFilename);
        await deleteFile(testTextFilename);
        await deleteFile(testThumbnailFilename);
        await deleteFile(testPreviewFilename);
    });

    describe('Stream video', () => {
        context('Valid requests', () => {
            it('Should return the whole video file (for downloading)', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .query({ [config.videoToken.tokenName]: videoToken })
                    .set('Cookie', authCookie)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', videoFileSize.toString())
                    .expect(200);
            });

            it('Should stream first chunk', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=0-')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes 0-${maxChunkSize}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream middle chunk of video', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=${videoFileSize / 2}-${(videoFileSize / 2) + maxChunkSize}`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes ${videoFileSize / 2}-${(videoFileSize / 2) + maxChunkSize}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream last chunk of video', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=${videoFileSize - 1 - maxChunkSize}-${videoFileSize - 1}`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes ${videoFileSize - 1 - maxChunkSize}-${videoFileSize - 1}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream whole chunks of video', async () => {

                let totalChunkSize = 0;
                let nextByte = 0;

                while (totalChunkSize < videoFileSize) {
                    await request(server.app)
                        .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                        .set('Cookie', authCookie)
                        .query(`${config.videoToken.tokenName}=${videoToken}`)
                        .set('Accept', '*/*')
                        .set('Range', `bytes=${totalChunkSize + nextByte}-`)
                        .expect('Content-Type', 'video/mp4')
                        .expect('Content-Length', `${Math.min(maxChunkSize, videoFileSize - (totalChunkSize + nextByte + 1)) + 1}`)
                        .expect('content-range', `bytes ${totalChunkSize + nextByte}-${totalChunkSize + nextByte + Math.min(maxChunkSize, videoFileSize - (totalChunkSize + nextByte + 1))}/${videoFileSize}`)
                        .expect(206);

                    totalChunkSize += Math.min(maxChunkSize, videoFileSize - totalChunkSize);
                    nextByte = 1;
                }
            });

            it('Should stream specific chunk size (<maxChunkSize)', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=500-724')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', '225')
                    .expect('content-range', `bytes 500-724/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream max chunk size (when chunksize>maxChunkSize)', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=100-${maxChunkSize * 2}`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes 100-${maxChunkSize + 100}/${videoFileSize}`)
                    .expect(206);
            });
        });

        context('Bad requests', () => {
            it('Should not stream chunk of video from negative range', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=-100000-200000')
                    .expect(416);
            });

            it('Should not stream chunk of video end before start', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=20000-10000')
                    .expect(416);
            });

            it('Should not stream chunk of video end equals start', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-100000')
                    .expect(416);
            });

            it('Should not stream chunk of video end after max video size', async () => {
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testVideoFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=${videoFileSize - 200}-${videoFileSize + 200}`)
                    .expect(416);
            });

            it('Should not stream a non video file', async () => {
                const token = sign({ user: 'user@domain', path: testTextFilename }, config.videoToken.secret);
                await request(server.app)
                    .get(`${apiVideoEndpoint}/${testTextFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${token}`)
                    .expect(400);
            });
        });

        context('Not found video', () => {
            it('Should not stream not found video file', async () => {
                const token = sign({ user: 'user@domain', path: 'no-video.mp4' }, config.videoToken.secret);
                await request(server.app)
                    .get(`${apiVideoEndpoint}/no-video.mp4`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${token}`)
                    .expect(404);
            });
        });
    });

    describe('Get thumbnail', () => {
        context('Valid requests', () => {
            it('Should return found thumbnail', async () => {
                await request(server.app)
                    .get(`${apiThumbnailEndpoint}/${testThumbnailFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(200);
            });
        });

        context('Bad requests', () => {
            it('Should not return thumbnail without suffix', async () => {
                await request(server.app)
                    .get(`${apiThumbnailEndpoint}/thumbnail`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(400);
            });

            it('Should not return thumbnail with invalid suffix', async () => {
                await request(server.app)
                    .get(`${apiThumbnailEndpoint}/thumbnail.mp4`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(400);
            });
        });

        context('Not found thumbnail', async () => {
            it('Should not return non found thumbnail file', async () => {
                await request(server.app)
                    .get(`${apiThumbnailEndpoint}/no-thumbnail.png`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(404);
            });
        });
    });

    describe('Get preview', () => {
        context('Valid requests', () => {
            it('Should return found preview', async () => {
                await request(server.app)
                    .get(`${apiPreviewEndpoint}/${testPreviewFilename}`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(200);
            });
        });

        context('Bad requests', () => {
            it('Should not return preview without suffix', async () => {
                await request(server.app)
                    .get(`${apiPreviewEndpoint}/preview`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(400);
            });

            it('Should not return preview with invalid suffix', async () => {
                await request(server.app)
                    .get(`${apiPreviewEndpoint}/preview.gf`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(400);
            });
        });

        context('Not found preview', () => {
            it('Should not return non found preview file', async () => {
                await request(server.app)
                    .get(`${apiPreviewEndpoint}/no-preview.gif`)
                    .set('Cookie', authCookie)
                    .query(`${config.videoToken.tokenName}=${videoToken}`)
                    .expect(404);
            });
        });
    });
});
