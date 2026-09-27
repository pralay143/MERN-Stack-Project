// Fails the test if a "password" key appears anywhere in a response body,
// including inside nested and populated objects.
function findPasswordPaths(value, path = 'body') {
    if (Array.isArray(value)) return value.flatMap((v, i) => findPasswordPaths(v, `${path}[${i}]`))
    if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([key, v]) =>
            key.toLowerCase() === 'password' ? [`${path}.${key}`] : findPasswordPaths(v, `${path}.${key}`)
        )
    }
    return []
}

function expectNoPassword(res) {
    expect(findPasswordPaths(res.body)).toEqual([])
}

module.exports = { expectNoPassword }
