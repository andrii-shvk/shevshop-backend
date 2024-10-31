import { IUserModel } from "../models/user-model";

export default class UserDto {
    email: string;
    id: string;
    isActivated: boolean;

    constructor(model: IUserModel) {
        this.email = model.email;
        this.id = model.id.toString();
        this.isActivated = model.isActivated;
    }
}