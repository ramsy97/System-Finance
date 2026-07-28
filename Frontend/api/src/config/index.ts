const env = process.env;

export const config = {
  port: 4000,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  frontendUrl: env.FRONTEND_URL,
  uploadDir: '/tmp/uploads',
};
