import { UsersRepository } from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const usersRepository = new UsersRepository();

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await usersRepository.findByEmail(normalizedEmail);

  if (userExists) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await createHash(password);

  const newUser = await usersRepository.create({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
  });

  return newUser;
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await usersRepository.findByEmail(normalizedEmail);

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

  const tokenUser = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return generateToken(tokenUser);
};
