const fs = require('fs')
const {cv} = require('../dimension')
const { drawCircleImg } = require('./helper');
const drawPlayers = async (ctx, players) => {
    const anchorTopX = [625, 215, 1055]
    const anchorTopY = [180, 330, 360]

    const anchorOtherX =  135
    const anchorOtherY = 570

    players.forEach((player, index) => {
        if (index >= 12) return
        const {username, score, avatarImg} = player
        var ax, ay, w, h
        if (index < 3) {
            var color = ['#EBD852','#BCBCBC','#D0630A'][index]
            ax = anchorTopX[index]
            ay = anchorTopY[index]
            w = 650
            h = 120
            if (avatarImg) ctx = drawCircleImg(ctx, avatarImg, cv(ax+20), cv(ay+15), cv(88))
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = color
            ctx.font = `${cv(50)}px SetoFont-SP`;
            ctx.fillText(username, cv(ax + 135), cv(ay + h / 2))
    
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = color
            ctx.font = `${cv(60)}px SetoFont-SP`;
            ctx.fillText(score, cv(ax + w - 15), cv(ay + h / 2))
        }
        else {
            ax = anchorOtherX + (index - 3 ) % 3 * ( 500 + 75)
            ay = anchorOtherY + Math.floor((index - 3) / 3) * ( 120 + 50)
            w = 500
            h = 120
            if (avatarImg) ctx = drawCircleImg(ctx, avatarImg, cv(ax+20), cv(ay+15), cv(88))
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#5F5F5F'
            ctx.font = `${cv(40)}px SetoFont-SP`;
            ctx.fillText(username, cv(ax + 135), cv(ay + h / 2))
    
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#5F5F5F'
            ctx.font = `${cv(50)}px SetoFont-SP`;
            ctx.fillText(score, cv(ax + w - 15), cv(ay + h / 2))
        }
        

      
    })
}

const drawLeaderBoard = async (canvas, bg, data, genImg = false) => {
    let ctx = canvas.getContext('2d')
    let w = canvas.width 
    let h = canvas.height

    let {players, time} = data
    time = time + 's'
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

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ECAAAA';
    ctx.font = `${cv(50)}px SetoFont-SP`;
    ctx.fillText(time , cv(1837), cv(74));
    
    await drawPlayers(ctx, players)
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