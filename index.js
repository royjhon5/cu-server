
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8000
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('user_profile_picture'))
app.use(cookieParser()); 
app.use(cors({
  origin: (origin, callback) => {
      const allowedOrigins = ["https://cu-app-admin.vercel.app", "https://cu-app-peach.vercel.app"];
      if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
}));

app.get('/', (req, res) => {
  res.write(`<h1>Socket IO Start on Port : ${PORT}</h1>`);
  res.end();
});

require('./routes/routerManager')(app);
app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT} `)
})
module.exports = app