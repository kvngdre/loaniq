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

const options = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
};

export default options;
