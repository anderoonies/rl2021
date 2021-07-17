import {CELL_FLAGS, CELL_WIDTH, DARKNESS_MAX} from './constants';
import {AnnotatedCell, CellColorLayer, Grid, LightSource, RGBColor} from './types';

const gridFromDimensions = require('./utils').gridFromDimensions;
const randomRange = require('./utils').randomRange;

// http://www.roguebasin.com/index.php?title=FOV_using_recursive_shadowcasting
//              Shared
//             edge by
//  Shared     1 & 2      Shared
//  edge by\      |      /edge by
//  1 & 8   \     |     / 2 & 3
//           \1111|2222/
//           8\111|222/3
//           88\11|22/33
//           888\1|2/333
//  Shared   8888\|/3333  Shared
//  edge by-------@-------edge by
//  7 & 8    7777/|\4444  3 & 4
//           777/6|5\444
//           77/66|55\44
//           7/666|555\4
//           /6666|5555\
//  Shared  /     |     \ Shared
//  edge by/      |      \edge by
//  6 & 7      Shared     4 & 5
//             edge by
//             5 & 6
//

const octantTransforms = [
    {xx: 1, xy: 0, yx: 0, yy: 1},
    {xx: 0, xy: 1, yx: 1, yy: 0},
    {xx: 0, xy: -1, yx: 1, yy: 0},
    {xx: -1, xy: 0, yx: 0, yy: 1},
    {xx: -1, xy: 0, yx: 0, yy: -1},
    {xx: 0, xy: -1, yx: -1, yy: 0},
    {xx: 0, xy: 1, yx: -1, yy: 0},
    {xx: 1, xy: 0, yx: 0, yy: -1},
];

const cast = ({
    startColumn,
    leftViewSlope,
    rightViewSlope,
    transform,
    row,
    col,
    dungeon,
    light,
}: {
    startColumn: number;
    leftViewSlope: number;
    rightViewSlope: number;
    transform: {xx: number; xy: number; yx: number; yy: number};
    row: number;
    col: number;
    dungeon: Grid<AnnotatedCell>;
    light: Grid<0 | 1>;
}): void => {
    let currentCol;
    let previousWasBlocked = false;
    let savedRightSlope = -1;
    const width = dungeon[0].length;
    const height = dungeon.length;
    for (let currentCol = startColumn; currentCol <= width; currentCol++) {
        let xc = currentCol;
        for (let yc = currentCol; yc >= 0; yc--) {
            let gridX = col + xc * transform.xx + yc * transform.xy;
            let gridY = row + xc * transform.yx + yc * transform.yy;

            if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
                continue;
            }

            // compute slopes to the corners of the current block, using to-left and bottom-right
            let leftBlockSlope = (yc + CELL_WIDTH / 2) / (xc - CELL_WIDTH / 2);
            let rightBlockSlope = (yc - CELL_WIDTH / 2) / (xc + CELL_WIDTH / 2);

            if (rightBlockSlope > leftViewSlope) {
                continue;
            } else if (leftBlockSlope < rightViewSlope) {
                break;
            }

            light[gridY][gridX] = 1;
            let currentlyBlocked;
            currentlyBlocked = dungeon[gridY][gridX].flags & CELL_FLAGS.OBSTRUCTS_VISION;
            if (previousWasBlocked) {
                if (currentlyBlocked) {
                    // keep traversing
                    savedRightSlope = rightBlockSlope;
                } else {
                    previousWasBlocked = false;
                    leftViewSlope = savedRightSlope;
                }
            } else {
                if (currentlyBlocked) {
                    if (leftBlockSlope <= leftViewSlope) {
                        cast({
                            startColumn: currentCol + 1,
                            leftViewSlope,
                            rightViewSlope: leftBlockSlope,
                            transform,
                            row,
                            col,
                            dungeon,
                            light,
                        });
                    }

                    previousWasBlocked = true;
                    savedRightSlope = rightBlockSlope;
                }
            }
        }

        if (previousWasBlocked) {
            break;
        }
    }
};

export const scan = (player: {x: number; y: number}, dungeon: Grid<AnnotatedCell>) => {
    // we're viewing a FOV of the dungeon, but memory is everything, so we need to offset
    let updatedLight = new Array(dungeon.length)
        .fill(DARKNESS_MAX)
        .map(() => new Array(dungeon[0].length).fill(DARKNESS_MAX));
    updatedLight[player.y][player.x] = 0;
    let updatedMemory = new Array(dungeon.length)
        .fill(0)
        .map(() => new Array(dungeon[0].length).fill(0));
    for (var octant = 0; octant < 8; octant++) {
        cast({
            startColumn: 1,
            leftViewSlope: 1.0,
            rightViewSlope: 0.0,
            transform: octantTransforms[octant],
            row: player.y,
            col: player.x,
            dungeon,
            light: updatedLight,
        });
    }
    return {lightMap: updatedLight, memory: updatedMemory};
};

const getFOVMask = ({
    row,
    col,
    dungeon,
}: {
    grid: Grid<0 | 1>;
    row: number;
    col: number;
    dungeon: Grid<AnnotatedCell>;
}) => {
    let light = gridFromDimensions(dungeon.length, dungeon[0].length, 0);
    for (var octant = 0; octant < 8; octant++) {
        cast({
            startColumn: 1,
            leftViewSlope: 1.0,
            rightViewSlope: 0.0,
            transform: octantTransforms[octant],
            dungeon,
            row,
            col,
            light,
        });
    }
    return light;
};

const paintLight = ({
    lightSource,
    row,
    col,
    dungeon,
    lightMap,
}: {
    lightSource: LightSource;
    row: number;
    col: number;
    dungeon: Grid<AnnotatedCell>;
    lightMap: Grid<CellColorLayer | undefined>;
}) => {
    const radius = Math.floor(randomRange(lightSource.minRadius, lightSource.maxRadius) / 100);
    let lightHyperspace = gridFromDimensions(dungeon.length, dungeon[0].length, undefined);
    for (let i = Math.max(0, row - radius); i < dungeon.length && i < row + radius; i++) {
        for (let j = Math.max(0, col - radius); j < dungeon[0].length && j < col + radius; j++) {
            lightHyperspace[i][j] = 0;
        }
    }

    lightHyperspace = getFOVMask({
        grid: lightHyperspace,
        dungeon,
        row,
        col,
    });

    const randComponent = randomRange(0, lightSource.color.variance.overall);
    const colorComponents = {
        r:
            randComponent +
            lightSource.color.baseColor.r +
            randomRange(0, lightSource.color.variance.r),
        g:
            randComponent +
            lightSource.color.baseColor.g +
            randomRange(0, lightSource.color.variance.g),
        b:
            randComponent +
            lightSource.color.baseColor.b +
            randomRange(0, lightSource.color.variance.b),
    };

    let lightMultiplier: number;
    const fadeToPercent = lightSource.fade;
    for (let i = Math.max(0, row - radius); i < dungeon.length && i < row + radius; i++) {
        for (let j = Math.max(0, col - radius); j < dungeon[0].length && j < col + radius; j++) {
            if (lightHyperspace[i][j]) {
                lightMultiplier =
                    100 -
                    ((100 - fadeToPercent) * Math.sqrt((i - row) ** 2 + (j - col) ** 2)) / radius;

                if (lightMap[i][j] === undefined) {
                    lightMap[i][j] = {r: 0, g: 0, b: 0};
                }

                Object.entries(colorComponents).forEach(
                    ([component, value]: ['r' | 'g' | 'b', number]) => {
                        lightMap[i][j][component] += (value * lightMultiplier) / 255;
                    }
                );
            }
        }
    }

    if (lightMap[row][col] === undefined) {
        lightMap[row][col] = {r: 0, g: 0, b: 0};
    }
    lightMap[row][col].r += colorComponents.r;
    lightMap[row][col].g += colorComponents.g;
    lightMap[row][col].b += colorComponents.b;
    lightMap[row][col].dancing = {
        period: 20000,
        deviations: {
            ...lightSource.color.variance,
        },
    };

    return lightMap;
};

export const lightDungeon = ({
    dungeon,
    colors,
    mutate,
}: {
    dungeon: Grid<AnnotatedCell>;
    colors: Grid<{fg: RGBColor; bg: RGBColor}>;
    mutate: boolean;
}): {
    mixedColors: Grid<{fg: RGBColor; bg: RGBColor}>;
    lightColors: Grid<CellColorLayer | undefined>;
} => {
    let lightMap = gridFromDimensions(dungeon.length, dungeon[0].length, undefined);
    let lightColors: Grid<RGBColor | undefined> = gridFromDimensions(
        colors.length,
        colors[0].length,
        undefined
    );
    for (let row = 0; row < dungeon.length; row++) {
        for (let col = 0; col < dungeon[0].length; col++) {
            if (dungeon[row][col].glowLight) {
                lightMap = paintLight({
                    lightSource: dungeon[row][col].glowLight,
                    dungeon,
                    row,
                    col,
                    lightMap,
                });
            }
        }
    }
    let lightColor: RGBColor;
    for (let row = 0; row < dungeon.length; row++) {
        for (let col = 0; col < dungeon[0].length; col++) {
            lightColor = lightMap[row][col];
            if (lightMap[row][col]) {
                if (mutate) {
                    colors[row][col].fg = {
                        r: Math.floor(colors[row][col].fg.r + lightColor.r),
                        g: Math.floor(colors[row][col].fg.g + lightColor.g),
                        b: Math.floor(colors[row][col].fg.b + lightColor.b),
                    };
                    colors[row][col].bg = {
                        r: Math.floor(colors[row][col].bg.r + lightColor.r),
                        g: Math.floor(colors[row][col].bg.g + lightColor.g),
                        b: Math.floor(colors[row][col].bg.b + lightColor.b),
                    };
                }
                lightColors[row][col] = lightColor;
            }
        }
    }
    return {mixedColors: colors, lightColors};
};
