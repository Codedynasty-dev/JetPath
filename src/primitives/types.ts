import { IncomingMessage, Server, ServerResponse } from "node:http";
import type { _JetPath_paths } from "./functions.js";
import type { Context, JetPlugin } from "./classes.js";

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void ? I
  : never;

export interface ContextType<
  JetData extends {
    body?: Record<string, any>;
    params?: Record<string, any>;
    search?: Record<string, any>;
  },
  JetPluginTypes extends Record<string, unknown>[],
> {
  /**
   * an object you can set values to per request
   */
  app: UnionToIntersection<JetPluginTypes[number]> & Record<string, any>;
  /**
   * get body params after /?
   */
  body: JetData["body"];
  /**
   * get search params after /?
   */
  search: JetData["search"];
  /**
   * get route params in /:thing
   */
  params: JetData["params"];
  /**
   * remove request control from the request
   */
  eject(): never;
  /**
   * reply the request
   */
  request: Request;
  /**
   * API status
   */
  code: number;
  /**
   * validate body
   */
  validate: (data?: any) => JetData["body"];
  /**
   * send a stream
   */
  // sendStream(stream: Stream | string, ContentType: string): never;
  sendStream(stream: any | string, ContentType: string): never;
  /**
   * reply the request
   */
  send(data: unknown, ContentType?: string): never;
  /**
   * end the request with an error
   */
  throw(
    code?: number | string | Record<string, any> | unknown,
    message?: string | Record<string, any>,
  ): never;
  /**
   * redirect the request
   */
  redirect(url: string): never;
  /**
   * get request header values
   */
  get(field: string): string | undefined;
  /**
   * set request header values
   */
  set(field: string, value: string): void;
  /**
   * Parses the request as JSON
   */

  json(): Promise<Record<string, any>>;

  /**
   * get original request
   */
  path: string;
  _1?: string | undefined;
  _2?: Record<string, string>;
  _3?: any; //Stream | undefined; // Stream
  _4?: boolean | undefined;
  _5?: (() => never) | undefined;
}

export type JetPluginExecutorInitParams = {
  runtime: {
    node: boolean;
    bun: boolean;
    deno: boolean;
  };
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  routesObject: typeof _JetPath_paths;
  JetPath_app: (req: Request) => Response;
};
export type JetPluginExecutor = (
  this: JetPlugin,
  init: JetPluginExecutorInitParams,
) => Record<string, any>;

export type contentType =
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "application/json";

export type methods =
  | "GET"
  | "POST"
  | "OPTIONS"
  | "DELETE"
  | "HEAD"
  | "PUT"
  | "PATCH";

export type allowedMethods = methods[];

export type jetOptions = {
  globalHeaders?: Record<string, string>;
  apiDoc?: {
    name?: string;
    info?: string;
    color?: string;
    logo?: string;
    path?: string;
  };
  source?: string;
  credentials?: {
    cert: string;
    key: string;
  };
  APIdisplay?: "UI" | "HTTP" | false;
  port?: number;
  static?: { route: string; dir: string };
  cors?:
    | {
      allowMethods?: allowedMethods;
      secureContext?: {
        "Cross-Origin-Opener-Policy":
          | "same-origin"
          | "unsafe-none"
          | "same-origin-allow-popups";
        "Cross-Origin-Embedder-Policy": "require-corp" | "unsafe-none";
      };
      allowHeaders?: string[];
      exposeHeaders?: string[];
      keepHeadersOnError?: boolean;
      maxAge?: string;
      credentials?: boolean;
      privateNetworkAccess?: any;
      origin?: string[];
    }
    | boolean;
  websocket?:
    | {
      idleTimeout?: number;
    }
    | boolean;
};

export type HTTPBody<Obj extends Record<string, any>> = {
  [x in keyof Obj]: {
    err?: string;
    type?: "string" | "number" | "file" | "object" | "boolean" | "array";
    arrayType?:
      | "string"
      | "number"
      | "file"
      | "object"
      | "boolean"
      | "object"
      | "array";
    RegExp?: RegExp;
    inputAccept?: string;
    inputType?:
      | "date"
      | "email"
      | "file"
      | "password"
      | "number"
      | "time"
      | "tel"
      | "datetime"
      | "url";
    inputDefaultValue?: string | number | boolean;
    required?: boolean;
    validator?: (value: any) => boolean;
    objectSchema?: HTTPBody<Record<string, any>>;
  };
};

export type JetMiddleware = (
  ctx: Context,
) => Promise<void> | void | Promise<(ctx: Context, error: unknown) => Promise<any>|any> | ((ctx: Context, error: unknown) => Promise<any>|any);

export type JetFunc<
  JetData extends {
    body?: Record<string, any>;
    params?: Record<string, any>;
    search?: Record<string, any>;
  } = { body: {}; params: {}; search: {} },
  JetPluginTypes extends Record<string, unknown>[] = [],
> = {
  (ctx: ContextType<JetData, JetPluginTypes>): Promise<void> | void;
  body?: HTTPBody<JetData["body"] & Record<string, any>>;
  headers?: Record<string, string>;
  info?: string;
  method?: string;
  jet_middleware?: JetMiddleware[];
};
