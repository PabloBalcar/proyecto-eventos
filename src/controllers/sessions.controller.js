export const getSessions = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Ruta de sessions disponible",
  });
};
