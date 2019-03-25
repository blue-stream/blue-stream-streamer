export const config = {
    logger: {
        elasticsearch: process.env.LOGGER_ELASTICSEARCH && {
            hosts: process.env.LOGGER_ELASTICSEARCH.split(','),
        },
    },
    server: {
        port: 3000,
        name: 'blue-stream-streamer',
    },
    authentication: {
        cookieName: process.env.AUTHENTICATION_COOKIE_NAME || 'bs-token',
        required: +(process.env.AUTHENTICATION_REQUIRED || 1),
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
    apm: {
        server: process.env.APM_SERVER || 'http://apm:8200',
        isActive: process.env.APM_ACTIVE || true,
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
    videoToken: {
        tokenName: process.env.VIDEO_TOKEN_NAME || 'video-token',
        secret: process.env.VIDEO_TOKEN_SECRET || 'video@bs2019!',
    },
};
