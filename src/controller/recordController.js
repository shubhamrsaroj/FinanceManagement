import FinancialRecord from "../models/FinancialRecord.js";
import AuditLog from "../models/AuditLog.js";
import { createError, asyncHandler } from "../middleware/errorHandler.js";


export const createRecord = asyncHandler(async (req, res) => {

  const recordData = {

    ...req.body,
    user: req.user._id,
    createdBy: req.user._id

  }

  const duplicateCheck = await FinancialRecord.findOne({
    user: req.user.id,
    amount: recordData.amount,
    type: recordData.type,
    category: recordData.category,
    isDeleted: false,
    date: {
      $gte: new Date(new Date(recordData.date).getTime() - 60000),
      $lte: new Date(new Date(recordData.date).getTime() + 60000)
    }
  });

  if (duplicateCheck) {
    return res.status(400).json({
      success: false,
      message: 'Potential duplicate transaction detected',
      duplicate: duplicateCheck,
      hint: 'If this is intentional, please modify the date or amount slightly'
    });
  }

  const record = await FinancialRecord.create(recordData);

  await AuditLog.create({
    user: req.user.id,
    action: 'CREATE',
    resource: 'FinancialRecord',
    resourceId: record._id,
    details: { amount: record.amount, type: record.type, category: record.category }
  });

  res.status(201).json({
    success: true,
    message: 'Financial record created successfully',
    data: record
  });

});


export const getRecords = asyncHandler(async (req, res) => {

  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'desc',
    type,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search
  } = req.query;


  const query = {
    isDeleted: false
  }


  if (req.user.role !== 'admin') {
    query.user = req.user.id;
  }
  else if (req.query.userId) {
    query.user = req.querry.id;
  }


  if (type) query.type = type;
  if (category) query.category = category;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email'),
    FinancialRecord.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: records,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });

});

export const getRecord = asyncHandler(async (req, res) => {
  const record = await FinancialRecord.findOne({
    _id: req.params.id,
    isDeleted: false
  }).populate('user', 'name email');

  if (!record) {
    throw createError('Record not found', 404);
  }

  if (req.user.role !== 'admin' && record.user._id.toString() !== req.user.id) {
    throw createError('You can only view your own records', 403);
  }

  res.status(200).json({
    success: true,
    data: record
  });
});


export const updateRecord = asyncHandler(async (req, res) => {
  const record = await FinancialRecord.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!record) {
    throw createError('Record not found', 404);
  }

  if (req.user.role !== 'admin' && record.user.toString() !== req.user.id) {
    throw createError('You can only update your own records', 403);
  }

  const allowedUpdates = ['amount', 'type', 'category', 'date', 'description', 'tags'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  updates.updatedBy = req.user.id;

  const updatedRecord = await FinancialRecord.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  await AuditLog.create({
    user: req.user.id,
    action: 'UPDATE',
    resource: 'FinancialRecord',
    resourceId: record._id,
    details: { updates }
  });

  res.status(200).json({
    success: true,
    message: 'Record updated successfully',
    data: updatedRecord
  });
});

// Delete record (soft delete)
export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await FinancialRecord.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!record) {
    throw createError('Record not found', 404);
  }

  if (req.user.role !== 'admin' && record.user.toString() !== req.user.id) {
    throw createError('You can only delete your own records', 403);
  }

  await record.softDelete(req.user.id);

  await AuditLog.create({
    user: req.user.id,
    action: 'DELETE',
    resource: 'FinancialRecord',
    resourceId: record._id
  });

  res.status(200).json({
    success: true,
    message: 'Record deleted successfully'
  });
});

// Get categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await FinancialRecord.aggregate([
    {
      $match: {
        user: req.user._id,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        categories: {
          $push: {
            name: '$_id.category',
            count: '$count',
            total: '$total'
          }
        }
      }
    }
  ]);

  // Reshape from [{_id: 'income', categories: [...]}, ...] to {income: [...], expense: [...]}
  const categoriesMap = { income: [], expense: [] };
  categories.forEach(group => {
    if (group._id === 'income' || group._id === 'expense') {
      categoriesMap[group._id] = group.categories;
    }
  });

  res.status(200).json({
    success: true,
    data: categoriesMap
  });
});



