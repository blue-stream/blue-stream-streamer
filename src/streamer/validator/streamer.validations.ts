export class StreamerValidatons {
    static isPathValid(path: string): boolean {
        return (!!path && path.length < 1024);
    }
}
