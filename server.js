const http = require("http");
const fs = require("fs");
const path = require("path");

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  // Healthcheck
  if (url === "/healthz") {
    return send(res, 200, { "Content-Type": "application/json" }, JSON.stringify({ ok: true }));
  }

  // Serve only index.html (single page)
  const filePath = path.join(__dirname, "index.html");
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      return send(res, 500, { "Content-Type": "text/plain" }, "Erro interno");
    }

    // Basic caching (safe)
    send(res, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300" // 5 min
    }, html);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Landing rodando na porta", PORT));
