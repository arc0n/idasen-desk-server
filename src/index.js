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
    res.status(500).send(err);
  });
  res.send(deskList);
});

app.get("/desk/config", async (req, res) => {
  // TODO catch if connected
  if (await deskServer.serverIsRunning()) {
    await getConfig()
      .then(
        (config) => {
          res.send(config);
        },
        (e) => {
          res.status(500).send(`Error occurred when getting config: ${e}`);
        }
      )
      .catch(res.status(500).send(`Error occurred when getting config: ${e}`));
  } else {
    res.send(false);
  }
});

app.post("/desk/connect/:address", async (req, res) => {
  // TODO validate input

  if (!!req.params.address) {
    try {
      console.log(`Attempt to connect to address  ${req.params.address}`);
      await deskServer
        .setDeskAddressInConfig(req.params.address + "")
        .catch((e) => console.log("err1"));
      // await deskHandler.startDeskServer().catch((e) => console.log("err2"));
      res.send(true);
      return;
    } catch (e) {
      res.status(500).send("Error: Connection not possible: ", e);
      return;
    }
  }
  res.status(404).send("please pass a valid physical desk address");
});
app.post("/desk/disconnect", async (req, res) => {
  deskServer.stopDeskConnection().catch((err) => res.send(err));
  res.send(true);
});

app.post("/desk/move/:position", async (req, res) => {
  // TODO validate input
  try {
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
  }
});

app.get("/desk/status", async (req, res) => {
  const status = await deskServer.getStatus();
  res.send(status);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
