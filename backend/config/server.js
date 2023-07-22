module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('SERVER_URL', 'http://localhost:1337'),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'b858051ae037c037d5042a35ca090a18'),
    },
  },
});
