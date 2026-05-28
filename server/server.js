import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT || 5001);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`GramBazaar server listening on http://localhost:${PORT}`);
  });
});
