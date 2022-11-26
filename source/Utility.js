function loop(value, limit) {
    return (limit + value % limit) % limit
}

function randomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

function compareArrays(a, b) {
    if (a === b) return true

    if (a == null || b == null) return false

    if (a.length !== b.length) return false
  
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false
    }

    return true
}

function createDiff(a, b) {
    const diff = {}

    for (const key in a) {
        if (Array.isArray(a[key])) {
            if (!compareArrays(a[key], b[key])) {
                diff[key] = b[key]
            }

            continue
        }

        if (a[key] !== b[key] && b[key] !== undefined) {
            diff[key] = b[key]
        }
    }

    return diff
}

function removeSingleItemFromArray(array, item) {
    const index = array.indexOf(item)

    if (index !== -1) {
        array.splice(index, 1)
    }

    return array
}

export {
    compareArrays,
    createDiff,
    loop,
    randomInt,
    removeSingleItemFromArray
}
