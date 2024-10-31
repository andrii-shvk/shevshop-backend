import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
});

export default model("User", UserSchema);

export interface IUserModel extends Document {
    email: string;
    isActivated: boolean;
    activationLink?: string | null;
}
