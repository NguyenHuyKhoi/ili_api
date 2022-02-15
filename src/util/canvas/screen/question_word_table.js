const fs = require('fs')
const {cv} = require('../dimension')
const { drawCircleImg } = require('./helper');
const drawUserAnswers = async (ctx, answers, correct_answers, open_word_states) => {
	const anchorX = [80, 1380];
	const anchorY = [250, 250];

	open_word_states.forEach((item, i) => {
            if (i >= 12 ) {
                return
            }
			var ax, ay
			if (i < 6) { //Draw others 
				ax = anchorX[0]
				ay = anchorY[0] + i * 100
			}
			else {
				ax = anchorX[1] 
				ay = anchorY[1] + (i - 6) * 100
			}
            var keyword = correct_answers[i]
            if (item == 1) { // solve by someone 
                var userAnswer = answers.find((item) => item.keywordIndex == i)
                if (userAnswer == null) {
                    console.log("Error keyword is solve by no one?");
                    return
                }
                var {earnScore, username, avatarImg, keywordIndex} = userAnswer
                earnScore = '+' + earnScore
                if (avatarImg) ctx = drawCircleImg(ctx, avatarImg, cv(ax+10), cv(ay+10), cv(50))
                // ctx.drawImage(avatarImg, cv(ax + 50), cv(ay + 50), 56, 56)
    
                 ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#5F5F5F';
                ctx.font = `${cv(26)}px SetoFont-SP`;
                ctx.fillText(username, cv(ax + 75), cv(ay + 35));
    
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ECAAAA';
                ctx.font = `${cv(30)}px SetoFont-SP`;
                ctx.fillText(keyword, cv(ax + 460 - 20), cv(ay + 35));
                console.log("Index is solved", i);
            }
            else {
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ECAAAA';
                ctx.font = `${cv(30)}px SetoFont-SP`;

                var hideStr = ''
                Array.from(Array(keyword.length)).forEach(() => hideStr += '?')
                ctx.fillText(hideStr, cv(ax + 460 - 20), cv(ay + 35));
            }
		})

}
const drawCharTable = async (ctx, table, correct_answers, open_word_states) => {

    var px = 633
    var py = 213
    var size = Math.floor(Math.sqrt(table.length))
    var cellSize = 50
    var marginSize = 5
    table.forEach((item, index) => {
        var {char, color} = item
        var row = Math.floor(index / size)
        var col = index % size

        // if (row >= 12 || col >= 12) {
        //     return
        // }
        var x = px + (row ) * (cellSize + marginSize)
        var y = py + (col ) * (cellSize + marginSize)

        
        if (item.wordParent != undefined) {
            let idx = correct_answers.findIndex((keyword) => keyword == item.wordParent)
            if (idx != -1 && open_word_states[idx] == 1) {
                ctx.fillStyle = `${color}`
                ctx.fillRect(cv(x), cv(y), cv(cellSize), cv(cellSize))
            }

        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.font = `${cv(32)}px SetoFont-SP`;
        ctx.fillText(char, cv(x + cellSize / 2), cv(y + cellSize / 2))
    });
}

const drawQuestionWordTable =  async (canvas, bg, data, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {round_index, time, question, open_word_states, userAnswers} = data
    let {title, char_table, correct_answers} = question
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
    ctx.fillText(round_index , cv(960), cv(80));

    ctx.font = `${cv(50)}px SetoFont-SP`;
    ctx.fillText(time , cv(1825), cv(77));


    ctx.fillStyle = '#707070';
    ctx.font = `${cv(45)}px SetoFont-SP`;
    ctx.fillText(title , cv(960), cv(140));

    await drawCharTable(ctx, char_table, correct_answers, open_word_states )
    console.log("Usr answers:", userAnswers);
    await drawUserAnswers(ctx, userAnswers, correct_answers, open_word_states)

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${cv(35)}px SetoFont-SP`;
    ctx.fillStyle = '#707070';
    ctx.fillText('Only first person comment each keyword is scored.', cv(960), cv(1050) )
    if (genImg) {
        const name = `/generated/question_word_table_screen_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }

    return canvas
}


module.exports = {
    drawQuestionWordTable
}