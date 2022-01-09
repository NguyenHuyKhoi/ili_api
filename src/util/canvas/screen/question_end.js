const fs = require('fs')
const sw = 1280
const sh = 720

const drawUserAnswers = async (ctx, answers, isLoading) => {
	const anchorX = [666, 666, 666, 666]
	const anchorY = [378, 462, 550, 632];
	[0,1,2,3].forEach((answer_index) => {
		let ax = anchorX[answer_index]
		let ay = anchorY[answer_index]

		if (isLoading) {
			ctx.fillStyle = '#fff'
			ctx.font = "20px Arial"
			ctx.fillText("Retrieve answers...", ax + 125, ay + 25)
		}
		else {
			let list = answers.filter((answer) => answer.answerIndex == answer_index)

			list.forEach((answer, i) => {
				if (i == 5) { //Draw others 
					let otherNums = list.length - 5
					ctx.fillStyle = '#fff'
					ctx.font = "24px Arial"
					ctx.fillText(`+ ${otherNums} others...`, ax + 60 + 90 * i, ay + 30)
					return
				}
				else if (i > 5) {
					return
				}
				let avatar = answer.avatarImg
				if (avatar) ctx.drawImage(avatar, ax + i * 90, ay + 0, 45, 45)
				ctx.fillStyle = '#fff'
				ctx.font = "18px Arial"
				ctx.fillText(answer.name, ax + 22 + 90 * i, ay + 60)
			})
		}
		
	})

}
const drawQuestionEnd = async (canvas, data, bg, layer, genImg = false) => {
	let ctx = canvas.getContext('2d')
	let w = canvas.width 
	let h = canvas.height

	let {round_index, time, question, userAnswers, isLoading} = data
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
	await drawUserAnswers(ctx, userAnswers, isLoading)
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