const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error");
const dotenv = require("dotenv");
const app = express();

const path = "./config/config.env";
// const path = "./config/local.env";

dotenv.config({ path });
console.log(process.env.NODE_ENV, "env");
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    credentials: true,
  })
);

app.get("/", (req, res, next) => res.json({ message: "Server is running" }));

const { adminRoute, userRoute, levelRoute, warrantyRoute, transactionRoute, paymentRoute } = require("./src");

app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);
app.use("/api/level", levelRoute);
app.use("/api/warranty", warrantyRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/payment", paymentRoute);

app.all("*", async (req, res) => {
  res
    .status(404)
    .json({
      error: {
        message: "Not Found. Kindly Check the API path as well as request type",
      },
    });
});

app.use(errorMiddleware);

module.exports = app;

