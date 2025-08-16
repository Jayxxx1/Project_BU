import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, default: '' },
  advisor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // อาจารย์
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],               // นศ.
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status:      { type: String, enum: ['active','archived'], default: 'active', index: true },
}, { timestamps: true });

export default mongoose.model('Group', GroupSchema); 
