const fs = require('fs')
const {cv} = require('../dimension')
const drawQuestionMultiple =  async (canvas, bg, data, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    var {round_index, time, question} = data
    let {title, answers} = question
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
    ctx.fillStyle = '#ECAAAA';
    ctx.font = `${cv(40)}px SetoFont-SP`;
    ctx.fillText(round_index , cv(960), cv(50));

    ctx.font = `${cv(50)}px SetoFont-SP`;
    ctx.fillText(time , cv(1826), cv(77));


    ctx.fillStyle = '#707070';
    ctx.font = `${cv(45)}px SetoFont-SP`;
    ctx.fillText(title , cv(960), cv(120));

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${cv(42)}px SetoFont-SP`;
    answers.forEach((answer, index) => {
        console.log("Draw answer:", answer);
        ctx.fillStyle = '#707070'
        ctx.fillText(answer, cv(565), cv(540 + 100 * index));
    })



    if (genImg) {
        const name = `/generated/question_multiple_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}


module.exports = {
    drawQuestionMultiple
}