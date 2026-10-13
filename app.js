const express = require('express');
const dotenv = require('dotenv');
const todoRoutes = require('./src/routes/todoRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());

// ==========================================
// STEP 2: LOGGING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} request to ${req.url}`);
  next(); // Pass control to next middleware
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'CRUD API is running' });
});

// ==========================================
// ROUTES
// ==========================================
app.use('/todos', todoRoutes);

// ==========================================
// STEP 4: CENTRALIZED GLOBAL ERROR HANDLER
// ==========================================
// Placed at the very bottom after all routes
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Caught:", err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});