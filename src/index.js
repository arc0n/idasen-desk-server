const express = require("express");
/*
const { sleep } = require("./control/utils");
*/
const { DeskHandler } = require("./control/deskHandler");

const app = express();
const port = 3000;
const deskHandler = new DeskHandler();

app.get("/search", async (req, res) => {
  const deskList = await deskHandler.scanForDesk().catch((err) => {
    res.send(err);
  });
  res.send(deskList);
});

app.post("/connect/:address", async (req, res) => {
  // TODO validate input

  if (!!req.params.address) {
    try {
      console.log(`Attempt to connect to address  ${req.params.address}`);
      await deskHandler.connectToDesk(req.params.address + "");
      await deskHandler.startDeskServer();
      res.send(true);
    } catch (e) {
      res.send("Error: Connection not possible: ", e);
    }
  }
});
app.post("/disconnect", async (req, res) => {
  deskHandler.stopDeskServer().catch((err) => res.send(err));
  res.send(true);
});

app.post("/move/:position", async (req, res) => {
  // TODO validate input
  const hasMoved = await deskHandler.sendCommand(
    { op: "moveTo", pos: req.params.position },
    true
  ); // wait is a bool, must be set to true in this api
  // TODO try if wait false works
  res.send(hasMoved);
});

app.get("/status", async (req, res) => {
  // TODO validate input
  const status = await deskHandler.getStatus();
  res.send(status);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
