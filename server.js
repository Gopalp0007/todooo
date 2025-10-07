require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Schema and Model
const taskSchema = new mongoose.Schema({
  text: String,
  done: {
    type: Boolean,
    default: false
  }
});

const Task = mongoose.model("Task", taskSchema);

// routes
app.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.render("list", { items: tasks });
});

app.post("/add", async (req, res) => {
  const taskText = req.body.ele1;

  if (taskText.trim() === "") {
    return res.send("<script>alert('Please write something!'); window.location.href='/'</script>");
  }

  const newTask = new Task({ text: taskText });
  await newTask.save();
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  await Task.findByIdAndDelete(id);
  res.redirect("/");
});

app.post("/toggle", async (req, res) => {
  const id = req.body.id;
  const task = await Task.findById(id);
  if (task) {
    task.done = !task.done;
    await task.save();
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.id;
  const newText = req.body.newText;

  if (newText.trim() !== "") {
    await Task.findByIdAndUpdate(id, { text: newText });
  }

  res.redirect("/");
});

// start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
