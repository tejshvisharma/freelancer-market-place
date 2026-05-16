import { Router } from "express";
import * as authRoutes from "./authRoutes.js";
import * as userRoutes from "./userRoutes.js";
import * as gigRoutes from "./gigRoutes.js";
import * as proposalRoutes from "./proposalRoutes.js";
import * as reviewRoutes from "./reviewRoutes.js";
import * as chatRoutes from "./chatRoutes.js";
import * as notificationRoutes from "./notificationRoutes.js";
import * as paymentRoutes from "./paymentRoutes.js";
import * as adminRoutes from "./adminRoutes.js";
import * as systemRoutes from "./systemRoutes.js";
import * as freelancerRoutes from "./freelancerRoutes.js";
const router = Router();

const resolveRouter = (moduleExports) => {
  if (moduleExports?.default) {
    return moduleExports.default;
  }

  if (moduleExports?.router) {
    return moduleExports.router;
  }

  return null;
};

const apiBase = "/api/v1";

const routeEntries = [
  [`${apiBase}/auth`, authRoutes],
  [`${apiBase}/freelancer`, freelancerRoutes],
  [`${apiBase}/users`, userRoutes],
  [`${apiBase}/gigs`, gigRoutes],
  [`${apiBase}/proposals`, proposalRoutes],
  [`${apiBase}/reviews`, reviewRoutes],
  [`${apiBase}/chats`, chatRoutes],
  [`${apiBase}/notifications`, notificationRoutes],
  [`${apiBase}/payments`, paymentRoutes],
  [`${apiBase}/admin`, adminRoutes],
  [apiBase, systemRoutes],
];

routeEntries.forEach(([path, moduleExports]) => {
  const route = resolveRouter(moduleExports);
  if (route) {
    router.use(path, route);
  }
});

export default router;
