const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID;

app.get("/", (req, res) => {
  console.log(`Server ${SERVER_ID} get on port ${PORT}`)
  res.json({
    message: `Response from backend server ${SERVER_ID}`,
    port: PORT
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${SERVER_ID} started on port ${PORT}`);
});