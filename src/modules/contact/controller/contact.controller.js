// modules/contact/controller/contact.controller.js
const contactService = require("../services/contact.service");

exports.createContact = async (req, res) => {
  try {
    const result = await contactService.createContact(req.body);
    return res.status(201).json({
      message: "Contacto creado exitosamente",
      contact: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno",
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id);
    return res.status(200).json({ contact });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno",
    });
  }
};