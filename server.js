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
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(base, target) {
  // evita ../ traversal
  const targetPath = path.posix.normalize("/" + target).replace(/^\/+/, "");
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = (req.url || "/").split("?")[0];

    // rota principal
    const rel = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath.slice(1));

    const filePath = safeJoin(__dirname, rel);

    // Se tentar sair do diretório, bloqueia
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad Request");
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        // fallback: para SPA/landing, sempre volta para index.html
        const indexPath = path.join(__dirname, "index.html");
        fs.readFile(indexPath, (e2, content) => {
          if (e2) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Erro ao carregar index.html");
            return;
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";

      fs.readFile(filePath, (e3, content) => {
        if (e3) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Erro ao carregar arquivo");
          return;
        }
        res.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=3600" });
        res.end(content);
      });
    });
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Erro interno");
  }
});

server.listen(PORT, () => {
  console.log(`Server on :${PORT}`);
});

// TROQUE PELO LABEL QUANDO CRIAR A CONVERSÃO
const SEND_TO_START  = "AW-17941199389/w4XZCPTQnvUbEJ30g-tC";
const SEND_TO_EXPERT = "AW-17941199389/YYYYYYYYYYY";
const SEND_TO_MASTER = "AW-17941199389/ZZZZZZZZZZZ";

function fireGoogleConversion(sendTo){
  if(typeof gtag !== "function") return;
  gtag('event','conversion',{ send_to: sendTo });
}

// Botões com data-go-plan
document.querySelectorAll("[data-go-plan]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const plan = btn.getAttribute("data-go-plan");

    if(plan==="start")  fireGoogleConversion(SEND_TO_START);
    if(plan==="expert") fireGoogleConversion(SEND_TO_EXPERT);
    if(plan==="master") fireGoogleConversion(SEND_TO_MASTER);
  });
});

const GOOGLE_SEND_TO_START = "AW-17941199389/w4XZCPTQnvUbEJ30g-tC";

function fireGoogleConversion(){
  if(typeof gtag !== "function") return;

  gtag('event','conversion',{
    send_to: GOOGLE_SEND_TO_START,
    value: 1.0,
    currency: 'BRL'
  });
}

