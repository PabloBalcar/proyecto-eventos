import { UsersDAO } from "../dao/users.dao.js";

const usersDAO = new UsersDAO();

export class UsersRepository {
  async findByEmail(email) {
    return await usersDAO.findByEmail(email);
  }

  async create(userData) {
    return await usersDAO.create(userData);
  }
}
