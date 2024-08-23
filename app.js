import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  const app = Fastify();
  app.register(fastifySocketIO, {
    cors: {
      origin: "*",
    },
    pingInterval: 10000,
    pingTimeout: 50000,
    transports: ["websocket"],
  });
  await registerRoutes(app);
  await buildAdminRouter(app);
  app.listen({ port: PORT, host: "0.0.0.0" }, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log(
        `Blinkit Started on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}👍`);
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`🔴User joined room: ${orderId}��`);
      });

      socket.io.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}☠️`);
        socket.leaveAll();
      });
    });
  });
};
start();
