import { DEFAULT_CONNECTION_CONFIG } from "../Defaults";
import { makeBusinessSocket } from "./business";
// export the last socket layer
const makeWASocket = (config) =>
  makeBusinessSocket({
    ...DEFAULT_CONNECTION_CONFIG,
    ...config,
  });
export default makeWASocket;
