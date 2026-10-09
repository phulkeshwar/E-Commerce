import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedCategories } from "./seeds/categories.seed.js";
import { importProducts } from "./scripts/importAffiliateProducts.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = Number(process.env.PORT || 5001);

let server;
connectDB().then(async () => {
  await seedCategories();
  server = app.listen(PORT, () => {
    console.log(`GaramBazaar server listening on http://localhost:${PORT}`);
  });
  if (process.env.AUTO_IMPORT_CSV === "true") {
    importProducts(false).catch((err) => {
      console.error("Failed to import affiliate products in background:", err);
    });
  }
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message, err.stack);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
