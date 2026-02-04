import express from "express";
import ViteExpress from "vite-express";

const app = express();
const PORT = 3000;

app.get("/message", (request, response) => 
    response.send("Hello from express!"));

ViteExpress.listen(app, PORT, () => 
    console.log(`Server is listening on port ${PORT}`));