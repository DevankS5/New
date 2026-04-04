import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 8787;
const mongoUri = process.env.MONGODB_URI || "";
const mongoDbName = process.env.MONGODB_DB || undefined;

app.use(express.json({ limit: "1mb" }));

const VALID_COMMUNICATION_TIMES = new Set([
  "",
  "Morning",
  "Afternoon",
  "Evening",
  "Late Night",
]);

const firstScreenSubmissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    whatsAppNumber: {
      type: String,
      required: true,
      trim: true,
    },
    designationInCompany: {
      type: String,
      trim: true,
      default: "",
    },
    comfortableTimeForCommunication: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      default: "apply-now-popup",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "qualifier_first_screen_submissions",
    versionKey: false,
  },
);

const FirstScreenSubmission =
  mongoose.models.FirstScreenSubmission ||
  mongoose.model("FirstScreenSubmission", firstScreenSubmissionSchema);

let connectionPromise;

async function ensureMongoConnection() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    await connectionPromise;
    return;
  }

  connectionPromise = mongoose
    .connect(mongoUri, {
      dbName: mongoDbName,
    })
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  await connectionPromise;
}

function toCleanString(value) {
  return String(value ?? "").trim();
}

app.get("/api/health", async (_req, res) => {
  try {
    await ensureMongoConnection();
    res.status(200).json({ ok: true, mongo: "connected" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post("/api/qualifier/first-screen", async (req, res) => {
  try {
    const payload = {
      fullName: toCleanString(req.body?.fullName),
      emailAddress: toCleanString(req.body?.emailAddress),
      whatsAppNumber: toCleanString(req.body?.whatsAppNumber),
      designationInCompany: toCleanString(req.body?.designationInCompany),
      comfortableTimeForCommunication: toCleanString(
        req.body?.comfortableTimeForCommunication,
      ),
      source: "apply-now-popup",
    };

    if (!payload.fullName || !payload.emailAddress || !payload.whatsAppNumber) {
      return res.status(400).json({
        error: "Full Name, Email Address, and WhatsApp Number are required.",
      });
    }

    if (!VALID_COMMUNICATION_TIMES.has(payload.comfortableTimeForCommunication)) {
      return res.status(400).json({
        error: "Invalid communication time option.",
      });
    }

    await ensureMongoConnection();

    const createdDocument = await FirstScreenSubmission.create(payload);

    return res.status(201).json({
      ok: true,
      id: String(createdDocument._id),
    });
  } catch (error) {
    console.error("Failed to save first-screen qualifier details:", error);
    return res.status(500).json({
      error: "Unable to save details right now. Please try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Qualifier API listening on http://localhost:${port}`);
});
