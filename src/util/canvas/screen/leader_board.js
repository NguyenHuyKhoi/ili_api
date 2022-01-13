const fs = require('fs')


const drawPlayers = async (ctx, players) => {
    const anchorTopX = [325, 7, 652]
    const anchorTopY = [108, 189, 190]

    const anchorOtherX =  7
    const anchorOtherY = 330

    players.forEach((player, index) => {
        if (index >= 12) return
        var ax, ay, w, h
        if (index < 3) {
            ax = anchorTopX[index]
            ay = anchorTopY[index]
            w = 600
            h = 80
        }
        else {
            ax = anchorOtherX + (index - 3 ) % 3 * 425
            ay = anchorOtherY + Math.floor((index - 3) / 3) * 120
            w = 400
            h = 80
        }
        let avatar = player.avatarImg
        if (avatar) ctx.drawImage(avatar, ax + 30, ay + 26, 45, 45)

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#696969'
        ctx.font = '20px Arial'
        ctx.fillText(player.username, ax + w / 2, ay + (h + 16 ) / 2)

        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = players < 3 ? '#86AB9A' : '#5D58A1'
        ctx.font = '35px Arial'
        ctx.fillText(player.score, ax + w - 10, ay + (h + 16 ) / 2)
    })
}

const drawLeaderBoard = (canvas, data, bg, layer, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {players, time} = data

    ctx.clearRect(0, 0, w, h)

    //Draw initial
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
    ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillStyle = '#fff'
    ctx.font = "22px Arial"
	ctx.fillText('Next round in ' + time , 1150, 30 )

    drawPlayers(ctx, players)
    
    if (genImg) {
        const name = `/generated/leader_board_${time}.jpeg`
        const out = fs.createWriteStream(__dirname + name)
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The JPEG file was created.'))
    }
    return canvas
}


module.exports = {
    drawLeaderBoard
}