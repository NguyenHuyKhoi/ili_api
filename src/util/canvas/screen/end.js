const fs = require('fs')
const {cv} = require('../dimension')

const drawEnd = async (canvas, bg, data, genImg = false) => {
    
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    var {title, description, time} = data
    title = 'Mini game: ' + title
    time = time + 's'
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

    ctx.fillStyle = '#707070';
    ctx.font = `${cv(80)}px SetoFont-SP`;
    ctx.fillText(title , cv(1000), cv(180));
    
    ctx.fillStyle = '#ECAAAA';
    ctx.font = `${cv(160)}px SetoFont-SP`;
    ctx.fillText(time , cv(1245), cv(780));

    // For test
    if (genImg) {
        const name = `/generated/end_screen.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}

module.exports = {
    drawEnd
}