import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; 

import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;