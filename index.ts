import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./router";
import errorMiddleware from "./middlewares/error-middleware";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const dbUrl = process.env.DB_URL;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use("/api", router);
app.use(errorMiddleware);

const start = async () => {
    try {
        if (!dbUrl) {
            throw new Error(
                "DB_URL is not defined in the environment variables"
            );
        }
        await mongoose.connect(dbUrl);
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();