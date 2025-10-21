// index.js – Vercel compatible Express server
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple contact & quote endpoints
app.post('/api/contact', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('message').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, message } = req.body;
  const filePath = path.join(__dirname, 'contacts.json');
  const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
  existing.push({ name, email, message, at: new Date().toISOString() });
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  return res.json({ ok: true, msg: 'Message received' });
});

app.post('/api/quote', [
  body('origin').notEmpty(),
  body('destination').notEmpty(),
  body('weight').isFloat({ gt: 0 }),
  body('mode').isIn(['sea', 'air'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { weight, mode } = req.body;
  const base = mode === 'air' ? 1.8 : 0.5;
  const estimate = Math.max(50, Math.round(base * weight * 10));
  return res.json({ ok: true, estimate, currency: 'KSH' });
});

// Default route for root
app.get('/', (req, res) => {
  res.send('Caperone API online ✅');
});

// ✅ Export handler for Vercel (no app.listen)
export default app;
