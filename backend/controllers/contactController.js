import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";
import { contactNotificationTemplate } from "../utils/emailTemplate.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await Contact.create({ name, email, subject, message });

    // Notify admin - failure here shouldn't block the user's submission
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New contact form: ${subject}`,
      html: contactNotificationTemplate({ name, email, subject, message }),
    }).catch(() => {});

    res.status(201).json({ message: "Message sent successfully", contact });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const adminGetContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
};

export const markContactRead = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(contact);
};
