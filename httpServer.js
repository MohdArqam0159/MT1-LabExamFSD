import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 150, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 200, availability: false },
];

const REQUIRED_FIELDS = ["id", "foodName", "category", "price", "availability"];

const sendJSON = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
};

const sendHTML = (res, status, html) => {
  res.writeHead(status, { "Content-Type": "text/html" });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const url = req.url.split("?")[0];

  // GET routes
  if (method === "GET") {
    if (url === "/") {
      return sendHTML(
        res,
        200,
        "<h1>Welcome to Tasty Bites Restaurant</h1><p>Visit /foods, /about or /menu</p>"
      );
    }

    if (url === "/foods") {
      return sendJSON(res, 200, foods.filter((food) => food.availability === true));
    }

    if (url === "/about") {
      return sendHTML(
        res,
        200,
        "<h1>About Us</h1><p>Tasty Bites - serving fresh food since 2020. Open 10 AM to 11 PM.</p>"
      );
    }

    if (url === "/menu") {
      const filePath = path.join(__dirname, "public", "menu.html");
      return fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          return res.end("500 - Internal Server Error: Unable to read menu file");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
      });
    }
  }

  // POST /add-food
  if (method === "POST" && url === "/add-food") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let food;
      try {
        food = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, { error: "Invalid JSON" });
      }

      const missing = REQUIRED_FIELDS.filter(
        (field) => food === null || typeof food !== "object" || food[field] === undefined
      );
      if (missing.length > 0) {
        return sendJSON(res, 400, { error: `Missing required fields: ${missing.join(", ")}` });
      }

      foods.push(food);
      sendJSON(res, 201, { message: "Food item added successfully", food });
    });
    return;
  }

  // Anything else
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 - Route Not Found");
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});