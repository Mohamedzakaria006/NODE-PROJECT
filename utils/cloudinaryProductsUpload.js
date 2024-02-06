import { v2 as cloudinary } from "cloudinary";
import { catchAsync } from "./catchAsync.js";
import AppError from "./appError.js";

cloudinary.config({
  cloud_name: "dfzuxdmy3",
  api_key: 617935332289497,
  api_secret: "SnyMEDPChfctRLwG5chef_KuLgs",
  secure: true,
});

export const uploadImage = catchAsync(async function (req, res, next) {
  const data = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "products" },
    function (err, results) {
      if (err) {
        return next(new AppError("failed to upload the photo", 400));
      }
    }
  );
  req.results = data;
  next();
});
