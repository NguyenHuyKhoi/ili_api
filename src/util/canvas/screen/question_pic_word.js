const fs = require('fs')
const {cv} = require('../dimension')
const drawQuestionPicWord =  async (canvas, bg, data, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {round_index, time, question} = data
    let {title, correct_answer } = question
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

    var chars = correct_answer.split('')
    var len = chars.length

    ctx.fillStyle = '#ECAAAA';
    ctx.font = `${cv(100)}px SetoFont-SP`;
    console.log("Chars:", chars);
    chars.forEach((char, i) => {
        var px = 960 + (i- Math.floor(len / 2 ) + (len % 2 == 0 ? 0.5 : 0)) * (60 + 30)
        var py = 840
        ctx.fillText('?' , cv(px), cv(py));
    });
    if (genImg) {
        const name = `/generated/question_pic_word_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}


module.exports = {
    drawQuestionPicWord
}