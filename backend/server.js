import express from "express";
import cors from "cors";
import 'dotenv/config';
import mongoose from "mongoose";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";


// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middleware
app.use(cors());
app.use(express.json());

// api endpoints

app.use("/api/admin", adminRouter);
// localhost:4000/api/admin/add-doctor

app.use('/api/doctor', doctorRouter);

app.get("/", (req, res) => {
    res.send(" API Working");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});