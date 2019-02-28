require('dotenv').config();

export const config = {
    logger: {
        durable: false,
        exchangeType: process.env.RMQ_LOGGER_TYPE || 'topic',
        exchange: process.env.RMQ_LOGGER_EXCHANGE || 'blue_stream_logs',
        host: process.env.RMQ_LOGGER_HOST || 'localhost',
        port: +(process.env.RMQ_LOGGER_PORT || 15672),
        password: process.env.RMQ_LOGGER_PASS || 'guest',
        username: process.env.RMQ_LOGGER_USER || 'guest',
        persistent: false,
    },
    server: {
        port: 3000,
        name: 'streamer',
    },
    authentication: {
        required: +(process.env.AUTHENTICATION_REQUIRED || 0),
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200'],
    },
    s3: {
        region: process.env.S3_REGION || '',
        bucket: process.env.S3_BUCKET || 'blue-stream-test',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minio',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minio123',
        signatureVersion: process.env.S3_VERSION || 'v4',
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    },
    streamer: {
        maxChunkSize: +(process.env.MAX_CHUNK_SIZE_MB || 1) * 1024 * 1024, // 1Mb
    },
    sourceType: {
        video: /.*\.mp4$/i,
        thumbnail: /.*\.png$/i,
        preview: /.*\.gif$/i,
    },
};
