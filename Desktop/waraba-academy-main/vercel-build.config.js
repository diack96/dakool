module.exports = {
  version: 2,
  builds: [
    {
      src: 'package.json',
      use: '@vercel/next',
      config: {
        nodeVersion: '22.x'
      }
    }
  ],
  routes: [
    {
      src: '/api/(.*)',
      dest: '/api/$1'
    },
    {
      src: '/(.*)',
      dest: '/$1'
    }
  ],
  env: {
    NODE_ENV: 'production'
  },
  functions: {
    'src/app/api/**/*.ts': {
      runtime: 'nodejs22.x'
    }
  },
  build: {
    env: {
      NODE_VERSION: '22'
    }
  },
  installCommand: 'npm install && npm run postinstall',
  buildCommand: 'npm run build',
  regions: ['iad1'],
  framework: 'nextjs'
}; 