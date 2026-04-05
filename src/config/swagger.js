import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description:
        'Backend API for a Finance Dashboard system supporting user/role management, financial records, dashboard analytics, and role-based access control.',
      contact: {
        name: 'Shubham Saroj',
        email: 'shubhamrsaroj229@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: process.env.API_BASE_URL ? 'Production server' : 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token (obtained from /auth/login or /auth/register)'
        }
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50, example: 'Shubham Saroj' },
            email: { type: 'string', format: 'email', example: 'shubham@example.com' },
            password: { type: 'string', minLength: 6, example: 'Password123!' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'], default: 'viewer', example: 'admin' }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'shubham@example.com' },
            password: { type: 'string', example: 'Password123!' }
          }
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'Password123!' },
            newPassword: { type: 'string', minLength: 6, example: 'NewPassword456!' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661f1b2c3d4e5f6a7b8c9d0e' },
            name: { type: 'string', example: 'Shubham Saroj' },
            email: { type: 'string', example: 'shubham@example.com' },
            role: { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        // ── Records ───────────────────────────────────────────────────────────
        CreateRecordInput: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            amount: { type: 'number', minimum: 0.01, example: 2500 },
            type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
            category: { type: 'string', example: 'Salary' },
            date: { type: 'string', format: 'date-time', example: '2026-04-01T00:00:00.000Z' },
            description: { type: 'string', maxLength: 500, example: 'Monthly salary' },
            tags: { type: 'array', items: { type: 'string' }, example: ['salary', 'monthly'] }
          }
        },
        UpdateRecordInput: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0.01, example: 3000 },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'Salary' },
            date: { type: 'string', format: 'date-time' },
            description: { type: 'string', maxLength: 500, example: 'Updated salary' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        FinancialRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661f1b2c3d4e5f6a7b8c9d0e' },
            user: { type: 'string', example: '661f1b2c3d4e5f6a7b8c9d0f' },
            amount: { type: 'number', example: 2500 },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string', example: 'Salary' },
            date: { type: 'string', format: 'date-time' },
            description: { type: 'string', example: 'Monthly salary' },
            tags: { type: 'array', items: { type: 'string' } },
            isDeleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // ── Common ────────────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid JWT token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'No token provided' }
            }
          }
        },
        Forbidden: {
          description: 'Insufficient role permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Access denied. Insufficient permissions.' }
            }
          }
        },
        BadRequest: {
          description: 'Validation error or bad input',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Record not found' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication and user account endpoints' },
      { name: 'Records', description: 'Financial records CRUD and filtering' },
      { name: 'Analytics', description: 'Dashboard summaries and spending insights' }
    ],
    paths: {
      // ────────────────────────────────────── AUTH ──────────────────────────────
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' }
          }
        }
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get the currently authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Current user profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/v1/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout the current user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Logged out successfully' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/v1/auth/change-password': {
        post: {
          tags: ['Auth'],
          summary: 'Change the current user\'s password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordInput' } }
            }
          },
          responses: {
            200: {
              description: 'Password changed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },

      // ────────────────────────────────────── RECORDS ───────────────────────────
      '/api/v1/records': {
        post: {
          tags: ['Records'],
          summary: 'Create a new financial record (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateRecordInput' } }
            }
          },
          responses: {
            201: {
              description: 'Record created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/FinancialRecord' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' }
          }
        },
        get: {
          tags: ['Records'],
          summary: 'Get all financial records (with optional filters & pagination)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filter by record type' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter records from this date (YYYY-MM-DD)' },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter records up to this date (YYYY-MM-DD)' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Records per page' }
          ],
          responses: {
            200: {
              description: 'List of financial records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/v1/records/categories': {
        get: {
          tags: ['Records'],
          summary: 'Get all available income and expense categories',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Category lists',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          income: { type: 'array', items: { type: 'string' }, example: ['Salary', 'Freelance'] },
                          expense: { type: 'array', items: { type: 'string' }, example: ['Food', 'Transport'] }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/v1/records/{id}': {
        get: {
          tags: ['Records'],
          summary: 'Get a single financial record by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the record' }
          ],
          responses: {
            200: {
              description: 'Single financial record',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/FinancialRecord' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' }
          }
        },
        patch: {
          tags: ['Records'],
          summary: 'Update a financial record (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the record' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/UpdateRecordInput' } }
            }
          },
          responses: {
            200: {
              description: 'Record updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/FinancialRecord' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' }
          }
        },
        delete: {
          tags: ['Records'],
          summary: 'Soft-delete a financial record (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ObjectId of the record' }
          ],
          responses: {
            200: {
              description: 'Record soft-deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' }
          }
        }
      },

      // ────────────────────────────────────── ANALYTICS ─────────────────────────
      '/api/v1/analytics/dashboard': {
        get: {
          tags: ['Analytics'],
          summary: 'Get dashboard summary (all authenticated users)',
          description: 'Returns totals for income, expenses, net balance, recent transactions, and category-wise breakdown.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Dashboard summary data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalIncome: { type: 'number', example: 7000 },
                          totalExpenses: { type: 'number', example: 1500 },
                          netBalance: { type: 'number', example: 5500 },
                          recentTransactions: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                          categoryTotals: { type: 'object', additionalProperties: { type: 'number' } }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/api/v1/analytics/insights': {
        get: {
          tags: ['Analytics'],
          summary: 'Get spending insights (analyst & admin only)',
          description: 'Returns detailed spending breakdown and trends. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Spending insights data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' }
          }
        }
      },
      '/api/v1/analytics/comparison': {
        get: {
          tags: ['Analytics'],
          summary: 'Get comparative analysis (analyst & admin only)',
          description: 'Returns monthly/weekly comparative trends. Requires analyst or admin role.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Comparative analysis data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' }
          }
        }
      }
    }
  },
  apis: [] // All paths are defined inline above; no JSDoc scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
