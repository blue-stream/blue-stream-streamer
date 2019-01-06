export class StreamerValidatons {
    static isPathValid(path: string, fileExtension: RegExp): boolean {
        return (!!path && path.length < 1024 && fileExtension.test(path));
    }

    static isRangeHeaderValid(range: string): boolean {
        const rangeRegex = new RegExp(/^bytes\=\d+\-(\d+)??$/);
        return rangeRegex.test(range);
    }
}
