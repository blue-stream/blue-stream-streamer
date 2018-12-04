import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { uploadFile, deleteFile, listFiles } from '../utils/s3';

describe('Streamer Module', () => {
    let server: Server;

    before(async () => {
        await uploadFile('./src/test-files/moov2.mp4', 'moov2.mp4', 'video/mp4');
        await uploadFile('./src/test-files/text.txt', 'text.txt');
        server = Server.bootstrap();
    });

    after(async () => {
        // await deleteFile('video.mp4');
        // await deleteFile('text.txt');
    });

    describe('Stream video', () => {
        context('Valid requests', () => {
            it('Should return the whole video file (for downloading)', async () => {
                await request(server.app)
                    .get('/api/streamer/video/video.mp4')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', '1285179')
                    .expect(200);
            });

            it('Should stream first chunk of video', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=0-500000')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', '500001')
                    .expect('content-range', 'bytes 0-500000/1285179')
                    .expect(206);
            });

            it('Should stream middle chunk of video', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=500000-1000000')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', '500001')
                    .expect('content-range', 'bytes 500000-1000000/1285179')
                    .expect(206);
            });

            it('Should stream last chunk of video', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=1000000-1285179')
                    .expect('Content-Type', 'video/mp4')
                    .expect('Content-Length', '285180')
                    .expect('content-range', 'bytes 1000000-1285179/1285179')
                    .expect(206);
            });

            it('Should stream multiple chunks of video', async () => {
                const NUM_OF_CHUNKS = 6;
                const CHUNK_PIECE = Math.floor(1285179 / NUM_OF_CHUNKS);

                for (let i = 1; i <= NUM_OF_CHUNKS; i++) {
                    const START = (i - 1) * CHUNK_PIECE;
                    const END = i * CHUNK_PIECE;

                    await request(server.app)
                        .get('/video/video.mp4')
                        .set('Accept', '*/*')
                        .set('Range', `bytes=${START}-${END}`)
                        .expect('Content-Type', 'video/mp4')
                        .expect('Content-Length', `${END - START + 1}`)
                        .expect('content-range', `bytes ${START}-${END}/1285179`)
                        .expect(206);
                }
            });
        });

        context('Bad requests', () => {
            it('Should not stream chunk of video from negative range', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=-100000-200000')
                    .expect(400);
            });

            it('Should not stream chunk of video end before start', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-10000')
                    .expect(400);
            });

            it('Should not stream chunk of video end equals start', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-100000')
                    .expect(400);
            });

            it('Should not stream chunk of video end after max video size', async () => {
                await request(server.app)
                    .get('/video/video.mp4')
                    .set('Accept', '*/*')
                    .set('Range', 'bytes=100000-2000000')
                    .expect(400);
            });

            it('Should not stream a non video file', async () => {
                await request(server.app)
                    .get('/video/text.txt')
                    .expect(400);
            });
        });

        context('Not found video', () => {
            it('Should not stream not found video file', async () => {
                await request(server.app)
                    .get('/video/notExistsVideo.mp4')
                    .expect(404);
            });
        });
    });
});
