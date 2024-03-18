const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Mongoose db success"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
