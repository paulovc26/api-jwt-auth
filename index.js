import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Router } from "express";
import routes from "./routes/index.js";
import { connectToDatabase } from "./db/connection.js";

//carregar configs
dotenv.config();
main().catch(console.error);

const PORT = process.env.PORT;

const app = express();

async function main() {
  await connectToDatabase();
}

app.listen(PORT, function () {
  console.log("RODANDO NA PORTA:", PORT);
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});
