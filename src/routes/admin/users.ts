import express from "express";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

import User from "../../models/User";
import { registerValidation } from "../../utils/validation";

const router = express.Router();



/**
 * @swagger
 * /admin/users/add:
 *    post:
 *      tags:
 *        - /admin
 *      summary: Add a user
 *      parameters:
 *        - in: header
 *          name: user
 *          description: User to add
 *          required: true
 *          schema:
 *            $ref: '#/definitions/User'
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *          schema:
 *            type: "object"
 *            properties:
 *              _id:
 *                type: string
 *              user:
 *                type: string
 *              dateUploaded:
 *                type: string
 *                format: date
 *        400:
 *          description: Bad Request
 *          schema:
 *            type: string
 *            example: "User already exists in system!"
 *        401:
 *          description: Unauthorized (No token provided)
 *        500:
 *          description: Internal Server Error
 */
router.post("/add", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(401).send(error.details[0].message);

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const accountType = req.body.accountType;

  let query = { email: email };

  const emailExists = await User.findOne(query);
  if (emailExists)
    return res.status(400).send("Email already exists in system!");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    _id: uuidv4(),
    name: name,
    email: email,
    password: hashedPassword,
    accountType: accountType,
  });

  try {
    const newUser = await user.save();
    res.send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      dateCreated: newUser.dateCreated,
      accountType: newUser.accountType,
    });
  } catch (err) {
    res.status(500).send("An error has occured. Please contact a developer.");
  }
});

export default router;
