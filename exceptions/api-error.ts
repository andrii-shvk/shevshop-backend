export default class ApiError extends Error {
    status: number;
    errors: Array<string | Record<string, any>>;

    constructor(status: number, message: string, errors: Array<string | Record<string, any>> = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static UnauthorizedError() {
        return new ApiError(401, "User is not authorized");
    }

    static BadRequest(message: string, errors: Array<string | Record<string, any>> = []) {
        return new ApiError(400, message, errors);
    }
}
