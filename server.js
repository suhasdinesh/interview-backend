const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/interview", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const usersCollection = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("users", usersCollection);

const employeeCollection = new mongoose.Schema({
  id: Number,
  name: String,
  dob: Date,
  address: String,
});

const Employee = mongoose.model("employees", employeeCollection);


app.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) return res.status(401).send("Incorrect username.");
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) res.status(200).send("Logged in successfully");
      else res.status(401).send("Incorrect password.");
    } catch (err) {
      res.status(500).send("Error occurred.");
    }
  });
  
  app.post("/register", async (req, res) => {
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = new User({ username: req.body.username, password: hash });
      await user.save();
      res.status(200).send("User registered successfully!");
    } catch (err) {
      res.status(500).send("Error registering user.");
    }
  });


app.post("/addEmployee", async (req, res) => {
  try {
    const employee = new Employee({
      id: req.body.id,
      name: req.body.name,
      dob: req.body.dob,
      address: req.body.address,
    });
    await employee.save();
    res.status(201).send("Employee added successfully!");
  } catch (err) {
    res.status(500).send("Error occurred while adding employee.");
  }
});

// Read all employees
app.get("/getEmployees", async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).send("Error occurred while fetching employees.");
  }
});

// Read a single employee by ID
app.get("/getEmployee/:id", async (req, res) => {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) return res.status(404).send("Employee not found.");
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).send("Error occurred while fetching employee.");
  }
});

app.put("/updateEmployee/:id", async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!employee) return res.status(404).send("Employee not found.");
    res.status(200).send("Employee updated successfully!");
  } catch (err) {
    res.status(500).send("Error occurred while updating employee.");
  }
});

app.delete("/deleteEmployee/:id", async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ id: req.params.id });
    if (!employee) return res.status(404).send("Employee not found.");
    res.status(200).send("Employee deleted successfully!");
  } catch (err) {
    res.status(500).send("Error occurred while deleting employee.");
  }
});

app.get("/test", (req, res) => {
    res.status(200).send("Test successful");
  });
  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
