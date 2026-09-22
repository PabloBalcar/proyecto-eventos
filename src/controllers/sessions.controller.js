import { generateToken } from "../utils/jwt.js";

export const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ruta de sessions disponible",
  });
};

export const register = (req, res) => {
  const user = req.user;

  return res.status(201).json({
    status: "success",
    message: "Usuario registrado correctamente",
    payload: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
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
  const { id, email, role } = req.user;

  return res.status(200).json({
    status: "success",
    payload: {
      id,
      email,
      role,
    },
  });
};

export const logout = (req, res) => {
  res.clearCookie("currentUser");

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada",
  });
};
