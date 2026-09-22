import { UserModel } from "../models/User.js";

export class UsersDAO {
  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(userData) {
    return await UserModel.create(userData);
  }
}
