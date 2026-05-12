import mongoose from "mongoose";
import { config } from "./app.config";
import dns from "dns";

// Helps avoid intermittent DNS/IPv6 resolution issues when connecting to Atlas.
dns.setDefaultResultOrder("ipv4first");

const connectDatabase = async () => {
  try {
    mongoose.connection.on("error", (err) => {
      console.error("Mongo connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongo connection disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("Mongo connection reconnected");
    });

    await mongoose.connect(config.MONGO_URI, {
      // Fail faster on selection issues instead of hanging requests.
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      // Prefer IPv4 for Atlas SRV targets.
      family: 4,
    });
    console.log("Connected to Mongo database");
  } catch (error) {
    console.log("Error connecting to Mongo database");
    process.exit(1);
  }
};

export default connectDatabase;
