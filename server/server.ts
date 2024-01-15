/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { nextTick } from 'process';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());

app.get('/api/entries/', async (req, res) => {
  try {
    const sql = `
    SELECT * from "entries"`;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
  }
});

app.get('/api/entries/:entryId', async (req, res) => {
  try {
    const sql = `
    SELECT * from "entries"
    WHERE "entryId" = $1
    `;
    const params = [req.params.entryId];
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

app.post('/api/entries/', async (req, res, next) => {
  try {
    if (
      !(
        Object.keys(req.body).length === 3 &&
        'title' in req.body &&
        'notes' in req.body &&
        'photoUrl' in req.body
      )
    ) {
      throw Error('Error 400, Bad Request');
    }
    const sql = `
    INSERT INTO "entries" ("title", "notes", "photoUrl")
    VALUES ($1, $2, $3)
    RETURNING *
    `;

    const { title, notes, photoUrl } = req.body;
    const params = [title, notes, photoUrl];
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
