import { registerUser } from "../services/sessions.service.js";

export const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ruta de sessions disponible",
  });
};

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "El email no tiene un formato válido",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const newUser = await registerUser({
      first_name,
      last_name,
      email,
      password,
    });

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      payload: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        status: "error",
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};
