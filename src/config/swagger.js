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
            { name: 'minAmount', in: 'query', schema: { type: 'number' }, description: 'Minimum amount filter' },
            { name: 'maxAmount', in: 'query', schema: { type: 'number' }, description: 'Maximum amount filter' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in description, category, or tags' },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['date', 'amount', 'createdAt'], default: 'date' }, description: 'Field to sort by' },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort direction' },
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
          description: 'Returns totals for income, expenses, net balance, recent transactions, category breakdown, and monthly trends. Admin can pass ?userId= to drill into a specific user.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Period start date (defaults to start of current month)' },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Period end date (defaults to end of current month)' },
            { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Admin only: filter dashboard to a specific user' }
          ],
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
                          summary: {
                            type: 'object',
                            properties: {
                              totalIncome: { type: 'number', example: 7000 },
                              totalExpenses: { type: 'number', example: 1500 },
                              netBalance: { type: 'number', example: 5500 },
                              savingsRate: { type: 'string', example: '78.57' },
                              transactionCount: {
                                type: 'object',
                                properties: {
                                  income: { type: 'integer', example: 3 },
                                  expense: { type: 'integer', example: 5 },
                                  total: { type: 'integer', example: 8 }
                                }
                              }
                            }
                          },
                          categoryBreakdown: {
                            type: 'object',
                            properties: {
                              income: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, total: { type: 'number' }, count: { type: 'integer' } } } },
                              expense: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, total: { type: 'number' }, count: { type: 'integer' } } } }
                            }
                          },
                          recentTransactions: { type: 'array', items: { $ref: '#/components/schemas/FinancialRecord' } },
                          monthlyTrends: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                month: { type: 'string', example: '2026-04' },
                                income: { type: 'number' },
                                expense: { type: 'number' },
                                net: { type: 'number' },
                                savingsRate: { type: 'string' }
                              }
                            }
                          },
                          period: {
                            type: 'object',
                            properties: {
                              start: { type: 'string', format: 'date-time' },
                              end: { type: 'string', format: 'date-time' }
                            }
                          }
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
          description: 'Returns top expense categories, per-transaction/day/week/month averages, and unusual transactions over the last 90 days. Requires analyst or admin role. Admin can pass ?userId= to filter.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Admin only: filter insights to a specific user' }
          ],
          responses: {
            200: {
              description: 'Spending insights data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          topCategories: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                category: { type: 'string', example: 'Shopping' },
                                amount: { type: 'number', example: 4500 },
                                percentage: { type: 'string', example: '56.46' }
                              }
                            }
                          },
                          averages: {
                            type: 'object',
                            properties: {
                              perTransaction: { type: 'string', example: '1594.00' },
                              perDay: { type: 'string', example: '88.56' },
                              perWeek: { type: 'string', example: '619.89' },
                              perMonth: { type: 'string', example: '2656.67' }
                            }
                          },
                          unusualTransactions: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                amount: { type: 'number' },
                                category: { type: 'string' },
                                date: { type: 'string', format: 'date-time' },
                                description: { type: 'string' }
                              }
                            }
                          },
                          totalTransactionsAnalyzed: { type: 'integer', example: 5 }
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
      '/api/v1/analytics/comparison': {
        get: {
          tags: ['Analytics'],
          summary: 'Get comparative analysis (analyst & admin only)',
          description: 'Compares current month vs previous month for income, expenses, and savings with percentage change indicators. Requires analyst or admin role. Admin can pass ?userId= to filter.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'query', schema: { type: 'string' }, description: 'Admin only: filter comparison to a specific user' }
          ],
          responses: {
            200: {
              description: 'Comparative analysis data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          currentMonth: {
                            type: 'object',
                            properties: {
                              period: { type: 'object', properties: { start: { type: 'string', format: 'date-time' }, end: { type: 'string', format: 'date-time' } } },
                              income: { type: 'number' },
                              expenses: { type: 'number' },
                              savings: { type: 'number' }
                            }
                          },
                          previousMonth: {
                            type: 'object',
                            properties: {
                              period: { type: 'object', properties: { start: { type: 'string', format: 'date-time' }, end: { type: 'string', format: 'date-time' } } },
                              income: { type: 'number' },
                              expenses: { type: 'number' },
                              savings: { type: 'number' }
                            }
                          },
                          changes: {
                            type: 'object',
                            properties: {
                              income: { type: 'object', properties: { value: { type: 'string' }, direction: { type: 'string', enum: ['up', 'down', 'same'] } } },
                              expenses: { type: 'object', properties: { value: { type: 'string' }, direction: { type: 'string', enum: ['up', 'down', 'same'] } } },
                              savings: { type: 'object', properties: { value: { type: 'string' }, direction: { type: 'string', enum: ['up', 'down', 'same'] } } }
                            }
                          }
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
      }
    }
  },
  apis: [] // All paths are defined inline above; no JSDoc scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
