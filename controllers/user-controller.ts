import { Request, Response, NextFunction } from "express";
import UserService from "../service/user-service";
import "dotenv/config";
import { validationResult } from "express-validator";
import ApiError from "../exceptions/api-error";

const userService = new UserService();

class UserController {
    async registration(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest("Error with validation", errors.array())
                );
            }
            const { email, password } = req.body;
            const userData = await userService.registration(email, password);

            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true
            });

            res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true
            });
            res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie("refreshToken");
            res.json(token);
        } catch (e) {
            next(e);
        }
    }
    async activate(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(String(process.env.CLIENT_URL));
        } catch (e) {
            next(e);
        }
    }
    async refresh(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true
            });
            res.json(userData);
        } catch (e) {
            next(e);
        }
    }
    async getUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

export default UserController;
