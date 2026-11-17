import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

let foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 150, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 200, availability: false },
];

const REQUIRED_FIELDS = ["id", "foodName", "category", "price", "availability"];

const validateFood = (food) => {
  if (!food || typeof food !== "object") return "Request body is required";
  const missing = REQUIRED_FIELDS.filter((field) => food[field] === undefined);
  if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`;
  if (typeof food.price !== "number" || food.price <= 0) return "Price must be a positive number";
  return null;
};

// GET all
app.get("/foods", (req, res) => {
  res.json(foods);
});

// GET by id
app.get("/foods/:id", (req, res) => {
  const food = foods.find((item) => item.id === Number(req.params.id));
  if (!food) return res.status(404).json({ error: "Food item not found" });
  res.json(food);
});

// POST
app.post("/foods", (req, res) => {
  const error = validateFood(req.body);
  if (error) return res.status(400).json({ error });

  if (foods.some((item) => item.id === req.body.id)) {
    return res.status(400).json({ error: "Food item with this id already exists" });
  }

  const { id, foodName, category, price, availability } = req.body;
  const food = { id, foodName, category, price, availability };
  foods.push(food);
  res.status(201).json({ message: "Food item added successfully", food });
});

// PUT
app.put("/foods/:id", (req, res) => {
  const index = foods.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Food item not found" });

  const updated = { ...foods[index], ...req.body, id: foods[index].id };
  const error = validateFood(updated);
  if (error) return res.status(400).json({ error });

  foods[index] = updated;
  res.json({ message: "Food item updated successfully", food: updated });
});

// DELETE
app.delete("/foods/:id", (req, res) => {
  const index = foods.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Food item not found" });

  const [deleted] = foods.splice(index, 1);
  res.json({ message: "Food item deleted successfully", food: deleted });
});

// Invalid JSON body / other errors
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});