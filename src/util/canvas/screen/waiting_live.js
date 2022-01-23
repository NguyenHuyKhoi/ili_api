const fs = require('fs')

const drawWaitingLive = async (canvas, bg, data, genImg = false) => {
    console.log("Draw waiting live  :", genImg);
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // //Draw initial
    if (bg) {
        console.log("Draw image");
        ctx.drawImage(bg, 0, 0, w, h)
    }
    else {
        ctx.fillStyle = '#46178f';
        ctx.fillRect(0,0, w ,h )
    }


    // For test
    if (genImg) {
        const name = `/generated/waiting_live_screen.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}

module.exports = {
    drawWaitingLive
}