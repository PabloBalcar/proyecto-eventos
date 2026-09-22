import { generateToken } from "../utils/jwt.js";
import * as sessionService from "../services/session.service.js";
import { CurrentUserDTO } from "../dto/current-user.dto.js";

export const getSessions = (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Ruta de sessions disponible",
  });
};

export const register = (req, res) => {
  const user = req.user;

  const userDTO = new CurrentUserDTO(user);

  return res.status(201).json({
    status: "success",
    message: "Usuario registrado correctamente",
    payload: userDTO,
  });
};

export const login = (req, res) => {
  const user = req.user;

  const tokenUser = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenUser);

  res.cookie("currentUser", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 3600000,
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    status: "success",
    message: "Login correcto",
  });
};

export const getCurrentUser = (req, res) => {
  const userDTO = new CurrentUserDTO(req.user);

  return res.status(200).json({
    status: "success",
    payload: userDTO,
  });
};

export const logout = (req, res) => {
  res.clearCookie("currentUser");

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada",
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await sessionService.getAllUsers();

    return res.status(200).json({
      status: "success",
      payload: users,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message,
    });
  }
};
