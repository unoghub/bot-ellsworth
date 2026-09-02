import { listenServer, createApp } from "./server.js";

import "./database/index.js";
import "./ws/index.js";

import "./manager/index.js";

const app = createApp();

listenServer(app);