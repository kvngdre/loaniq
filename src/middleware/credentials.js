import allowedOrigins from '../config/allowedOrigins.js';

function credentials(req, res, next) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Credentials', true);
  }

  next();
}

export default credentials;
