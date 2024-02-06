import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohamedzakaria0006@gmail.com",
    pass: "spek yypy rdfu sfys",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendResetPassword(email, token) {
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Reset Password Token", // Subject line
    text: "Here is your reset password Token", // plain text body
    html: `Here it is your reset Password token : ${token}`, // html body
  });
}

export default sendResetPassword;
