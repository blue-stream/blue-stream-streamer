export class StreamerValidatons {
    static isPathValid(path: string): boolean {
        const mp4ExtensionRegex = /.*\.mp4$/i;
        return (!!path && path.length < 1024 && mp4ExtensionRegex.test(path));
    }

    static isRangeHeaderValid(range: string): boolean {
        const rangeRegex = new RegExp(/^bytes\=\d+\-(\d+)??$/);
        return rangeRegex.test(range);
    }
}
