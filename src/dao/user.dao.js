import { UserModel } from "../models/User.js";

export class UserDAO {
  async findById(id) {
    return UserModel.findById(id);
  }

  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(data) {
    return UserModel.create(data);
  }

  async findAll() {
    return UserModel.find().select("-password");
  }
}
