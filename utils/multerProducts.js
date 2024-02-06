import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, uuidv4() + file.originalname);
  },
});

const upload = multer({ storage });

export const uploadMulterImage = upload.single("image");
