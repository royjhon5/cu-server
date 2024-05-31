const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').Server(app);

app.get('/', (req, res) => {
  res.write(`<h1>This is my serverless cu-app server running in: ${PORT}</h1>`);
  res.end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('user_profile_picture'))
app.use(cookieParser()); 
app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["https://cu-app-admin.vercel.app", "https://cu-app-giftshop.vercel.app"];
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

require('./routes/routerManager')(app);
http.listen(process.env.PORT || 8000);
