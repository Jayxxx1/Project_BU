import mongoose from 'mongoose';

const { Schema } = mongoose;


const groupSchema = new Schema({
  groupNumber: { type: String, required: true, trim: true, index: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  advisor:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  status: { type: String, enum: ['active','archived'], default: 'active', index: true },
}, { timestamps: true });

groupSchema.index({ name: 1, advisor: 1 });

export default mongoose.model('Group', groupSchema);
