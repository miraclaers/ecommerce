import { WebSocketServer } from "ws";

const port = Number(process.env.REALTIME_PORT ?? 4001);
const wss = new WebSocketServer({ port });

function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "realtime.connected",
      payload: { message: "Connected to MiniShop realtime gateway." },
      at: new Date().toISOString(),
    })
  );

  socket.on("message", (rawMessage) => {
    try {
      const parsed = JSON.parse(String(rawMessage));
      broadcast(parsed);
    } catch {
      // Ignore malformed messages to keep gateway resilient.
    }
  });
});

console.log(`MiniShop realtime gateway running on ws://localhost:${port}`);
