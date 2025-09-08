export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Dance Platform API',
    description: 'REST API documentation for the Dance Platform admin panel',
    version: '2.0.0',
    contact: {
      name: 'Dance Platform Admin',
      email: 'admin@danceplatform.com'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://danncelink.vercel.app' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
    }
  ],
  tags: [
    { name: 'Stats', description: 'Dashboard statistics' },
    { name: 'Users', description: 'User management' },
    { name: 'Classes', description: 'Class management' },
    { name: 'Events', description: 'Event management' },
    { name: 'Venues', description: 'Venue management' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Transactions', description: 'Transaction management' },
    { name: 'Instructors', description: 'Instructor management' },
    { name: 'Dance Styles', description: 'Dance style management' },
    { name: 'Pricing', description: 'Pricing management' }
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
          phone: { type: 'string', example: '+1234567890' },
          role: { type: 'string', enum: ['Admin', 'Instructor', 'Student'], example: 'Student' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Class: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Beginner Salsa' },
          description: { type: 'string', example: 'Learn the basics of Salsa dancing' },
          duration: { type: 'integer', example: 60 },
          capacity: { type: 'integer', example: 20 },
          price: { type: 'number', format: 'decimal', example: 25.00 },
          level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'], example: 'Beginner' },
          isActive: { type: 'boolean', example: true },
          venueId: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Salsa Night' },
          description: { type: 'string', example: 'Join us for a fun night of Salsa dancing' },
          startDateTime: { type: 'string', format: 'date-time' },
          endDateTime: { type: 'string', format: 'date-time' },
          capacity: { type: 'integer', example: 50 },
          price: { type: 'number', format: 'decimal', example: 15.00 },
          isActive: { type: 'boolean', example: true },
          venueId: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Venue: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Main Studio' },
          address: { type: 'string', example: '123 Dance St, City, State 12345' },
          capacity: { type: 'integer', example: 50 },
          amenities: { type: 'string', example: 'Sound system, mirrors, air conditioning' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          classId: { type: 'integer', nullable: true, example: 1 },
          eventId: { type: 'integer', nullable: true, example: null },
          status: { type: 'string', enum: ['Confirmed', 'Cancelled', 'Pending'], example: 'Confirmed' },
          bookingDate: { type: 'string', format: 'date-time' },
          totalAmount: { type: 'number', format: 'decimal', example: 25.00 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Resource not found' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Operation completed successfully' }
        }
      },
      Stats: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer', example: 150 },
          totalClasses: { type: 'integer', example: 25 },
          totalEvents: { type: 'integer', example: 10 },
          totalBookings: { type: 'integer', example: 200 },
          totalRevenue: { type: 'number', format: 'decimal', example: 5000.00 },
          recentBookings: { type: 'integer', example: 15 },
          activeUsers: { type: 'integer', example: 120 }
        }
      }
    },
    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized access',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Success: {
        description: 'Operation successful',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Success' }
          }
        }
      }
    }
  },
  paths: {
    '/api/admin/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Get dashboard statistics',
        description: 'Retrieve comprehensive statistics for the admin dashboard',
        responses: {
          200: {
            description: 'Statistics retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Stats' }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of all users in the system',
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Create a new user in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'role'],
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  role: { type: 'string', enum: ['Admin', 'Instructor', 'Student'], example: 'Student' },
                  password: { type: 'string', minLength: 6, example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update an existing user',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  role: { type: 'string', enum: ['Admin', 'Instructor', 'Student'], example: 'Student' },
                  isActive: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete a user from the system',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: { $ref: '#/components/responses/Success' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/classes': {
      get: {
        tags: ['Classes'],
        summary: 'Get all classes',
        description: 'Retrieve a list of all classes',
        responses: {
          200: {
            description: 'Classes retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Class' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Classes'],
        summary: 'Create a new class',
        description: 'Create a new class in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'duration', 'capacity', 'price', 'level', 'venueId'],
                properties: {
                  name: { type: 'string', example: 'Beginner Salsa' },
                  description: { type: 'string', example: 'Learn the basics of Salsa dancing' },
                  duration: { type: 'integer', example: 60 },
                  capacity: { type: 'integer', example: 20 },
                  price: { type: 'number', format: 'decimal', example: 25.00 },
                  level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'], example: 'Beginner' },
                  venueId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Class created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Class' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/classes/{id}': {
      get: {
        tags: ['Classes'],
        summary: 'Get class by ID',
        description: 'Retrieve a specific class by its ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: {
            description: 'Class retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Class' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      put: {
        tags: ['Classes'],
        summary: 'Update class',
        description: 'Update an existing class',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Beginner Salsa' },
                  description: { type: 'string', example: 'Learn the basics of Salsa dancing' },
                  duration: { type: 'integer', example: 60 },
                  capacity: { type: 'integer', example: 20 },
                  price: { type: 'number', format: 'decimal', example: 25.00 },
                  level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'], example: 'Beginner' },
                  isActive: { type: 'boolean', example: true },
                  venueId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Class updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Class' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      delete: {
        tags: ['Classes'],
        summary: 'Delete class',
        description: 'Delete a class from the system',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: { $ref: '#/components/responses/Success' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/events': {
      get: {
        tags: ['Events'],
        summary: 'Get all events',
        description: 'Retrieve a list of all events',
        responses: {
          200: {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'Create a new event in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'startDateTime', 'endDateTime', 'capacity', 'price', 'venueId'],
                properties: {
                  title: { type: 'string', example: 'Salsa Night' },
                  description: { type: 'string', example: 'Join us for a fun night of Salsa dancing' },
                  startDateTime: { type: 'string', format: 'date-time', example: '2024-01-15T19:00:00Z' },
                  endDateTime: { type: 'string', format: 'date-time', example: '2024-01-15T22:00:00Z' },
                  capacity: { type: 'integer', example: 50 },
                  price: { type: 'number', format: 'decimal', example: 15.00 },
                  venueId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Event created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get event by ID',
        description: 'Retrieve a specific event by its ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: {
            description: 'Event retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      put: {
        tags: ['Events'],
        summary: 'Update event',
        description: 'Update an existing event',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Salsa Night' },
                  description: { type: 'string', example: 'Join us for a fun night of Salsa dancing' },
                  startDateTime: { type: 'string', format: 'date-time', example: '2024-01-15T19:00:00Z' },
                  endDateTime: { type: 'string', format: 'date-time', example: '2024-01-15T22:00:00Z' },
                  capacity: { type: 'integer', example: 50 },
                  price: { type: 'number', format: 'decimal', example: 15.00 },
                  isActive: { type: 'boolean', example: true },
                  venueId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Event updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      delete: {
        tags: ['Events'],
        summary: 'Delete event',
        description: 'Delete an event from the system',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: { $ref: '#/components/responses/Success' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/venues': {
      get: {
        tags: ['Venues'],
        summary: 'Get all venues',
        description: 'Retrieve a list of all venues',
        responses: {
          200: {
            description: 'Venues retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Venue' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Venues'],
        summary: 'Create a new venue',
        description: 'Create a new venue in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'address', 'capacity'],
                properties: {
                  name: { type: 'string', example: 'Main Studio' },
                  address: { type: 'string', example: '123 Dance St, City, State 12345' },
                  capacity: { type: 'integer', example: 50 },
                  amenities: { type: 'string', example: 'Sound system, mirrors, air conditioning' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Venue created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Venue' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/venues/{id}': {
      get: {
        tags: ['Venues'],
        summary: 'Get venue by ID',
        description: 'Retrieve a specific venue by its ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: {
            description: 'Venue retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Venue' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      put: {
        tags: ['Venues'],
        summary: 'Update venue',
        description: 'Update an existing venue',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Main Studio' },
                  address: { type: 'string', example: '123 Dance St, City, State 12345' },
                  capacity: { type: 'integer', example: 50 },
                  amenities: { type: 'string', example: 'Sound system, mirrors, air conditioning' },
                  isActive: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Venue updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Venue' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      delete: {
        tags: ['Venues'],
        summary: 'Delete venue',
        description: 'Delete a venue from the system',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: { $ref: '#/components/responses/Success' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get all bookings',
        description: 'Retrieve a list of all bookings',
        responses: {
          200: {
            description: 'Bookings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Booking' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a new booking',
        description: 'Create a new booking in the system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'totalAmount'],
                properties: {
                  userId: { type: 'integer', example: 1 },
                  classId: { type: 'integer', nullable: true, example: 1 },
                  eventId: { type: 'integer', nullable: true, example: null },
                  totalAmount: { type: 'number', format: 'decimal', example: 25.00 },
                  status: { type: 'string', enum: ['Confirmed', 'Cancelled', 'Pending'], example: 'Confirmed' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Booking created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/admin/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking by ID',
        description: 'Retrieve a specific booking by its ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: {
            description: 'Booking retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      put: {
        tags: ['Bookings'],
        summary: 'Update booking',
        description: 'Update an existing booking',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['Confirmed', 'Cancelled', 'Pending'], example: 'Confirmed' },
                  totalAmount: { type: 'number', format: 'decimal', example: 25.00 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Booking updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Delete booking',
        description: 'Delete a booking from the system',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            example: 1
          }
        ],
        responses: {
          200: { $ref: '#/components/responses/Success' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/BadRequest' }
        }
      }
    }
  }
};
