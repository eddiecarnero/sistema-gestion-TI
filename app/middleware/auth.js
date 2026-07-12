function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user; // Expose user to EJS templates
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
}

function isRole(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }
    const userRole = req.session.user.rol;
    if (roles.includes(userRole)) {
      return next();
    }
    res.status(403).render('error', { 
      message: 'No tienes permisos para acceder a esta sección.',
      layout: 'layouts/main',
      user: req.session.user
    });
  };
}

module.exports = {
  isAuthenticated,
  isRole
};
