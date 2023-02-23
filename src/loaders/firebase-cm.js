import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyAknfWw5vRgyHpvNNTUEYrSwXn_2IeKAto',
  authDomain: 'apexxia-fac2f.firebaseapp.com',
  projectId: 'apexxia-fac2f',
  storageBucket: 'apexxia-fac2f.appspot.com',
  messagingSenderId: '370754556955',
  appId: '1:370754556955:web:2372eed40c4edd752f94be',
  measurementId: 'G-QLJ1K0SSEH'
}

// Initialize Firebase
export default {
  firebaseConfig,
  initializeApp,
  getMessaging
}
