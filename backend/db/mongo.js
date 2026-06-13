const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);

let mongoAvailable = false;

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });

    mongoAvailable = true;
    console.log("MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      mongoAvailable = false;
      console.warn("MongoDB disconnected. SQLite fallback active.");
    });

    mongoose.connection.on("reconnected", () => {
      mongoAvailable = true;
      console.log("MongoDB reconnected");
    });

    mongoose.connection.on("error", (error) => {
      mongoAvailable = false;
      console.error("MongoDB runtime error:", error.message);
    });
  } catch (error) {
    mongoAvailable = false;
    console.error("MongoDB connection failed. SQLite fallback active.");
    console.error(error.message);
  }
}

function isMongoAvailable() {
  return mongoAvailable && mongoose.connection.readyState === 1;
}

module.exports = {
  connectMongo,
  isMongoAvailable
};
