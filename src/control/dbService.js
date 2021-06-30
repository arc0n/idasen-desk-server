//Import the mongoose module
const mongoose = require("mongoose");

//Set up default mongoose connection
const mongoDB = "mongodb://localhost:27017/deskDB";

//Define a schema
const Schema = mongoose.Schema;

const DeskSchema = new Schema({
  socketPath: String,
  standThreshold: Number,
  sittingBreakTime: Number,
  deskAddress: String,
  deskMaxPosition: Number,
  connectTimeout: Number,
  position1: Number,
  position2: Number,
  position3: Number,
});
const DeskModel = mongoose.model("desk", DeskSchema);

let db = null;

module.exports.connectToDB = () => {
  if (!db) {
    mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
    //Bind connection to error event (to get notification of connection errors)
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    db.on("connected", () => {
      console.log("connected to mongodb");
    });
  }
};

function handleError(err) {
  console.log("ERROR while saving to DB", err);
  return null;
}

module.exports.getConfigFromDb = async () => {
  return new Promise((res, rej) => {
    DeskModel.find({}, (err, docs) => {
      if (!docs) {
        res({});
        return;
      }

      res(docs[0]);
    });
  });
};

function getConfigCopy(deskConfig) {
  return {
    socketPath: deskConfig.socketPath,
    standThreshold: deskConfig.standThreshold,
    sittingBreakTime: deskConfig.sittingBreakTime,
    deskAddress: deskConfig.deskAddress,
    deskMaxPosition: deskConfig.deskMaxPosition,
    connectTimeout: deskConfig.connectTimeout,
    position1: deskConfig.position1,
    position2: deskConfig.position2,
    position3: deskConfig.position3,
  };
}

module.exports.writeToDb = async (deskConfig) => {
  return new Promise((res, rej) => {
    const existing = DeskModel.findOneAndUpdate(
      {},
      getConfigCopy(deskConfig),
      (err, result) => {
        res();
        if (err) {
          handleError(err);
        }
        console.log("result", result);
        if (result == null) {
          new DeskModel(getConfigCopy(deskConfig)).save(function (err) {
            if (err) return handleError(err);
          });
        }
      }
    );
  });
};
