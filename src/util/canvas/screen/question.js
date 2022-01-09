const fs = require('fs')

const drawQuestion =  async (canvas, data, bg, layer, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {round_index, time, question} = data
    let {title, answers} = question

    ctx.clearRect(0, 0, w, h)

    //Draw initial
    if (bg) {
        ctx.drawImage(bg, 0, 0, w, h)
    }
    else {
        ctx.fillStyle = '#46178f';
        ctx.fillRect(0,0, w ,h )
    }

    if (layer) {
        ctx.drawImage(layer, 0, 0, w, h)
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';

    ctx.font = "22px Arial";
    ctx.fillText(round_index , 80, 30);
    ctx.font = "45px Arial";
    ctx.fillText(time , 640, 70);
    ctx.font = "45px Arial";
    ctx.fillText(title , 640, 300);

    ctx.font = "50px Arial";
    ctx.fillStyle = '#434343'
    ctx.fillText(answers[0] , 325, 525);
    ctx.fillText(answers[1] , 950, 525);
    ctx.fillText(answers[2] , 950, 640);
    ctx.fillText(answers[3] , 325, 640);


    if (genImg) {
        const name = `/generated/question_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}


module.exports = {
    drawQuestion
}