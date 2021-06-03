const express = require("express");
const { getConfig } = require("./control/config");
/*
const { sleep } = require("./control/utils");
*/
const { DeskServer } = require("./control/deskServer");

const app = express();
const port = 3000;
const deskServer = new DeskServer();
app.get("/desk/search", async (req, res) => {
  const deskList = await deskServer.scanForDesk().catch((err) => {
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
    await deskServer
      .setDeskAddressInConfig(req.params.address + "")
      .catch((e) => res.status(500).send("Error while setting config: " + e));
    await deskServer
      .startDeskServer()
      .then(() => res.send(true))
      .catch((e) => res.status(500).send("Error while connecting: " + e));
  }
});
app.post("/desk/disconnect", async (req, res) => {
  deskServer.stopDeskConnection().catch((err) => res.status(500).send(err));
  res.send(true);
});

app.post("/desk/move/:position", async (req, res) => {
  // TODO validate input

  await deskServer
    .moveTo(req.params.position)
    .then(() => res.send(true))
    .catch((e) => res.status(500).send("Error while setting config: " + e));

  /*try {
    if (await deskServer.serverIsRunning()) {
      const hasMoved = await deskServer.sendCommand(
        { op: "moveTo", pos: req.params.position },
        true
      );
      // wait is a bool, must be set to true in this api
      res.send(hasMoved);
      // TODO try if wait false works
    } else {
      res.send(false);
    }
  } catch (e) {
    res.status(500).send("Error: Connection not possible: ", e);
  }*/
});

app.get("/desk/status", async (req, res) => {
  const status = await deskServer.getStatus();
  res.send(status);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
