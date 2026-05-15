import express from "express";
import { doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard } from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";


const doctorRouter = express.Router();

doctorRouter.post('/login', loginDoctor);

doctorRouter.get('/list', doctorList)

doctorRouter.get('/appointments', authDoctor, appointmentsDoctor)

doctorRouter.post('/appointment-complete', authDoctor, appointmentComplete)

doctorRouter.post('/appointment-cancel', authDoctor, appointmentCancel)

doctorRouter.get('/dashboard', authDoctor, doctorDashboard)

export default doctorRouter