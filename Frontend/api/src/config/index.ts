export const config = {
  port: 4000,
  get databaseUrl() { return process.env.DATABASE_URL || ''; },
  get jwtSecret() { return process.env.JWT_SECRET || 'default-secret-key'; },
  get jwtExpiresIn() { return process.env.JWT_EXPIRES_IN || '24h'; },
  get frontendUrl() { return process.env.FRONTEND_URL || 'http://localhost:3000'; },
  uploadDir: '/tmp/uploads',
};
