import { UserError } from './applicationError';

export class PathInvalidError extends UserError {
    constructor(message?: string) {
        super(message || 'Path is invalid', 400);
    }
}

export class RangeHeaderInvalidError extends UserError {
    constructor() {
        super('Range header is not in the correct format', 416);
    }
}

export class ResourceNotFoundError extends UserError {
    constructor(message?: string) {
        super(message || 'Resource not found', 404);
    }
}
