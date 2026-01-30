import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import employeesRoutes from "./routes/employees.routes.js";
import activitiesRoutes from "./routes/activities.routes.js"; 
import delegatedRoutes from "./routes/delegatedMembers.routes.js"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Backend running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/activities", activitiesRoutes); 
app.use("/api/delegated-members", delegatedRoutes); 

export default app;