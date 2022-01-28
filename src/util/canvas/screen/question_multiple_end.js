const fs = require('fs')
const {cv} = require('../dimension');
const { drawCircleImg } = require('./helper');

const drawUserAnswers = async (ctx, answers) => {
	const anchorX = [100, 1580];
	const anchorY = [200, 200];

	// Top 10 early correct answer
	answers.forEach((answer, i) => {
			var {earnScore, username, avatarImg} = answer
			earnScore = '+' + earnScore
			var ax, ay
			if (i < 5) { //Draw others 
				ax = anchorX[0]
				ay = anchorY[0] + i * 140
			}
			else {
				ax = anchorX[1] 
				ay = anchorY[1] + (i - 5) * 140
			}
			if (avatarImg) ctx = drawCircleImg(ctx, avatarImg, cv(ax+30), cv(ay+23), cv(56))
			// ctx.drawImage(avatarImg, cv(ax + 50), cv(ay + 50), 56, 56)

		 	ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#ECAAAA';
			ctx.font = `${cv(32)}px SetoFont-SP`;
			ctx.fillText(earnScore, cv(ax + 160), cv(ay + 50));

			ctx.fillStyle = '#5F5F5F';
			ctx.font = `${cv(26)}px SetoFont-SP`;
			ctx.fillText(username, cv(ax + 120), cv(ay + 92));
		})
}

const drawQuestionMultipleEnd = async (canvas, bg, data, genImg = false) => {
	let ctx = canvas.getContext('2d')
	let w = canvas.width 
	let h = canvas.height

	var {round_index, time, question, userAnswers, isLoading, answer_counts} = data
	let {title, answers, correct_answer, imageImg} = question
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
        ctx.drawImage(imageImg, 790, 260, 350, 190)
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${cv(42)}px SetoFont-SP`;
    answers.forEach((answer, index) => {
        ctx.fillStyle = correct_answer == index ? '#ECAAAA' : '#707070'
        ctx.fillText(answer, cv(565), cv(540 + 100 * index));
    })

    ctx.font = `${cv(26)}px SetoFont-SP`;
    answer_counts.forEach((item, index) => {
		var label = item.count + ' players'
        ctx.fillStyle = correct_answer == index ? '#ECAAAA' : '#707070'
        ctx.fillText(label , cv(1300), cv(540 + 100 * index));
    })



	// Filter user answers: 
	if (isLoading) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#707070';
		ctx.font = `${cv(40)}px SetoFont-SP`;
		ctx.fillText('Retrieve user answer...' , cv(960), cv(920));
	}
	else {
		await drawUserAnswers(ctx, userAnswers)
	}

	if (genImg) {
		const name = `/generated/question_multiple_end_screen_${time}.jpeg`
		const out = fs.createWriteStream(__dirname + name)
		const stream = canvas.createJPEGStream()
		stream.pipe(out)
		out.on('finish', () =>  console.log('The JPEG file was created.'))
	}
	return canvas
}


module.exports = {
    drawQuestionMultipleEnd
}