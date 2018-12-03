import { UserError } from './applicationError';

export class PropertyInvalidError extends UserError {
    constructor(message?: string) {
        super(message || `Property is invalid`, 400);
    }
}

export class IdInvalidError extends UserError {
    constructor(message?: string) {
        super(message || `Id is invalid`, 400);
    }
}

export class StreamerNotFoundError extends UserError {
    constructor(message?: string) {
        super(message || `Streamer not found`, 404);
    }
}
