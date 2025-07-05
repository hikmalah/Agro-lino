const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const axios = require("axios");
const fs = require("fs");
const { tiktokDl } = require("./lib/tiktok");

async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const sender = m.key.remoteJid;
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

    if (text.startsWith("/tiktok ")) {
      const url = text.split(" ")[1];
      const result = await tiktokDl(url);
      if (!result) return sock.sendMessage(sender, { text: "❌ Gagal mengambil video." });

      sock.sendMessage(sender, { video: { url: result.nowm }, caption: "✅ Berhasil diunduh!" });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      connectBot();
    }
  });
}

connectBot();
