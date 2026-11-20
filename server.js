const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory array (data resets when the server restarts)
let products = [];
let nextId = 1;

// GET /api/products : fetch all
app.get("/api/products", (req, res) => {
  res.json(products);
});

// POST /api/products : create
app.post("/api/products", (req, res) => {
  const { name, price } = req.body;

  if (!name || !String(name).trim() || price === undefined || price === "") {
    return res.status(400).json({ message: "Name and price are required." });
  }
  if (isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ message: "Price must be a valid positive number." });
  }

  const product = { id: nextId++, name: String(name).trim(), price: Number(price) };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id : update
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const { name, price } = req.body;
  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({ message: "Name cannot be empty." });
    }
    product.name = String(name).trim();
  }
  if (price !== undefined) {
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number." });
    }
    product.price = Number(price);
  }

  res.json(product);
});

// DELETE /api/products/:id : delete
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  const [removed] = products.splice(index, 1);
  res.json({ message: "Product deleted successfully.", product: removed });
});

app.listen(PORT, () => console.log("Server running at http://localhost:" + PORT));