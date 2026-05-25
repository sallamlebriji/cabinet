import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.emit("notification", { title: "Connecté", message: "Notifications temps réel activées" });
  });

  httpServer.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
