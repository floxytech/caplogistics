// index.js - CAPERONE simple backend
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve('./data');
const CONTACT_FILE = path.join(DATA_DIR, 'contacts.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests, slow down.' },
});
app.use('/api/', apiLimiter);

// Serve static frontend (place your index.html and assets inside ./public)
app.use(express.static(path.join(process.cwd(), 'public')));

// Helpers
const saveContact = async (entry) => {
  let arr = [];
  try {
    if (fs.existsSync(CONTACT_FILE)) arr = JSON.parse(fs.readFileSync(CONTACT_FILE));
  } catch (e) { /* ignore and overwrite */ }
  arr.push({ ...entry, receivedAt: new Date().toISOString() });
  fs.writeFileSync(CONTACT_FILE, JSON.stringify(arr, null, 2));
};

// SMTP transporter (optional)
const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
};

// Routes

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Contact endpoint: saves contact and optionally emails admin
app.post(
  '/api/contact',
  [
    body('name').isLength({ min: 1 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('message').isLength({ min: 5 }).trim().escape(),
    body('company').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, message, company } = req.body;
    const entry = { name, email, company: company || '', message };

    try {
      await saveContact(entry);

      const transporter = getTransporter();
      if (transporter) {
        const adminTo = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        const mailOptions = {
          from: process.env.SMTP_FROM || `"Caperone Contact" <${process.env.SMTP_USER}>`,
          to: adminTo,
          subject: `New contact from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\n\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Company:</strong> ${company || '-'}</p><p>${message}</p>`,
        };
        await transporter.sendMail(mailOptions).catch((err) => {
          console.error('SMTP send error:', err?.message || err);
        });
      }

      return res.json({ ok: true, message: 'Contact received. Thank you.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Quote calculator
app.post(
  '/api/quote',
  [
    body('origin').isLength({ min: 1 }).trim().escape(),
    body('destination').isLength({ min: 1 }).trim().escape(),
    body('weight').isFloat({ gt: 0 }),
    body('mode').isIn(['sea', 'air']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { weight, mode } = req.body;
    const w = Number(weight);
    const base = mode === 'air' ? 1.8 : 0.5;
    const estimate = Math.max(50, Math.round(base * w * 10));

    return res.json({ ok: true, estimate: Number(estimate), currency: 'KSH', mode });
  }
);

// Fallback to serve index (for SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'public', 'caperone.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  return res.status(404).send('Not found');
});

// Start
app.listen(PORT, () => {
  console.log(`Caperone backend listening on http://localhost:${PORT}`);
});
