const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safeResolve(urlPath) {
  // remove querystring e normaliza
  const clean = urlPath.split("?")[0];
  const decoded = decodeURIComponent(clean);

  // bloqueia path traversal
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(__dirname, normalized);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    // cache leve para assets (não cacheia html)
    const headers = {
      "Content-Type": type,
    };
    if (ext !== ".html") {
      headers["Cache-Control"] = "public, max-age=3600";
    } else {
      headers["Cache-Control"] = "no-store";
    }

    res.writeHead(200, headers);
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];

  // rota raiz -> index
  if (urlPath === "/" || urlPath === "/index.html") {
    return sendFile(res, path.join(__dirname, "index.html"));
  }

  // tenta servir arquivo estático
  const filePath = safeResolve(urlPath);

  // se existir, serve
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return sendFile(res, filePath);
    }

    // fallback: qualquer outra rota -> index.html (SPA-like)
    return sendFile(res, path.join(__dirname, "index.html"));
  });
});

server.listen(PORT, () => {
  console.log(`Server on :${PORT}`);
});
