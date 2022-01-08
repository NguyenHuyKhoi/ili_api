const fs = require('fs')
const sw = 1280
const sh = 720

const drawSummary = (canvas, data, bg, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {title, description, time} = data
    ctx.clearRect(0, 0, w, h)
    //Draw initial
    if (bg) {
        ctx.drawImage(bg, 0, 0, w, h)
    }
    else {
        ctx.fillStyle = '#46178f';
        ctx.fillRect(0,0, w ,h )
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';

    ctx.font = "60px Arial";
    ctx.fillText(title , 640, 260);
    ctx.font = "30px Arial";
    ctx.fillText( description, 640, 330);
    ctx.font = "100px Arial";
    ctx.fillText(time , 640, 425);

    // For test
    if (genImg) {
        const name = `/generated/summary_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}

module.exports = {
    drawSummary
}