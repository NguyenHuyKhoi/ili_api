const drawCircleImg = (ctx, img, px, py, size) => {
    ctx.save()
    ctx.beginPath();
    ctx.arc(px + size / 2, py + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, px, py, size, size);

    ctx.beginPath();
    ctx.arc(px, py, size / 2, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.closePath();
    ctx.restore()
    return ctx
}

module.exports = {
    drawCircleImg
}