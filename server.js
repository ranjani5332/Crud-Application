const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- MongoDB Connection ---------- */
mongoose.connect("mongodb://127.0.0.1:27017/taskmanager")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------- Task Schema ---------- */
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String
});

const Task = mongoose.model("Task", TaskSchema);

/* ---------- API Routes ---------- */

// CREATE
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// READ
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

/* ---------- Frontend (HTML + JS) ---------- */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Task Manager</title>
</head>
<body>
  <h2>Task Management System</h2>

  <input id="title" placeholder="Task Title"/>
  <input id="desc" placeholder="Description"/>
  <button onclick="addTask()">Add Task</button>

  <ul id="taskList"></ul>

<script>
  async function fetchTasks() {
    const res = await fetch('/tasks');
    const tasks = await res.json();
    document.getElementById('taskList').innerHTML =
      tasks.map(t =>
        '<li>' + t.title + ' - ' + t.description +
        ' <button onclick="deleteTask(\\'' + t._id + '\\')">Delete</button></li>'
      ).join('');
  }

  async function addTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('desc').value;

    await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    fetchTasks();
  }

  async function deleteTask(id) {
    await fetch('/tasks/' + id, { method: 'DELETE' });
    fetchTasks();
  }

  fetchTasks();
</script>

</body>
</html>
`);
});

/* ---------- Server ---------- */
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});