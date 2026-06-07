import express from "express";
import type { Server } from "node:http";

import { checkDatabaseConnection } from "./config/db.js";
import {
  SERVER_DEFAULT_PORT,
  SERVER_HEALTH_RESPONSE,
  SERVER_HEALTH_ROUTE,
  SERVER_TEST_ENVIRONMENT,
} from "../../shared/constants/server.js";

const resolveServerPort = (value: string | undefined): number => {
  if (!value) {
    return SERVER_DEFAULT_PORT;
  }

  const port = Number(value);
  const isValidPort = Number.isInteger(port) && port > 0 && port <= 65535;

  if (!isValidPort) {
    return SERVER_DEFAULT_PORT;
  }

  return port;
};

export const app = express();

app.get(SERVER_HEALTH_ROUTE, (_request, response) => {
  response.json(SERVER_HEALTH_RESPONSE);
});

export const startServer = async (): Promise<Server> => {
  await checkDatabaseConnection();

  const port = resolveServerPort(process.env.PORT);

  return app.listen(port, () => {
    console.log(`SoundCluster API server listening on ${port}`);
  });
};

if (process.env.NODE_ENV !== SERVER_TEST_ENVIRONMENT) {
  startServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(message);
    process.exitCode = 1;
  });
}
