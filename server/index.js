const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@class123.local';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4002';

// Configure nodemailer (for demo: ethereal)
let transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER || 'sad6bfux6h36euoc@ethereal.email',
    pass: process.env.ETHEREAL_PASS || 'pcAjHfxdxS1ysnQ5T6'
  }
});

console.log('[EMAIL] Transporter config:', {
  host: transporter.options.host,
  port: transporter.options.port,
  user: transporter.options.auth.user
});

async function sendMail(to, subject, html) {
  console.log('[EMAIL] sendMail called for:', to);
  if (!transporter.options.auth.user) {
    console.log('[EMAIL] sendMail skipped: transporter not configured');
    return;
  }
  try {
    let info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
    console.log('[EMAIL] sendMail result:', {
      messageId: info.messageId,
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    if (nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('[EMAIL] Ethereal preview URL:', previewUrl);
    }
  } catch (err) {
    console.error('[EMAIL] sendMail error:', err);
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const file = path.join(__dirname, 'db.json');
console.log('[DB] Using db.json at:', file);

const db = {
  data: null,
  async read() {
    try {
      const txt = await fs.readFile(file, 'utf8');
      this.data = txt ? JSON.parse(txt) : { users: [], behaviors: [], classesByUser: {} };
      console.log('[DB] Read db.json:', JSON.stringify(this.data.users));
    } catch (e) {
      // file missing or corrupt -> create fresh structure
      this.data = { users: [], behaviors: [], classesByUser: {} };
      await this.write();
      console.log('[DB] db.json missing/corrupt, created new at:', file);
    }
  },
  async write() {
    await fs.writeFile(file, JSON.stringify(this.data || { users: [], behaviors: [], classesByUser: {} }, null, 2), 'utf8');
    console.log('[DB] Wrote db.json:', JSON.stringify((this.data && this.data.users) || []));
  }
};

async function initDB() {
  await db.read();
}

initDB();

app.get('/ping', (req, res) => res.json({ ok: true }));

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no_token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'bad_auth' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// Auth: register/login
app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
  await db.read();
  db.data.users = db.data.users || [];
  const exists = db.data.users.find(u => u.email === email);
  if (exists) {
    console.log('[REGISTER] User already exists:', email);
    return res.status(400).json({ error: 'user_exists' });
  }
  const hash = await bcrypt.hash(password, 8);
  const confirmToken = crypto.randomBytes(24).toString('hex');
  const user = { email, name: name || email, passwordHash: hash, active: true, confirmToken };
  db.data.users.push(user);
  console.log('[REGISTER] Users array after push:', JSON.stringify(db.data.users));
  await db.write();
  console.log('[REGISTER] User created:', user);
  // Send confirmation email
  const confirmUrl = `${BASE_URL}/auth/confirm?token=${confirmToken}`;
  console.log('[EMAIL] About to call sendMail for:', email);
  try {
    await sendMail(email, 'Confirm your Class123 account', `<p>Click to confirm: <a href="${confirmUrl}">${confirmUrl}</a></p>`);
    console.log('[EMAIL] Confirmation email sendMail finished.');
  } catch (err) {
    console.error('[EMAIL] Error sending confirmation email:', err);
  }
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ ok: true, user: { email: user.email, name: user.name }, token });
});

app.get('/auth/confirm', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'missing_token' });
  await db.read();
  const user = db.data.users.find(u => u.confirmToken === token);
  if (!user) {
    console.log('[CONFIRM] No user found for token:', token);
    return res.status(400).json({ error: 'invalid_token' });
  }
  user.active = true;
  user.confirmToken = undefined;
  console.log('[CONFIRM] Users array before write:', JSON.stringify(db.data.users));
  await db.write();
  console.log('[CONFIRM] User activated:', user.email);
  res.json({ ok: true, message: 'Account confirmed. You may now log in.' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
  await db.read();
  const user = (db.data.users || []).find(u => u.email === email);
  if (!user) {
    console.log('[LOGIN] No user found for email:', email);
    return res.status(400).json({ error: 'no_user' });
  }
  if (!user.active) {
    console.log('[LOGIN] User not active:', email);
    return res.status(400).json({ error: 'not_confirmed' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) {
    console.log('[LOGIN] Bad credentials for:', email);
    return res.status(400).json({ error: 'bad_credentials' });
  }
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
  console.log('[LOGIN] Success for:', email);
  res.json({ user: { email: user.email, name: user.name }, token });
});

// Password reset request
app.post('/auth/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email_required' });
  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(200).json({ ok: true }); // don't reveal
  const resetToken = crypto.randomBytes(24).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExp = Date.now() + 1000 * 60 * 30; // 30 min
  await db.write();
  const resetUrl = `${BASE_URL}/auth/reset?token=${resetToken}`;
  sendMail(email, 'Reset your Class123 password', `<p>Reset link: <a href="${resetUrl}">${resetUrl}</a></p>`).catch(()=>{});
  res.json({ ok: true });
});

// Password reset
app.post('/auth/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'missing_token_or_password' });
  await db.read();
  const user = db.data.users.find(u => u.resetToken === token && u.resetTokenExp > Date.now());
  if (!user) return res.status(400).json({ error: 'invalid_or_expired_token' });
  user.passwordHash = await bcrypt.hash(password, 8);
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await db.write();
  res.json({ ok: true, message: 'Password updated.' });
});

// Profile update (avatar, name, password)
app.put('/auth/profile', authenticateToken, async (req, res) => {
  const { name, avatar, password, oldPassword } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.email === req.user.email);
  if (!user) return res.status(404).json({ error: 'not_found' });
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (password) {
    if (!oldPassword) return res.status(400).json({ error: 'old_password_required' });
    const ok = await bcrypt.compare(oldPassword, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'bad_old_password' });
    user.passwordHash = await bcrypt.hash(password, 8);
  }
  await db.write();
  res.json({ ok: true, user: { email: user.email, name: user.name, avatar: user.avatar } });
});

// Behaviors
app.get('/behaviors', authenticateToken, async (req, res) => {
  await db.read();
  res.json(db.data.behaviors || []);
});

app.put('/behaviors', authenticateToken, async (req, res) => {
  const next = req.body;
  if (!Array.isArray(next)) return res.status(400).json({ error: 'expected array' });
  db.data.behaviors = next;
  console.log('[BEHAVIORS] About to write db.json:', JSON.stringify(db.data));
  await db.write();
  res.json(db.data.behaviors);
});

// Classes per user
app.get('/classes/:email', authenticateToken, async (req, res) => {
  const email = req.params.email;
  if (req.user.email !== email) return res.status(403).json({ error: 'forbidden' });
  await db.read();
  const classes = db.data.classesByUser?.[email] || [];
  res.json(classes);
});

app.put('/classes/:email', authenticateToken, async (req, res) => {
  const email = req.params.email;
  if (req.user.email !== email) return res.status(403).json({ error: 'forbidden' });
  const next = req.body;
  if (!Array.isArray(next)) return res.status(400).json({ error: 'expected array' });
  db.data.classesByUser = db.data.classesByUser || {};
  db.data.classesByUser[email] = next;
  console.log('[CLASSES] About to write db.json:', JSON.stringify(db.data));
  await db.write();
  res.json(db.data.classesByUser[email]);
});

// Simple users endpoint (no auth) to register a user
app.post('/users', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  await db.read();
  const exists = db.data.users.find(u => u.email === email);
  if (exists) return res.status(200).json(exists);
  const user = { email, name: name || email };
  db.data.users.push(user);
  await db.write();
  res.json(user);
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
