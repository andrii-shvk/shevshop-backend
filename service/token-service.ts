import jwt from "jsonwebtoken";
import tokenModel from "../models/token-model";
import dotenv from "dotenv";
dotenv.config();

interface TokenPayload {
    id: string;
    email: string;
}

class TokenService {
    private getSecretKey(keyName: string): string {
        const key = process.env[keyName];
        if (!key) {
            throw new Error(
                `${keyName} is not defined in the environment variables`
            );
        }
        return key;
    }

    generateTokens(payload: TokenPayload): {
        accessToken: string;
        refreshToken: string;
    } {
        const accessToken = jwt.sign(
            payload,
            this.getSecretKey("JWT_ACCESS_SECRET"),
            {
                expiresIn: "30m",
            }
        );
        const refreshToken = jwt.sign(
            payload,
            this.getSecretKey("JWT_REFRESH_SECRET"),
            {
                expiresIn: "30d",
            }
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(
                token,
                String(process.env.JWT_ACCESS_SECRET)
            );
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token: string) {
        try {
            const userData = jwt.verify(
                token,
                String(process.env.JWT_REFRESH_SECRET)
            );
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId: string, refreshToken: string) {
        const tokenData = await tokenModel.findOne({ user: userId });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({ user: userId, refreshToken });
        return token;
    }

    async removeToken(refreshToken: string) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken: string) {
        const tokenData = await tokenModel.findOne({ refreshToken });
        return tokenData;
    }
}

export default TokenService;
