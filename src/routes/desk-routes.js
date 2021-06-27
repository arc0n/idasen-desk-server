const express = require("express");
const {getConfig} = require("../control/config");
const router = express.Router();

module.exports = function getRoutes(deskService) {
  router.get("/search", async (req, res) => {
    const deskList = await deskService.scanForDesk().catch((err) => {
      res.status(500).send("A problem occurred while scanning: " + err);
    });
    res.send(deskList);
  });

  router.get("/config", async (req, res) => {
    await getConfig()
      .then(
        (config) => {
          res.send(config);
        },
        (e) => {
          res.status(500).send(`Error occurred when getting config: ${e}`);
        }
      )
      .catch((e) =>
        res.status(500).send(`Error occurred when getting config: ${e}`)
      );
  });

  router.post("/connect/:address", async (req, res) => {
    if (!!req.params.address) {
      console.log(`Attempt to connect to address  ${req.params.address}`);
      await deskService
        .setDeskAddressInConfig(req.params.address + "")
        .catch((e) => res.status(500).send("Error while setting config: " + e));
      await deskService
        .createDeskBridge()
        .then((desk) => res.send(desk))
        .catch((e) => res.status(500).send("Error while connecting: " + e));
    }
  });
  router.post("/disconnect", async (req, res) => {
    deskService.stopDeskConnection().catch((err) => {
      // nothing
    });
    res.send(true);
  });

  router.post("/move/:position", async (req, res) => {
    const position = req.params.position;
    if(position < 7 || position > 60) {
      res.status(400).send("Invalid position")
      return;
    }

    await deskService
      .moveTo(position)
      .then((hasMoved) => res.send(hasMoved))
      .catch((e) => res.status(500).send("Error while setting config: " + e));
  });

  router.get("/status", async (req, res) => {
    const status = await deskService.getStatus();
    res.send(status);
  });
  return router;
};
