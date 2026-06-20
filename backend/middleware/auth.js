// backend/middleware/auth.js
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.authenticated === true) {
    return next();
  }
  res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'Please login first' 
  });
};

export { isAuthenticated };