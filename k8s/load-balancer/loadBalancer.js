// based on https://medium.com/@ali.5991.jalali/create-your-proxy-server-and-load-balancer-using-node-js-b77d3a69a742

const http = require('http')
const proxy = require('http-proxy')

const proxyServer = proxy.createProxyServer()
const COOKIE_NAME = process.env.COOKIE_NAME || 'lb_target'
const targetList = (process.env.TARGETS || 'http://127.0.0.1:8132,http://127.0.0.1:8133')
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url.length > 0)

if (targetList.length === 0) {
  console.error('[loadBalancer] No targets provided. Set TARGETS env variable.')
  process.exit(1)
}

const targets = targetList.map((url) => ({ url, available: false }))
const port = parseInt(process.env.PORT, 10) || 8131

setInterval(async () => {
  for (let i = 0; i < targets.length; i++) {
    try {
      await fetch(targets[i].url, { signal: AbortSignal.timeout(1000) })
      if (!targets[i].available) {
        console.log(`${targets[i].url} available`)
      }
      targets[i].available = true
    } catch (e) {
      if (targets[i].available) {
        targets[i].available = false
        console.log(`${targets[i].url} unavailable`)
      }
    }
  }
}, 1000)

function parseCookies(header = '') {
  return Object.fromEntries((header.split(';') || []).map(c => {
    const [k, ...v] = c.split('=')
    return [k ? k.trim() : '', v.join('=').trim()]
  }).filter(([k]) => k))
}

function pickTargetFromCookies(cookies, activeTargets) {
  if (!cookies[COOKIE_NAME]) return null
  const desired = decodeURIComponent(cookies[COOKIE_NAME])
  return activeTargets.find(t => t.url === desired)?.url || null
}

const server = http.createServer((req, res) => {
  const activeTargets = targets.filter(t => t.available)
  if (activeTargets.length === 0) {
    res.writeHead(503 /* unavailable */, { "Content-Type": "text/plain" })
    res.write("No targets available!")
    res.end()
    return
  }

  // Simple cookie-based sticky option: if the client sent a cookie pointing
  // to a target and that target is still available, use it. Otherwise pick
  // a random available target and set a cookie so subsequent requests stick.
  const cookies = parseCookies(req.headers.cookie)
  let target = pickTargetFromCookies(cookies, activeTargets)
  if (!target) {
    target = activeTargets[(Math.floor(Math.random() * activeTargets.length))].url
    // set sticky cookie for subsequent HTTP requests (WebSocket clients often
    // perform an initial HTTP handshake which will receive this cookie)
    try {
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(target)}; Path=/; HttpOnly`)
    } catch (e) {
      // ignore if headers already sent
    }
  }

  console.log(`${req.url} -> ${target}`)
  proxyServer.web(req, res, { target })
})

// Handle websocket upgrade requests and proxy them to the correct target.
// We honor the same cookie-based sticky logic by reading the cookie on the
// upgrade request. If none present, we pick a random available target.
server.on('upgrade', (req, socket, head) => {
  const activeTargets = targets.filter(t => t.available)
  if (activeTargets.length === 0) {
    socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n')
    socket.destroy()
    return
  }

  const cookies = parseCookies(req.headers.cookie)
  let target = pickTargetFromCookies(cookies, activeTargets)
  if (!target) {
    target = activeTargets[(Math.floor(Math.random() * activeTargets.length))].url
  }

  console.log(`[upgrade] ${req.url} -> ${target}`)
  proxyServer.ws(req, socket, head, { target })
})

server.listen(port, () => {
  console.log(`Load balancer running (HTTP + WS) on port ${port}`)
})

// Error handling for proxy failures
proxyServer.on('error', (err, req, res) => {
  console.error('[proxy] error', err)
  try {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' })
    }
    res.end('Bad gateway')
  } catch (e) {
    // socket may be a raw socket for ws requests
    try { req.socket.destroy() } catch (e) { /* ignore */ }
  }
})
