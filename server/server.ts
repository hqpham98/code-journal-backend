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
      throw new ClientError(400, '"gradeId" must be a positive integer');
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

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);

    if (!Number.isInteger(entryId) || entryId <= 0 || Number.isNaN(entryId)) {
      throw new ClientError(400, '"gradeId" must be a positive integer');
    }
    const { title, notes, photoUrl } = req.body;

    const sql = `
      UPDATE "entries"
      SET "title" = $1,
          "notes" = $2,
          "photoUrl" = $3
    WHERE "entryId" = $4
    RETURNING *
    `;

    const params = [title, notes, photoUrl, entryId];
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    // error handling

    const entryId = Number(req.params.entryId);
    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new ClientError(400, '"entryId" must be a positive integer');
    }

    const sql = `
      delete from "entries"
        where "entryId" = $1
        returning *;
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
