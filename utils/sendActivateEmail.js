import nodemailer from "nodemailer";
import { catchAsync } from "./catchAsync.js";
import { activateTemplate } from "./activateTemplate.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohamedzakaria0006@gmail.com",
    pass: "spek yypy rdfu sfys",
  },
});

export default catchAsync(async function sendActivateEmail(email, url) {
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Verfying your Email", // Subject line
    text: "Please Verify Your Email", // plain text body
    html: activateTemplate(url), // html body
  });
});
