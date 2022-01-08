const fs = require('fs')
const sw = 1280
const sh = 720

const drawUserAnswers = (ctx, answers, avatar) => {
	const anchorX = [666, 666, 666, 666]
	const anchorY = [378, 462, 550, 632];
	[0,1,2,3].forEach((answer_index) => {
		let ax = anchorX[answer_index]
		let ay = anchorY[answer_index]
		answers
			.filter((answer) => answer.answerIndex == answer_index)
			.forEach((answer, i) => {
				if (i > 5) return
				ctx.drawImage(avatar, ax + i * 75, ay + 0, 50, 50)
				ctx.fillStyle = '#fff'
				ctx.font = "12px Arial"
				ctx.fillText(answer.name, ax + 25 + 75 * i, ay + 60)
			})
	})

}
const drawQuestionEnd = (canvas, data, bg, layer, avatar, genImg = false) => {
	let ctx = canvas.getContext('2d')
	let w = canvas.width 
	let h = canvas.height

	let {round_index, time, question, userAnswers} = data
	let {title, answers, correct_answers} = question

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
	ctx.fillText(round_index , 110, 30);
	ctx.fillText('Show leader board in ' + time , 1130, 30 );

	ctx.fillStyle = '#fff';
	ctx.font = "48px Arial";
	ctx.fillText(title , 640, 210);
	ctx.fillText(answers[0], 325, 410)
	ctx.fillText(answers[1], 325, 495)
	ctx.fillText(answers[2], 325, 575)
	ctx.fillText(answers[3], 325, 660)


	// Filter user answers: 
	drawUserAnswers(ctx, userAnswers, avatar)
	if (genImg) {
		const name = `/generated/question_end_screen_${time}.jpeg`
		const out = fs.createWriteStream(__dirname + name)
		const stream = canvas.createJPEGStream()
		stream.pipe(out)
		out.on('finish', () =>  console.log('The JPEG file was created.'))
	}
	return canvas
}


module.exports = {
    drawQuestionEnd
}