import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Render (and most PaaS) runs behind a proxy/load balancer.
// This is required for secure cookies to work correctly.
if (config.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // MemoryStore is not suitable for production.
    // MongoStore keeps sessions across restarts.
    store:
      config.NODE_ENV === "production"
        ? MongoStore.create({
            mongoUrl: config.MONGO_URI,
            ttl: 24 * 60 * 60,
          })
        : undefined,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      // Cross-domain cookie (Vercel -> Render) requires SameSite=None + Secure.
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const parseUrlSafe = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const isOriginAllowed = (requestOrigin: string, allowListCsv: string): boolean => {
  const originUrl = parseUrlSafe(requestOrigin);
  if (!originUrl) return false;

  const originHost = originUrl.host; // hostname[:port]
  const originHostname = originUrl.hostname;
  const originNormalized = originUrl.origin;

  const allowed = allowListCsv
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  for (const entry of allowed) {
    if (entry === "*") return true;

    // Full origin (with scheme)
    if (/^https?:\/\//i.test(entry)) {
      const url = parseUrlSafe(entry);
      if (url && url.origin === originNormalized) return true;
      continue;
    }

    // Wildcard subdomain pattern (e.g. *.vercel.app)
    if (entry.startsWith("*.")) {
      const base = entry.slice(2);
      if (originHostname.endsWith(`.${base}`)) return true;
      continue;
    }

    // Bare hostname or hostname:port
    if (entry.includes(":")) {
      if (originHost === entry) return true;
    } else {
      if (originHostname === entry) return true;
    }
  }

  return false;
};

app.use(
  cors({
    // In development, reflect the request origin so cookies/sessions work
    // even if the frontend runs on a different localhost port.
    origin:
      config.NODE_ENV === "development"
        ? true
        : (origin, callback) => {
            // Requests like health checks may not send an Origin header.
            if (!origin) return callback(null, true);

            if (isOriginAllowed(origin, config.FRONTEND_ORIGIN)) {
              return callback(null, true);
            }

            return callback(new Error(`Not allowed by CORS: ${origin}`));
          },
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      status: "ok",
      service: "backend",
      basePath: BASE_PATH,
    });
  })
);

app.get(
  `${BASE_PATH}`,
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
      status: "ok",
      service: "backend",
      basePath: BASE_PATH,
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
