module.exports = {
  apps: [
    {
      name: 'heartbeat-text-converter',
      cwd: __dirname,
      script: '.output/server/index.mjs',
      interpreter: 'node',
      env_file: '.env',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3020,
        NITRO_PORT: 3020,
      },
    },
  ],
}
