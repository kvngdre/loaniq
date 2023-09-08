export function credentials(req, res, next) {
  const allowedOrigins = [
    "http://localhost:8480",
    "http://127.0.0.1:8480",
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5000",
    "http://127.0.0.1:5500",
  ];

  const { origin } = req.headers;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }

  next();
}
