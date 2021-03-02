const express = require("express");
const app = express();
const bodyParser = require("body-parser");
//const router = require("./routes");
const database = require("./database");
//sslRedirect = require("heroku-ssl-redirect");

// **SSL REDIRECT NOT SUPPORTED ON LOCALHOST**
//app.use(sslRedirect());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});


const port = process.env.PORT || 3001;

database.connect((err) => {
  if (err) console.log(err);
  app.use("/api/v1/", require("./routes")); //ROUTES
  app.listen(port, () => {
    console.log(`Server is up and listening on: ${port}`);
  });

});
