import express from 'express';
const router = express.Router();
import {v4 as uuidv4} from 'uuid';

import Quote from '../../models/Quotes';
/**
 * @swagger
 * /admin/quotes/{id}:
 *    get:
 *      tags:
 *        - /admin
 *      summary: Fetch a quote by id
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Numeric ID of the quote to fetch
 *          schema:
 *            type: integer
 *            required: true
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *          schema:
 *            $ref: '#/definitions/Joke'
 *        401:
 *          description: Unauthorized (No token provided)
 *        500:
 *          description: Internal Server Error
 */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  Quote.findById(id, (err, quote) => {
    if (err) {
      res.status(500).send("An error has occured. Please contact a developer.");
    } else {
      res.json(quote);
    }
  });
});

/**
 * @swagger
 * /admin/quotes/{id}:
 *    put:
 *      tags:
 *        - /admin
 *      summary: Find a quote by id and update it
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Numeric ID of the quote to find and update
 *          schema:
 *            type: integer
 *            required: true
 *        - in: header
 *          name: quote
 *          schema:
 *            type: string
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *          schema:
 *            $ref: "#/definitions/Quote"
 *        401:
 *          description: Unauthorized (No token provided)
 *        500:
 *          description: Internal Server Error
 */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body;
  Quote.findByIdAndUpdate(id, body, (err, quote) => {
    if (err) {
      res.status(500).send("An error has occured. Please contact a developer.");
    } else {
      res.json(quote);
    }
  });
});

/**
 * @swagger
 * /admin/quotes/{id}:
 *    delete:
 *      tags:
 *        - /admin
 *      summary: Find a quote by id and delete it
 *      parameters:
 *        - in: path
 *          name: id
 *          description: Numeric ID of the quote to find and delete
 *          schema:
 *            type: integer
 *            required: true
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *          schema:
 *            $ref: '#/definitions/Quote'
 *        401:
 *          description: Unauthorized (No token provided)
 *        500:
 *          description: Internal Server Error
 */
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  Quote.findByIdAndDelete(id, (err, quote) => {
    if (err) {
      res.status(500).send("An error has occured. Please contact a developer.");
    } else {
      res.json(quote);
    }
  });
});

/**
 * @swagger
 * /admin/quotes/add:
 *    post:
 *      tags:
 *        - /admin
 *      summary: Add a quote
 *      parameters:
 *        - in: header
 *          name: quote
 *          description: Quote to add
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Quote'
 *      produces: application/json
 *      responses:
 *        200:
 *          description: Successful Response
 *          schema:
 *            type: "object"
 *            properties:
 *              _id:
 *                type: string
 *              quote:
 *                type: string
 *              dateUploaded:
 *                type: string
 *                format: date
 *        400:
 *          description: Bad Request
 *          schema:
 *            type: string
 *            example: "Quote already exists in system!"
 *        401:
 *          description: Unauthorized (No token provided)
 *        500:
 *          description: Internal Server Error
 */
router.post('/add', async (req, res) => {
const rawQuote = req.body.quote;

  const quoteExists = await Quote.findOne({quote: rawQuote});
  if (quoteExists)
    return res.status(400).send('Quote already exists in system!');

  const quote = new Quote({
    _id: uuidv4(),
    quote: rawQuote,
  });

  try {
    const newQuote = await quote.save();
    res.send({
      quote: newQuote.quote,
      _id: newQuote._id,
      dateUploaded: newQuote.dateUploaded,
    });
  } catch (err) {
    res.status(500).send("An error has occured. Please contact a developer.");
  }
});

export default router;
