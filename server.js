import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import sendEmailRouter from "./routes/send-email.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Routes
app.use("/api", sendEmailRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));