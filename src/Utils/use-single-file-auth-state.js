import AsyncLock from "async-lock";
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { proto } from "../../WAProto";
import { initAuthCreds } from "./auth-utils";
import { BufferJSON } from "./generics";

const fileLock = new AsyncLock({ maxPending: Infinity });

const KEY_MAP = {
  "pre-key": "preKeys",
  session: "sessions",
  "sender-key": "senderKeys",
  "app-state-sync-key": "appStateSyncKeys",
  "app-state-sync-version": "appStateVersions",
  "sender-key-memory": "senderKeyMemory",
};

export const useSingleFileAuthState = async (filename) => {
  let creds;
  let keys = {};

  const writeData = (data, file) => {
    const filePath = join(fixFileName(file));
    return fileLock.acquire(filePath, () =>
      writeFile(join(filePath), JSON.stringify(data, BufferJSON.replacer, 2)),
    );
  };

  const readData = async (file) => {
    try {
      const filePath = join(fixFileName(file));
      const data = await fileLock.acquire(filePath, () =>
        readFile(filePath, { encoding: "utf-8" }),
      );
      return JSON.parse(data, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  };

  const removeData = async (file) => {
    try {
      const filePath = join(fixFileName(file));
      await fileLock.acquire(filePath, () => unlink(filePath));
    } catch {}
  };

  const fixFileName = (file) => file?.replace(/\//g, "__")?.replace(/:/g, "-");
  const fileData = await readData(fixFileName(filename));
  if (fileData) ({ creds, keys } = fileData);
  else initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce((dict, id) => {
            let value = keys[key]?.[id];
            if (value) {
              if (type === "app-state-sync-key") {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              dict[id] = value;
            }
            return dict;
          }, {});
        },
        set: async (data) => {
          for (const _key in data) {
            const key = KEY_MAP[_key];
            keys[key] = keys[key] || {};
            Object.assign(keys[key], data[_key]);
          }
          writeData({ creds, keys }, filename);
        },
      },
    },
    saveState: () => {
      return writeData({ creds, keys }, filename);
    },
  };
};
