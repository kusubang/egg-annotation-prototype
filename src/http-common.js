import axios from 'axios'
export default axios.create({
  // baseURL: 'http://localhost/api',
  // baseURL: '/api',
  headers: {
    'Content-type': 'application/json'
  }
})
