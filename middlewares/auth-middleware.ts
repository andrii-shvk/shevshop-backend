import { Request, Response, NextFunction } from "express";
import ApiError from "../exceptions/api-error";
import TokenService from "../service/token-service";

const tokenService = new TokenService();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader) {
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);
        if(!userData) {
            return next(ApiError.UnauthorizedError());
        }

        (req as any).user = userData;
        next();
    } catch(e) {
        return next(ApiError.UnauthorizedError());
    }
}

export default authMiddleware;