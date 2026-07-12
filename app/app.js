const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Configure View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware
app.use(session({
  secret: 'soportefisi_secret_key_2026_super_secure',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set local variables for templates (user session)
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Import Routes
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const equiposRouter = require('./routes/equipos');
const componentesRouter = require('./routes/componentes');
const softwareRouter = require('./routes/software');
const incidenciasRouter = require('./routes/incidencias');
const solicitudesRouter = require('./routes/solicitudes');
const adminRouter = require('./routes/admin');

// Mount Routes
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/equipos', equiposRouter);
app.use('/componentes', componentesRouter);
app.use('/software', softwareRouter);
app.use('/incidencias', incidenciasRouter);
app.use('/solicitudes', solicitudesRouter);
app.use('/admin', adminRouter);

// Root Redirect
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).render('error', { 
    message: 'La página que busca no existe o ha sido movida.',
    user: req.session.user || null
  });
});

// Server Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Soporte FISI corriendo en http://localhost:${PORT}`);
});
