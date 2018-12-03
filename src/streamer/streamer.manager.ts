import { IStreamer } from './streamer.interface';

export class StreamerManager {
    static async create(streamer: IStreamer) {
        return { created: streamer.property };
    }
}
