const express = require("express");
const { getConfig } = require("./control/config");
const cors = require("cors");

const { DeskService } = require("./control/desk/deskService");

const app = express();
const port = 3000;
const deskService = new DeskService();

// TODO only allow CORS for the own server
/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/

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
};

app.options("*", cors(corsOptions));

app.get("/desk/search", async (req, res) => {
  const deskList = await deskService.scanForDesk().catch((err) => {
    res.status(500).send("A problem occurred while scanning: " + err);
  });
  res.send(deskList);
});

app.get("/desk/config", async (req, res) => {
  // TODO catch if connected
  await getConfig()
    .then(
      (config) => {
        res.send(config);
      },
      (e) => {
        res.status(500).send(`Error occurred when getting config: ${e}`);
      }
    )
    .catch(() =>
      res.status(500).send(`Error occurred when getting config: ${e}`)
    );
});

app.post("/desk/connect/:address", async (req, res) => {
  // TODO validate input

  if (!!req.params.address) {
    console.log(`Attempt to connect to address  ${req.params.address}`);
    await deskService
      .setDeskAddressInConfig(req.params.address + "")
      .catch((e) => res.status(500).send("Error while setting config: " + e));
    await deskService
      .createDeskBridge()
      .then((desk) => res.send(JSON.safeStringify(desk)))
      .catch((e) => res.status(500).send("Error while connecting: " + e));
  }
});
app.post("/desk/disconnect", async (req, res) => {
  deskService.stopDeskConnection().catch((err) => {
    // nothing
  });
  res.send(true);
});

app.post("/desk/move/:position", async (req, res) => {
  // TODO validate input

  await deskService
    .moveTo(req.params.position)
    .then((hasMoved) => res.send(hasMoved))
    .catch((e) => res.status(500).send("Error while setting config: " + e));
});

app.get("/desk/status", async (req, res) => {
  const status = await deskService.getStatus();
  res.send(JSON.safeStringify(status));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// safely handles circular references
JSON.safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};
