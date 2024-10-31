import userModel, { IUserModel } from "../models/user-model";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import MailService from "./mail-service";
import TokenService from "./token-service";
import UserDto from "../dtos/user-dto";
import ApiError from "../exceptions/api-error";
import { JwtPayload } from "jsonwebtoken";

const mailService = new MailService();
const tokenService = new TokenService();

class UserService {

    private async createAndSaveToken(user:IUserModel) {
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto };
    }

    async registration(email: string, password: string) {
        const candidate = await userModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest(
                `User with this email ${email} is already exist!`
            );
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuidv4();

        const user = await userModel.create({
            email,
            password: hashPassword,
            activationLink,
        });
        await mailService.sendActivationMail(
            email,
            `${process.env.API_URL}/api/activate/${activationLink}`
        );

        return this.createAndSaveToken(user);
    }

    async activate(activationLink: string) {
        const user = await userModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest("Incorrect activation link!");
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email: string, password: string) {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest("User with this email is not found");
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest("Incorrect password");
        }

        return this.createAndSaveToken(user);
    }

    async logout(refreshToken: string) {
        const token = tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken) as JwtPayload;
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData && !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await userModel.findById(userData.id);
        if (!user) {
            throw ApiError.UnauthorizedError();
        }

        return this.createAndSaveToken(user);
    }

    async getAllUsers() {
        const users = await userModel.find();
        return users;
    }
}

export default UserService;
