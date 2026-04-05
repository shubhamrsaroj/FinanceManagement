import mongoose from 'mongoose';
import { RECORD_TYPES } from '../config/constants.js';


const financialRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    enum: Object.values(RECORD_TYPES),
    required: [true, 'Type is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

financialRecordSchema.index({user:1 , date:-1});
financialRecordSchema.index({ user: 1, type: 1, category: 1 });
financialRecordSchema.index({user:1,isDeleted:1,date:-1});


financialRecordSchema.methods.softDelete = async function(userId){

    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return await this.save();

}

const FinancialRecord = new mongoose.model('FinancialRecord',financialRecordSchema);


export default FinancialRecord;