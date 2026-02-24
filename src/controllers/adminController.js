 exports.getDashboardData = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Dashboard OK",
      userFromToken: req.user, // para confirmar auth/rol
    });
  } catch (err) {
    console.error("Error getDashboardData:", err);
    return res.status(500).json({ message: "Error al obtener dashboard" });
  }
};