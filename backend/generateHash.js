// generateHash.js
import bcrypt from "bcrypt";

const password = "admin123"; // change to your desired password

bcrypt.hash(password, 10).then(hash => {
  console.log("Your bcrypt hash is:");
  console.log(hash);
});