import allowedOrigins from './allowedOrigins.js';

export default {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['POST', 'PATCH', 'PUT', 'DELETE'],
};
