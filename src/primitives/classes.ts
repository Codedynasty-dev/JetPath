import { createReadStream } from "node:fs";
import { IncomingMessage } from "node:http";
import { Stream } from "node:stream";
import { _DONE, _JetPath_paths, _OFF, UTILS, validator } from "./functions.js";
import type {
  JetPluginExecutor,
  JetPluginExecutorInitParams,
  methods,
} from "./types.js";
import { BunFile } from "bun";

export class JetPlugin {
  name?: string;
  version?: string;
  JetPathServer?: any;
  hasServer?: boolean;
  executor: JetPluginExecutor;
  constructor({ executor }: { executor: JetPluginExecutor }) {
    this.executor = executor;
  }
  _setup(init: JetPluginExecutorInitParams): any {
    return this.executor.call(this, init);
  }
}

/*@credence-[/index.html]-[jetpath plugins]

## jetpath plugins

Jetpath plugins are a way to extend the functionalities of Jetpath.
They can be used to add new features to Jetpath or to modify existing ones.

Plugins can be used to add new routes, middleware, or to modify the request
and response objects or even convert to serverless runtime.

### Creating a plugin

```ts
import { JetPlugin } from "jetpath";

export const plugin = new JetPlugin{
  name: "plugin",
  version: "1.0.0",
  executor({ config }) {
    return {
      greet_world() {
        return {
          body: "Hello world",
        };
      },
    };
  },
});

```

*/

export class Log {
  // Define ANSI escape codes for colors and styles
  static colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fgBlack: "\x1b[30m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgBlue: "\x1b[34m",
    fgMagenta: "\x1b[35m",
    fgCyan: "\x1b[36m",
    fgWhite: "\x1b[37m",

    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
  };
  static print(message: any, color: string) {
    console.log(`${color}%s${Log.colors.reset}`, `Jetpath: ${message}`);
  }

  static info(message: string) {
    Log.print(message, Log.colors.fgBlue);
  }

  static warn(message: string) {
    Log.print(message, Log.colors.fgYellow);
  }

  static error(message: string) {
    Log.print(message, Log.colors.fgRed);
  }

  static success(message: string) {
    Log.print(message, Log.colors.fgGreen);
  }
}

export class Context {
  code = 200;
  request: Request | IncomingMessage | undefined;
  params: Record<string, any> | undefined;
  search: Record<string, any> | undefined;
  body: Record<string, any> | undefined;
  path: string | undefined;
  // ?
  app: Record<string, any> = {};
  //? load
  _1?: string = undefined;
  // ? header of response
  _2?: Record<string, string> = {};
  // //? stream
  _3?: Stream = undefined;
  //? used to know if the request has ended
  _4 = false;
  //? used to know if the request has been offloaded
  _5: any = false;
  //? response
  _6 = false;
  method: methods | undefined;
  // ? reset the COntext to default state
  _7(
    req: Request,
    path: string,
    params?: Record<string, any>,
    search?: Record<string, any>,
  ) {
    this.request = req;
    this.method = req.method as "GET";
    this.params = params || {};
    this.search = search || {};
    this.path = path;
    this.body = undefined;
    //? load
    this._1 = undefined;
    // ? header of response
    this._2 = {};
    // //? stream
    this._3 = undefined;
    //? used to know if the request has ended
    this._4 = false;
    //? used to know if the request has been offloaded
    this._5 = false;
    //? response
    this._6 = false;
    // ? code
    this.code = 200;
  }

  send(data: unknown, contentType?: string) {
    let ctype;
    switch (typeof data) {
      case "string":
        ctype = "text/plain";
        this._1 = data;
        break;
      case "object":
        ctype = "application/json";
        this._1 = JSON.stringify(data);
        break;
      default:
        ctype = "text/plain";
        this._1 = data ? String(data) : "";
        break;
    }
    if (contentType) {
      ctype = contentType;
    }
    if (!this._2) {
      this._2 = {};
    }
    this._2["Content-Type"] = ctype;
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  }

  validate(data: any = this.body || {}) {
    return validator(_JetPath_paths[this.method!][this.path!].body, data);
  }

  redirect(url: string) {
    this.code = 301;
    if (!this._2) {
      this._2 = {};
    }
    this._2["Location"] = url;
    this._1 = undefined;
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  }

  throw(code: unknown = 404, message: unknown = "Not Found") {
    // ? could be a success but a wrong throw, so we check
    if (!this._2) {
      this._2 = {};
    }
    if (!this._4) {
      this.code = 400;
      switch (typeof code) {
        case "number":
          this.code = code;
          if (typeof message === "object") {
            this._2["Content-Type"] = "application/json";
            this._1 = JSON.stringify(message);
          } else if (typeof message === "string") {
            this._2["Content-Type"] = "text/plain";
            this._1 = message;
          }
          break;
        case "string":
          this._2["Content-Type"] = "text/plain";
          this._1 = code;
          break;
        case "object":
          this._2["Content-Type"] = "application/json";
          this._1 = JSON.stringify(code);
          break;
      }
    }
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  }

  get(field: string) {
    if (field) {
      if (UTILS.runtime["node"]) {
        // @ts-expect-error
        return this.request.headers[field] as string;
      }
      return (this.request as unknown as Request).headers.get(field) as string;
    }
    return undefined;
  }

  set(field: string, value: string) {
    if (!this._2) {
      this._2 = {};
    }
    if (field && value) {
      this._2[field] = value;
    }
  }

  eject(): never {
    throw _OFF;
  }

  sendStream(stream: Stream | string | BunFile, ContentType: string) {
    if (!this._2) {
      this._2 = {};
    }
    if (typeof stream === "string") {
      this._2["Content-Disposition"] = `inline; filename="${
        stream.split("/").at(-1) || "unnamed.bin"
      }"`;
      if (UTILS.runtime["bun"]) {
        stream = Bun.file(stream);
      } else {
        stream = createReadStream(stream as string, { autoClose: true });
      }
    }
    this._2["Content-Type"] = ContentType;
    this._3 = stream as Stream;
    this._4 = true;
    if (!this._5) throw _DONE;
    this._5();
    return undefined as never;
  }

  async json<Type extends any = Record<string, any>>(): Promise<Type> {
    if (this.body) {
      return this.body as Promise<Type>;
    }
    if (!UTILS.runtime["node"]) {
      try {
        this.body = await (this.request as unknown as Request).json();
        return this.body as Promise<Type>;
      } catch (error) {
        return Promise.reject(error);
      }
    } else {
      return await new Promise<Type>((resolve) => {
        const chunks: Uint8Array[] = [];
        (this.request as IncomingMessage).on("data", (chunk: Uint8Array) => {
          chunks.push(chunk);
        });
        (this.request as IncomingMessage).on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString();
            this.body = JSON.parse(body);
            resolve(this.body as Type);
          } catch (error) {
            resolve({} as Promise<Type>);
          }
        });
      });
    }
  }
}
