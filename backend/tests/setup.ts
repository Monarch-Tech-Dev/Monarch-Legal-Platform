import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test setup
beforeAll(async () => {
  // Initialize test database connections if needed
});

afterAll(async () => {
  // Clean up test database connections
});

// Increase timeout for integration tests
jest.setTimeout(30000);