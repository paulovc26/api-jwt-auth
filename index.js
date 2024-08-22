import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Router } from "express";
import routes from "./routes/index.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.listen(PORT, function () {
  console.log("RODANDO NA PORTA:", PORT);
});

app.get("/", function (req, res) {
  res.send("hello world!");
});
