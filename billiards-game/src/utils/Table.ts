export function drawTable(ctx: CanvasRenderingContext2D) {
    const width = 800;
    const height = 400;

    // viền gỗ
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 0, width, height);

    // mặt bàn (nhỏ hơn)
    const padding = 30;
    ctx.fillStyle = "#0B6623";
    ctx.fillRect(padding, padding, width - padding * 2, height - padding * 2);

    // lỗ (6 cái)
    const pocketRadius = 15;

    const pockets = [
        [padding, padding],
        [width / 2, padding],
        [width - padding, padding],
        [padding, height - padding],
        [width / 2, height - padding],
        [width - padding, height - padding],
    ];

    ctx.fillStyle = "black";
    pockets.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    });
}