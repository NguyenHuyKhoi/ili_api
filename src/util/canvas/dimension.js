const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT =  1080

const CANVAS_WIDTH = 1920
const CANVAS_HEIGHT = 1080
const cv = (a) => {
    return Math.floor(a / DESIGN_WIDTH * CANVAS_WIDTH)
}

module.exports = {
    cv,
    CANVAS_HEIGHT,
    CANVAS_WIDTH
}