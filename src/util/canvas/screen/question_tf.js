const fs = require('fs')
const {cv} = require('../dimension')
const drawQuestionTF =  async (canvas, bg, data, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {round_index, time, question} = data
    let {title, answers, imageImg} = question
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
    ctx.fillText(time , cv(1825), cv(77));


    ctx.fillStyle = '#707070';
    ctx.font = `${cv(45)}px SetoFont-SP`;
    ctx.fillText(title , cv(960), cv(120));

    if (imageImg != null && imageImg != undefined) {
        ctx.drawImage(imageImg, 750, 270, 450, 250)
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${cv(56)}px SetoFont-SP`;
    answers.forEach((answer, index) => {
       
        ctx.fillStyle = '#707070'
        ctx.fillText(answer, cv(610), cv(620 + 170 * index));
    })


    if (genImg) {
        const name = `/generated/question_tf_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}


module.exports = {
    drawQuestionTF
}