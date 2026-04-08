module.exports = {
  apps: [{
    name: 'nova-backend',
    script: 'venv/bin/uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/ubuntu/Nova-Pass-Generator/backend',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/error.log',
    out_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/out.log',
    log_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/combined.log',
    time: true
  }]
};
