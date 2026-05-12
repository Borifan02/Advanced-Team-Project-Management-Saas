import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import {
  googleLoginCallback,
  loginController,
  logOutController,
  registerUserController,
} from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;
const isGoogleOAuthConfigured =
  Boolean(config.GOOGLE_CLIENT_ID) &&
  Boolean(config.GOOGLE_CLIENT_SECRET) &&
  Boolean(config.GOOGLE_CALLBACK_URL);

const authRoutes = Router();

authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);

authRoutes.post("/logout", logOutController);

authRoutes.get(
  "/google",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      res.status(404).json({ message: "Google OAuth is not configured" });
      return;
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRoutes.get(
  "/google/callback",
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      res.status(404).json({ message: "Google OAuth is not configured" });
      return;
    }
    next();
  },
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginCallback
);

export default authRoutes;
