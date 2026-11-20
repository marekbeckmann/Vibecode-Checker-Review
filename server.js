const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { seed } = require('./db/seed');
const cors = require('./middleware/cors');
const { optionalAuth } = require('./middleware/auth');

seed();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors);
app.use(express.static(path.join(__dirname, 'public')));
app.use(optionalAuth);

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

app.use('/', require('./routes/pages'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/account', require('./routes/account'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/datasheets', require('./routes/datasheets'));
app.use('/', require('./routes/tools'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log(`GravelCraft running at http://${HOST}:${PORT}`);
});
