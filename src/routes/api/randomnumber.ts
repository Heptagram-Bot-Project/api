import express from "express";

const router = express.Router();

/**
 * @openapi
 * /randomnumber:
 *    get:
 *      tags:
 *        - /
 *      summary: Generate a random number
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *        401:
 *          description: Unsuccessful response
 */

router.get("/", (req, res) => {
  const randomNumber = Math.floor(Math.random() * 10000);

  res.send({ "Random Number": randomNumber });
});

export default router;
