const express = require('express');
const dotenv = require('dotenv');
const dns = require('node:dns');
const todoRoutes = require('./src/routes/todoRoutes');
const mongoose = require('mongoose');

dotenv.config();

const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
  ?.split(',')
  .map(server => server.trim())
  .filter(Boolean);

if (configuredDnsServers?.length) {
  dns.setServers(configuredDnsServers);
}

const app = express();
const PORT = process.env.PORT || 3000;
app.locals.databaseConnected = mongoose.connection.readyState === 1;
const reconnectDelayMs = 15000;

app.use(express.json());

app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} request to ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'CRUD API is running' });
});

app.get('/health', (req, res) => {
  const status = app.locals.databaseConnected ? 200 : 503;
  res.status(status).json({
    status: app.locals.databaseConnected ? 'ok' : 'degraded',
    database: app.locals.databaseConnected ? 'connected' : 'unavailable'
  });
});

app.use('/todos', (req, res, next) => {
  if (!app.locals.databaseConnected) {
    return res.status(503).json({
      status: 'error',
      message: 'MongoDB is unavailable. Check MONGODB_URI and confirm the Atlas cluster is running.'
    });
  }
  return next();
}, todoRoutes);

app.use((err, req, res, next) => {
  console.error('Request failed:', err);
  const status = err.name === 'CastError' ? 404
    : err.name === 'ValidationError' ? 400
      : err.status || 500;
  res.status(status).json({
    status: status < 500 ? 'fail' : 'error',
    message: status >= 500 ? 'Internal server error' : err.message
  });
});

const connectToDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB is unavailable: MONGODB_URI is not set. Add it to your local .env file.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    app.locals.databaseConnected = true;
    console.log('Connected to MongoDB.');
  } catch (error) {
    app.locals.databaseConnected = false;
    console.error(`MongoDB connection failed; retrying in ${reconnectDelayMs / 1000}s:`, error.message);
    setTimeout(connectToDatabase, reconnectDelayMs).unref();
  }
};

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  connectToDatabase();
  return server;
};

mongoose.connection.on('disconnected', () => {
  app.locals.databaseConnected = false;
});

mongoose.connection.on('connected', () => {
  app.locals.databaseConnected = true;
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };