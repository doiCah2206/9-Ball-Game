var setBallPositions = function (a) {
    var l = new Array(),
        i = 15e3 * a.adjustmentScale,
        n = 0.05 + 0.05 * Math.random(),
        s = 1 + (0.05 + 0.05 * Math.random()),
        e = 1.732 + n,
        b = projectInfo.level;
    switch (
    (b > a.numLevels && (b = a.numLevels),
        1 == projectInfo.tutorial && (b = 100),
        (b = 15))
    ) {
        case 1:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)));
            break;
        case 2:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)),
                (l[4] = new Point(i + 2 * e * a.ballRadius, 0)));
            break;
        case 3:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)),
                (l[4] = new Point(
                    i + 2 * e * a.ballRadius,
                    2 * a.ballRadius * s,
                )),
                (l[5] = new Point(
                    i + 2 * e * a.ballRadius,
                    -2 * a.ballRadius * s,
                )),
                (l[6] = new Point(i + 2 * e * a.ballRadius, 0)));
            break;
        case 4:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)),
                (l[6] = new Point(i + 2 * e * a.ballRadius, 0)),
                (l[4] = new Point(
                    i + 2 * e * a.ballRadius,
                    2 * a.ballRadius * s,
                )),
                (l[5] = new Point(
                    i + 2 * e * a.ballRadius,
                    -2 * a.ballRadius * s,
                )),
                (l[7] = new Point(i + 3 * e * a.ballRadius, -a.ballRadius * s)),
                (l[8] = new Point(i + 3 * e * a.ballRadius, a.ballRadius * s)));
            break;
        case 5:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)),
                (l[9] = new Point(i + 2 * e * a.ballRadius, 0)),
                (l[4] = new Point(
                    i + 2 * e * a.ballRadius,
                    2 * a.ballRadius * s,
                )),
                (l[5] = new Point(
                    i + 2 * e * a.ballRadius,
                    -2 * a.ballRadius * s,
                )),
                (l[6] = new Point(i + 3 * e * a.ballRadius, a.ballRadius * s)),
                (l[7] = new Point(i + 3 * e * a.ballRadius, -a.ballRadius * s)),
                (l[8] = new Point(i + 4 * e * a.ballRadius, 0)));
            break;
        case 6:
            ((l[0] = new Point(-i, 0)),
                (l[1] = new Point(i, 0)),
                (l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s)),
                (l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s)),
                (l[9] = new Point(i + 2 * e * a.ballRadius, 0)),
                (l[4] = new Point(
                    i + 2 * e * a.ballRadius,
                    2 * a.ballRadius * s,
                )),
                (l[5] = new Point(
                    i + 2 * e * a.ballRadius,
                    -2 * a.ballRadius * s,
                )),
                (l[6] = new Point(i + 3 * e * a.ballRadius, a.ballRadius * s)),
                (l[7] = new Point(i + 3 * e * a.ballRadius, -a.ballRadius * s)),
                (l[8] = new Point(i + 4 * e * a.ballRadius, 0)));
            break;
        case 15:
            // 9-ball diamond rack
            // Row 1 (apex): bi 1
            l[1] = new Point(i, 0);

            // Row 2: bi 2, 3
            l[2] = new Point(i + e * a.ballRadius, a.ballRadius * s);
            l[3] = new Point(i + e * a.ballRadius, -a.ballRadius * s);

            // Row 3 (middle): bi 4, 9, 5
            l[4] = new Point(i + 2 * e * a.ballRadius, 2 * a.ballRadius * s);
            l[9] = new Point(i + 2 * e * a.ballRadius, 0);  // bi 9 ở giữa
            l[5] = new Point(i + 2 * e * a.ballRadius, -2 * a.ballRadius * s);

            // Row 4: bi 6, 7
            l[6] = new Point(i + 3 * e * a.ballRadius, a.ballRadius * s);
            l[7] = new Point(i + 3 * e * a.ballRadius, -a.ballRadius * s);

            // Row 5 (back): bi 8
            l[8] = new Point(i + 4 * e * a.ballRadius, 0);

            // Cue ball
            l[0] = new Point(-i, 0);
            break;
        case 100:
            ((l[0] = new Point(-i, 0)), (l[1] = new Point(i + 1e4, -1e4)));
            break;
    }
    return l;
};
