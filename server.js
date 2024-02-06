import app from "./app.js";
import mongoose from "mongoose";

mongoose
  .connect(
    `mongodb+srv://admin:VXydKlJ8teDpm8nf@myatlasclusteredu.trp0qpk.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected!"));

app.listen(3000, () => {
  console.log("listening on port 3000");
});
