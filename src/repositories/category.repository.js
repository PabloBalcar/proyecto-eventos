import { CategoryDAO } from "../dao/category.dao.js";

const categoryDAO = new CategoryDAO();

export const getCategories = async () => {
  return categoryDAO.findAll();
};

export const createCategory = async (data) => {
  return categoryDAO.create(data);
};
