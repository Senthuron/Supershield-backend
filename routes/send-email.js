import express from "express";
import nodemailer from "nodemailer";
import { getDb } from "../lib/mongodb.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  try {
    const {
      type = "contact",
      firstName,
      lastName,
      fullName,
      email,
      phone,
      companyName,
      country,
      city,
      state,
      customerCategory,
      subject,
      message,
      position,
      product,
      agree,
      resume,
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let emailSubject = `[Supershield ${type[0].toUpperCase() + type.slice(1)}] ${
      subject || ""
    }`;
    let emailHtml = "";
    let attachments = [];

    if (type === "career") {
      emailHtml = `
        <h2>New Career Application</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Agree to Terms:</strong> ${agree}</p>
      `;

      if (resume) {
        const match = resume.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const extension = mimeType.split("/")[1] || "pdf";

          const sizeInBytes = (base64Data.length * 3) / 4;
          if (sizeInBytes > 1024 * 1024 * 2.5) {
            return res
              .status(400)
              .json({ success: false, error: "Resume too large" });
          }

          attachments.push({
            filename: `resume.${extension}`,
            content: Buffer.from(base64Data, "base64"),
            contentType: mimeType,
          });
        } else {
          emailHtml += `<p><strong>Resume:</strong> Invalid format</p>`;
        }
      } else {
        emailHtml += `<p><strong>Resume:</strong> Not provided</p>`;
      }
    } else if (type === "enquiry") {
      emailHtml = `
        <h2>New Product Enquiry</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <p><strong>Product:</strong> ${product || "Not specified"}</p>
      `;
    } else {
      emailHtml = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Location:</strong> ${city}, ${state}, ${country}</p>
        <p><strong>Customer Category:</strong> ${customerCategory}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `;
    }

    const createdAt = new Date();
    const baseDoc = {
      type,
      firstName: firstName || null,
      lastName: lastName || null,
      fullName:
        fullName ||
        (firstName && lastName ? `${firstName} ${lastName}` : null),
      email: email || null,
      phone: phone || null,
      companyName: companyName || null,
      location: {
        city: city || null,
        state: state || null,
        country: country || null,
      },
      customerCategory: customerCategory || null,
      subject: subject || null,
      message: message || null,
      product: product || null,
      position: position || null,
      agree: typeof agree === "boolean" ? agree : null,
      createdAt,
      userAgent: req.headers["user-agent"] || null,
      ip:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        null,
    };

    if (type === "career") {
      let resumeMeta = null;
      if (resume) {
        const match = resume.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const sizeInBytes = (base64Data.length * 3) / 4;
          resumeMeta = { mimeType, sizeInBytes };
        }
      }
      baseDoc.resume = resumeMeta;
    }

    let insertedId = null;
    try {
      const db = await getDb("supershield");
      const collection = db.collection("enquire-management");
      const result = await collection.insertOne(baseDoc);
      insertedId = result.insertedId;
    } catch (dbErr) {
      console.error("Mongo insert error:", dbErr);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: emailSubject,
      html: emailHtml,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, id: insertedId });
  } catch (error) {
    console.error("Email send error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Email send failed" });
  }
});

export default router;
