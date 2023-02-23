import allowedOrigins from './allowedOrigins'

const options = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  }
}

export default options
