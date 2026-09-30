import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { assertSeedAllowed, seedDemoData } from "./seedDemo.js";

assertSeedAllowed();

connectDatabase()
  .then(seedDemoData)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
