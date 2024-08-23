import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Router } from "express";
import routes from "./routes/index.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

//carregar configs
dotenv.config();

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPass}@cluster0.7t5b5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(4200);
    console.log("db connect");
  })
  .catch();

const PORT = process.env.PORT;

app.listen(PORT, function () {
  console.log("RODANDO NA PORTA:", PORT);
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

// rota privada

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(440).json({ msg: "user not found" });
  }

  return res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "token invalido!" });
  }
}

// registrar usuários
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name) {
    return res.status(422).json({ msg: "nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "senha é obrigatório" });
  }
  if (password !== confirmPassword) {
    return res.status(422).json({ msg: "Senha não coincide" });
  }

  //check if user exists

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({
      msg: "Email já utilizado.",
    });
  }

  // create hash salt password

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "usuario criado!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "erro no servidor",
    });
  }
});

// Login user

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  // validation

  if (!email) {
    return res.status(422).json({ msg: "email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "senha é obrigatório" });
  }

  // check if user exists

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(422).json({ msg: "usuário não encontrado" });
  }

  // check password
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "senha incorreta" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "autenticado com sucesso!", token });
  } catch (error) {
    console.error(error);
  }
});
