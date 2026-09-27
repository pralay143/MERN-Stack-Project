// Lists every route registered on an Express 4 app, including routes in
// nested routers, as { method, path, allowedRoles }.

// Turns a router's mount regexp (e.g. /^\/api\/v1\/?(?=\/|$)/i) back into
// its path. Throws on anything unexpected so a silent miss can't happen.
function mountPath(layer) {
    if (layer.regexp.fast_slash) return ''
    const match = layer.regexp.source.match(/^\^(.*)\\\/\?\(\?=\\\/\|\$\)$/)
    const path = match && match[1].replace(/\\\//g, '/')
    if (!path || /[\\^$()[\]*+?]/.test(path)) throw new Error(`Cannot read mount path from ${layer.regexp}`)
    return path
}

function listRoutes(app) {
    const routes = []
    const walk = (stack, prefix) => {
        for (const layer of stack) {
            if (layer.route) {
                const handlers = layer.route.stack.map((l) => l.handle)
                const guard = handlers.find((h) => h.allowedRoles)
                for (const method of Object.keys(layer.route.methods)) {
                    routes.push({
                        method: method.toUpperCase(),
                        path: (prefix + layer.route.path).replace(/(.)\/$/, '$1'), // no trailing slash
                        allowedRoles: guard ? guard.allowedRoles : null,
                    })
                }
            } else if (layer.name === 'router') {
                walk(layer.handle.stack, prefix + mountPath(layer))
            }
        }
    }
    walk(app._router.stack, '')
    return routes
}

module.exports = { listRoutes }
