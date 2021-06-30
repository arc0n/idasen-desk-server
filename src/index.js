const express = require("express");
const cors = require("cors");
const { log } = require("./control/utils");
const { InfoworkerService } = require("./control/pcinfos/infoworkerService");

const { DeskService } = require("./control/desk/deskService");
const deskRoutes = require("./routes/desk-routes");
const { DeskWebSocket } = require("./routes/desk-socket");

const app = express();
const port = 3000;

// pc Infos variables



// start websocket for desk
const deskService = new DeskService();
const deskWs = new DeskWebSocket(deskService);

const pcService = new InfoworkerService();

const bodyParser = require("body-parser");
const { connectToDB } = require("./control/dbService");

// start DB
connectToDB();

app.use(bodyParser.json());
// TODO only allow CORS for the own server*
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("*", cors());
/*
var originsWhitelist = [
  "http://localhost:8100", //this is my front-end url for development
  "http://192.168.0.1:3000",
  "http://localhost",
];
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    console.log(isWhitelisted);
    callback(null, isWhitelisted);
  },
  credentials: true,
};*/
app.get("/pcinfos", async (req, res) => {
  await pcService
    .checkConnection()
    .then((r) =>
      r ? pcService.startInfoLoop() : console.log("No Connection.")
    );
  const pcInfos = pcService.pcInfos;

  res.send(pcInfos);
});

app.get("/ping", async (req, res) => {
  log("Received ping");
  res.send(true);
});

app.get("/pcinfos/address", async (req, res) => {
  res.send({
    pcip: "192.168.0.150",
    pcport: 8085
  })
})

app.post("/pcinfos/address", async (req, res) => {
  if(!req.body || Object.keys(req.body).length > 2 ||
      Object.keys(req.body).some(key => !['pcip', 'pcport'].includes(key))) {
    res.status(400).send('invalid body');
  }
  else
  {
    console.log(req.body);
    console.log(req.body.pcip + ":" + req.body.pcport);
    res.send(true);
  }
})

app.use("/desk", deskRoutes(deskService));

app.listen(port, () => {
  console.log(`REST app listening at http://localhost:${port}`);
});
