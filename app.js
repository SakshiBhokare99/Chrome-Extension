const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const logRoutes = require("./routes/logRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch((err) => console.log(err));

app.use("/api/logs", logRoutes);

// Dashboard Files
app.use("/analytics-dashboard", express.static(__dirname));

app.get("/analytics-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});