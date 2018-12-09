import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { uploadFile, deleteFile, listFiles } from '../utils/s3';
import * as fs from 'fs';

const apiEndpoint = '/api/streamer/video';
const testFilesPath = './src/test-files';
const { maxChunkSize } = config.streamer;

describe('Streamer Module', () => {
    let server: Server;
    let videoFileSize: number;

    before(async () => {
        await uploadFile(`${testFilesPath}/video.mp4`, 'video.mp4', 'video/mp4');
        await uploadFile(`${testFilesPath}/text.txt`, 'text.txt');

        videoFileSize = fs.statSync(`${testFilesPath}/video.mp4`).size;

        server = Server.bootstrap();
    });

    after(async () => {
        await deleteFile('video.mp4');
        await deleteFile('text.txt');
    });

    describe('Stream video', () => {
        context('Valid requests', () => {
            it('Should return the whole video file (for downloading)', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', videoFileSize.toString())
                    .expect(200);
            });

            it('Should stream first chunk', async () => {
                await request(server.app)
                    .get('/api/streamer/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=0-')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes 0-${maxChunkSize}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream middle chunk of video', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=${videoFileSize / 2}-${(videoFileSize / 2) + maxChunkSize}`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes ${videoFileSize / 2}-${(videoFileSize / 2) + maxChunkSize}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream last chunk of video', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', `bytes=${videoFileSize - 1 - maxChunkSize}-${videoFileSize - 1}`)
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', (maxChunkSize + 1).toString())
                    .expect('content-range', `bytes ${videoFileSize - 1 - maxChunkSize}-${videoFileSize - 1}/${videoFileSize}`)
                    .expect(206);
            });

            it('Should stream multiple chunks of video', async () => {

                let totalChunkSize = 0;
                let x = 0;

                while (totalChunkSize < videoFileSize) {
                    await request(server.app)
                        .get(`${apiEndpoint}/video.mp4`)
                        .set('Accept', '*/*')
                        .set('Range', `bytes=${totalChunkSize + x}-`)
                        .expect('Content-Type', 'video/mp4')
                        .expect('Content-Length', `${Math.min(maxChunkSize, videoFileSize - (totalChunkSize + x + 1)) + 1}`)
                        .expect('content-range', `bytes ${totalChunkSize + x}-${totalChunkSize + x + Math.min(maxChunkSize, videoFileSize - (totalChunkSize + x + 1))}/${videoFileSize}`)
                        .expect(206);

                    totalChunkSize += Math.min(maxChunkSize, videoFileSize - totalChunkSize);
                    x = 1;
                }

                // const chunksAmount = Math.ceil(videoFileSize / maxChunkSize);
                // const chunkSize = maxChunkSize;

                // for (let i = 1; i <= chunksAmount; i++) {
                //     const start = (i - 1) * chunkSize;
                //     const end = i * chunkSize;

                //     await request(server.app)
                //         .get(`${apiEndpoint}/video.mp4`)
                //         .set('Accept', '*/*')
                //         .set('Range', `bytes=${start}-${end}`)
                //         .expect('Content-Type', 'video/mp4')
                //         .expect('Content-Length', `${end - start + 1}`)
                //         .expect('content-range', `bytes ${start}-${end}/${videoFileSize}`)
                //         .expect(206);
                // }
            });
        });

        context('Bad requests', () => {
            it('Should not stream chunk of video from negative range', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=-100000-200000')
                    .expect(416);
            });

            it('Should not stream chunk of video end before start', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=20000-10000')
                    .expect(416);
            });

            it('Should not stream chunk of video end equals start', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-100000')
                    .expect(416);
            });

            it('Should not stream chunk of video end after max video size', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/video.mp4`)
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-2000000')
                    .expect(416);
            });

            it('Should not stream a non video file', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/text.txt`)
                    .expect(400);
            });
        });

        context('Not found video', () => {
            it('Should not stream not found video file', async () => {
                await request(server.app)
                    .get(`${apiEndpoint}/no-video.mp4`)
                    .expect(404);
            });
        });
    });
});
