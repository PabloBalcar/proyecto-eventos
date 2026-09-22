import { CategoryModel } from "../models/Category.js";

export class CategoryDAO {
  async findAll() {
    return CategoryModel.find();
  }

  async create(data) {
    return CategoryModel.create(data);
  }
}
