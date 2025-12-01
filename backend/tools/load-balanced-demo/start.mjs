#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')
const outputEntry = path.join(projectRoot, '.output', 'server', 'index.mjs')
const npmCliPath = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')

const servers = [
  {
    label: 'api-1',
    env: {
      PORT: '8132',
      SOCKET_PORT: '9132',
      NUXT_PUBLIC_SITE_URL: 'http://127.0.0.1:8131',
      NUXT_PUBLIC_SOCKET_URL: 'http://127.0.0.1:9131'
    }
  },
  {
    label: 'api-2',
    env: {
      PORT: '8133',
      SOCKET_PORT: '9133',
      NUXT_PUBLIC_SITE_URL: 'http://127.0.0.1:8131',
      NUXT_PUBLIC_SOCKET_URL: 'http://127.0.0.1:9131'
    }
  }
]

const processes = []

async function buildProject(envOverrides = {}) {
  console.log('[demo] Building project (`npm run build`)...')
  await runCommand(process.execPath, [npmCliPath, 'run', 'build'], {
    cwd: projectRoot,
    env: envOverrides,
    label: 'build'
  })
}

function runCommand(command, args, { cwd, env = {}, label }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env
      },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    const tag = label ? `[${label}]` : ''

    child.stdout.on('data', (data) => {
      process.stdout.write(`${tag} ${data}`)
    })

    child.stderr.on('data', (data) => {
      process.stderr.write(`${tag} ${data}`)
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${label || command} exited with code ${code}`))
      }
    })
  })
}

function spawnPersistent(command, args, { cwd, env = {}, label }) {
  const child = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      ...env
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  const tag = label ? `[${label}]` : ''

  child.stdout.on('data', (data) => {
    process.stdout.write(`${tag} ${data}`)
  })

  child.stderr.on('data', (data) => {
    process.stderr.write(`${tag} ${data}`)
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${label}] exited with signal ${signal}`)
    } else {
      console.log(`[${label}] exited with code ${code}`)
    }
  })

  processes.push(child)
}

async function start() {
  const buildEnv = {
    NUXT_PUBLIC_SITE_URL: 'http://127.0.0.1:8131',
    NUXT_PUBLIC_SOCKET_URL: 'http://127.0.0.1:9131'
  }
  await buildProject(buildEnv)

  console.log('[demo] Starting load balancers...')
  const loadBalancerPath = path.resolve(projectRoot, '..', 'k8s', 'load-balancer', 'loadBalancer.js')

  spawnPersistent(process.execPath, [loadBalancerPath], {
    cwd: projectRoot,
    env: {
      TARGETS: 'http://127.0.0.1:8132,http://127.0.0.1:8133',
      PORT: '8131',
      COOKIE_NAME: 'lb_http_target'
    },
    label: 'lb-http'
  })

  spawnPersistent(process.execPath, [loadBalancerPath], {
    cwd: projectRoot,
    env: {
      TARGETS: 'http://127.0.0.1:9132,http://127.0.0.1:9133',
      PORT: '9131',
      COOKIE_NAME: 'lb_socket_target'
    },
    label: 'lb-socket'
  })

  console.log('[demo] Starting backend replicas...')
  for (const server of servers) {
    spawnPersistent(process.execPath, [outputEntry], {
      cwd: projectRoot,
      env: {
        ...server.env,
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/smoothie_order_system',
        NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD || 'dev-session-secret-change-in-production-min-32-chars',
        NODE_ENV: 'production'
      },
      label: server.label
    })
  }

  console.log('\n[demo] Load-balanced demo running!')
  console.log('  App entry point:      http://127.0.0.1:8131')
  console.log('  Socket entry point:   http://127.0.0.1:9131')
  console.log('Use Ctrl+C to stop all processes.')
}

function cleanup() {
  for (const child of processes) {
    try {
      child.kill('SIGINT')
    } catch (err) {
      // ignore
    }
  }
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

start().catch((err) => {
  console.error('[demo] Failed to start demo', err)
  cleanup()
})
