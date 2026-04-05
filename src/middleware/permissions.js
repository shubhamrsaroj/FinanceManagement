import { PERMISSIONS } from '../config/constants.js';
import { createError } from './errorHandler.js';

// Check permission function
export const hasPermission = (role, resource, action) => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions || !rolePermissions[resource]) return false;
  return rolePermissions[resource].includes(action);
};

// Permission middleware factory function
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!hasPermission(userRole, resource, action)) {
      throw createError(
        `Permission denied. Role '${userRole}' cannot '${action}' on '${resource}'`,
        403
      );
    }

    next();
  };
};

// Check ownership function
export const checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await Model.findById(resourceId);

      if (!resource) {
        throw createError('Resource not found', 404);
      }

      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      const ownerId = resource.user?.toString() || resource._id.toString();
      if (ownerId !== req.user.id) {
        throw createError('You can only access your own resources', 403);
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};