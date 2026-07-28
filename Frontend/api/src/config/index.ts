export const config = {
  port: 4000,
  databaseUrl: String(process.env.DATABASE_URL || ''),
  jwtSecret: String(process.env.JWT_SECRET || 'default-secret-key'),
  jwtExpiresIn: String(process.env.JWT_EXPIRES_IN || '24h'),
  frontendUrl: String(process.env.FRONTEND_URL || 'http://localhost:3000'),
  uploadDir: '/tmp/uploads',
};
