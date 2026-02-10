// server.js (Node http puro) - serve index.html + arquivos estáticos (png/jpg/css/js/etc)
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 10000;

// Pasta do projeto (onde estão server.js e index.html)
const ROOT = __dirname;

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
  ".ttf": "font/ttf",
  ".mp4": "video/mp4"
};

function safeJoin(base, target) {
  // evita path traversal
  const targetPath = path.normalize(target).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(base, targetPath);
}

function send(res, status, content, headers = {}) {
  res.writeHead(status, headers);
  res.end(content);
}

function streamFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";

  const stat = fs.statSync(filePath);

  // Cache leve (bom para imagens/css/js)
  const cacheHeader =
    ext === ".html" ? "no-store" : "public, max-age=3600";

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Cache-Control": cacheHeader
  });

  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url);
    let pathname = decodeURIComponent(parsed.pathname || "/");

    // Normaliza
    if (!pathname || pathname === "/") pathname = "/index.html";

    // Caminho absoluto seguro
    const filePath = safeJoin(ROOT, pathname);

    // Se existir arquivo, serve ele
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return streamFile(res, filePath);
    }

    // fallback SPA: devolve index.html
    const indexPath = path.join(ROOT, "index.html");
    if (fs.existsSync(indexPath)) {
      return streamFile(res, indexPath);
    }

    return send(res, 404, "Not Found", { "Content-Type": "text/plain; charset=utf-8" });
  } catch (err) {
    console.error(err);
    return send(res, 500, "Internal Server Error", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
