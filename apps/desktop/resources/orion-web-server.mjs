import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

const host = process.env.ORION_WEB_HOST ?? "127.0.0.1";
const port = Number(process.env.ORION_WEB_PORT ?? "3760");
const staticDir = process.env.ORION_WEB_STATIC_DIR;
const serverEntryPath = process.env.ORION_WEB_SERVER_ENTRY;

if (!staticDir || !serverEntryPath) {
  throw new Error("Missing Orion web server configuration.");
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

const { default: serverEntry } = await import(pathToFileURL(serverEntryPath).href);

function getStaticFilePath(urlPath) {
  const pathname = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const requestedPath = path.normalize(path.join(staticDir, pathname));

  if (!requestedPath.startsWith(path.normalize(staticDir))) {
    return null;
  }

  if (!fs.existsSync(requestedPath) || fs.statSync(requestedPath).isDirectory()) {
    return null;
  }

  return requestedPath;
}

function serveStaticFile(filePath, response) {
  response.statusCode = 200;
  response.setHeader(
    "content-type",
    mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
  );
  fs.createReadStream(filePath).pipe(response);
}

const httpServer = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${String(port)}`}`);
    const staticFilePath = getStaticFilePath(requestUrl.pathname);

    if (staticFilePath) {
      serveStaticFile(staticFilePath, response);
      return;
    }

    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : Readable.toWeb(request);

    const appRequest = new Request(requestUrl, {
      method: request.method,
      headers: request.headers,
      body,
      duplex: body ? "half" : undefined,
    });

    const appResponse = await serverEntry.fetch(appRequest);

    response.statusCode = appResponse.status;
    appResponse.headers.forEach((value, key) => {
      response.setHeader(key, value);
    });

    if (!appResponse.body) {
      response.end();
      return;
    }

    Readable.fromWeb(appResponse.body).pipe(response);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end(error instanceof Error ? error.stack ?? error.message : "Unknown server error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`ORION_WEB_SERVER_READY http://${host}:${String(port)}`);
});
