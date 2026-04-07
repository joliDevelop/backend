// modules/contact/repository/contact.repository.js
const Contact = require("../models/contact.model");

exports.createContact = (data) => {
  const contact = new Contact(data);
  return contact.save();
};

exports.getAllContacts = () => {
  return Contact.find().sort({ createdAt: -1 });
};

exports.getContactById = (id) => {
  return Contact.findById(id);
};