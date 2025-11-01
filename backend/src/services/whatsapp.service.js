import cron from "node-cron";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal"; // ✅ NEW

import { Schedule } from "../models/schedule.model.js";

let sock;
const jobs = {};
let isConnected = false;

export const whatsappSetup = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth");

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Scan this QR code in WhatsApp:");
      qrcode.generate(qr, { small: true }); // ✅ prints scannable QR in terminal
    }

    if (connection === "connecting") {
      console.log("[whatsapp] connecting...");
    } else if (connection === "open") {
      if (!isConnected) {
        console.log("[whatsapp] ready ✅");
        loadAllSchedules();
        isConnected = true;
      }
    } else if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;

      console.log(`[whatsapp] disconnected (${reason})`);
      if (shouldReconnect) {
        console.log("[whatsapp] attempting reconnect in 5s...");
        setTimeout(() => whatsappSetup(), 5000);
      } else {
        console.log("[whatsapp] Logged out — delete baileys_auth and rescan QR.");
      }
    }
  });

  return sock;
};

/* ---------------- SCHEDULE LOGIC ---------------- */
export const loadAllSchedules = async () => {
  try {
    const schedules = await Schedule.find({ active: true });
    schedules.forEach(scheduleMessage);
    console.log(`[whatsapp] Loaded ${schedules.length} active schedules`);
  } catch (err) {
    console.error("[whatsapp] Failed to load schedules:", err.message);
  }
};

const scheduleMessage = (doc) => {
  const id = String(doc._id);
  if (jobs[id]) jobs[id].stop();

  const job = cron.schedule(doc.cronTime, async () => {
    try {
      const jid = `${doc.phone}@s.whatsapp.net`;
      await sock.sendMessage(jid, { text: doc.message });
      console.log(`[whatsapp] Sent to ${doc.phone}`);

      const updated = await Schedule.findById(doc._id);
      if (!updated) return;

      updated.remainingRuns--;
      if (updated.remainingRuns <= 0) updated.active = false;
      await updated.save();

      if (!updated.active) {
        jobs[id].stop();
        delete jobs[id];
      }
    } catch (err) {
      console.error("[whatsapp] Send failed:", err.message);
    }
  });

  jobs[id] = job;
  console.log(`[whatsapp] Scheduled job for ${id} cron: ${doc.cronTime}`);
};

export const cancelScheduleById = async (id) => {
  if (jobs[id]) {
    jobs[id].stop();
    delete jobs[id];
    console.log(`[whatsapp] Cancelled job ${id}`);
  }
};

export default {
  whatsappSetup,
  scheduleMessage,
  loadAllSchedules,
  cancelScheduleById,
};
