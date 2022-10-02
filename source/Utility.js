function loop(value, limit) {
    return (limit + value % limit) % limit
}

function randomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

export {
    loop,
    randomInt
}
