import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { UPLOAD_ROOT } from "./lib/uploads.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { aiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { channelRouter } from "./routes/channel.js";
import { healthRouter } from "./routes/health.js";
import { jobsRouter } from "./routes/jobs.js";
import { logsRouter } from "./routes/logs.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";
import { shopOrdersRouter } from "./routes/shopOrders.js";
import { shopProductsRouter } from "./routes/shopProducts.js";
import { shopsRouter } from "./routes/shops.js";
import { userDataRouter } from "./routes/userData.js";

function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) {
  if (!origin) {
    callback(null, true);
    return;
  }
  if (config.corsOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  const localDevOrigin =
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
  const vercelOrigin = /^https:\/\/[\w-]+\.vercel\.app$/;
  if ((config.corsAllowLocalhost || config.corsAllowLan) && localDevOrigin.test(origin)) {
    callback(null, true);
    return;
  }
  if (vercelOrigin.test(origin)) {
    callback(null, true);
    return;
  }
  callback(null, false);
}

export function createApp() {
  const app = express();
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(
    "/uploads",
    express.static(UPLOAD_ROOT, {
      setHeaders(res, filePath) {
        if (/\.(mov|mp4|webm|m4v)$/i.test(filePath)) {
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "no-transform");
          if (/\.mov$/i.test(filePath)) {
            res.setHeader("Content-Type", "video/quicktime");
          } else if (/\.mp4$/i.test(filePath) || /\.m4v$/i.test(filePath)) {
            res.setHeader("Content-Type", "video/mp4");
          } else if (/\.webm$/i.test(filePath)) {
            res.setHeader("Content-Type", "video/webm");
          }
        }
      },
    }),
  );

  const v1 = express.Router();
  v1.use("/health", healthRouter);
  v1.use("/auth", authRouter);
  v1.use("/user-data", userDataRouter);
  v1.use("/channel", channelRouter);
  v1.use("/ai", aiRouter);
  v1.use("/logs", logsRouter);
  v1.use("/jobs", jobsRouter);
  v1.use("/products", productsRouter);
  v1.use("/orders", ordersRouter);

  shopsRouter.use("/:shopId/products", shopProductsRouter);
  shopsRouter.use("/:shopId/orders", shopOrdersRouter);
  v1.use("/shops", shopsRouter);

  app.use("/api/v1", v1);

  app.use(errorHandler);
  return app;
}
