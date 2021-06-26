const express = require('express');
const router = express.Router();

module.exports = function getRoutes(deskService) {
        router.get("/desk/search", async (req, res) => {
            const deskList = await deskService.scanForDesk().catch((err) => {
                res.status(500).send("A problem occurred while scanning: " + err);
            });
            res.send(deskList);
        });

        router.get("/desk/config", async (req, res) => {
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

        router.post("/desk/connect/:address", async (req, res) => {
            // TODO validate input

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
        router.post("/desk/disconnect", async (req, res) => {
            deskService.stopDeskConnection().catch((err) => {
                // nothing
            });
            res.send(true);
        });

        router.post("/desk/move/:position", async (req, res) => {
            // TODO validate input

            await deskService
                .moveTo(req.params.position)
                .then((hasMoved) => res.send(hasMoved))
                .catch((e) => res.status(500).send("Error while setting config: " + e));
        });

        router.get("/desk/status", async (req, res) => {
            const status = await deskService.getStatus();
            res.send(status);
        });
        return router;
    }



