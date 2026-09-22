import * as userRepository from "../repositories/user.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  if (!first_name || !last_name || !email || !password) {
    const error = new Error("Faltan campos obligatorios");
    error.status = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    const error = new Error("El email no tiene un formato válido");
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("La contraseña debe tener al menos 6 caracteres");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await userRepository.findByEmail(normalizedEmail);

  if (userExists) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await createHash(password);

  return userRepository.createUser({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });
};

export const validateLogin = async (email, password) => {
  if (!email || !password) {
    const error = new Error("Email y contraseña son obligatorios");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  const validPassword = await isValidPassword(password, user.password);

  if (!validPassword) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  return user;
};

export const getUserById = async (id) => {
  return userRepository.findById(id);
};

export const getAllUsers = async () => {
  return userRepository.findAllUsers();
};
