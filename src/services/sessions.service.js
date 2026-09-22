import { UsersRepository } from "../repositories/users.repository.js";
import { createHash } from "../utils/hash.js";

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
