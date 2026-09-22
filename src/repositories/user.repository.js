import { UserDAO } from "../dao/user.dao.js";

const userDAO = new UserDAO();

export const findById = async (id) => {
  return userDAO.findById(id);
};

export const findByEmail = async (email) => {
  return userDAO.findByEmail(email);
};

export const createUser = async (data) => {
  return userDAO.create(data);
};

export const findAllUsers = async () => {
  return userDAO.findAll();
};
