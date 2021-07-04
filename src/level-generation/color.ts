import {PERLIN_COLORS, RANDOM_COLORS, WIDTH, HEIGHT, PERLIN_PERIOD, CELLS} from './constants';
import {AnnotatedCell, CellColor, Grid, RGBColor} from './types';
import * as Color from 'color';

import {gridFromDimensions, randomRange} from './utils';

type GradientMap = Array<Array<{x: number; y: number}>>;

const randomVector = () => {
    const x = (Math.random() < 0.5 ? -1 : 1) * Math.random();
    const y = (Math.random() < 0.5 ? -1 : 1) * Math.random();
    const length = Math.sqrt(x ** 2 + y ** 2);
    return {
        x: x / length,
        y: y / length,
    };
};

const interpolate = (a: number, b: number, weight: number) => {
    const interpolatedValue = (1 - weight) * a + weight * b;
    const normalizedValue = (interpolatedValue + 1) / 2;
    return normalizedValue;
};

const dotGridGradient = ({
    gradientX,
    gradientY,
    pointX,
    pointY,
    gradientMap,
}: {
    gradientX: number;
    gradientY: number;
    pointX: number;
    pointY: number;
    gradientMap: GradientMap;
}) => {
    const dx = pointX / PERLIN_PERIOD - gradientX;
    const dy = pointY / PERLIN_PERIOD - gradientY;
    let vector;
    try {
        vector = gradientMap[gradientY][gradientX];
    } catch (e) {
        debugger;
    }
    const dotProduct = dx * vector.x + dy * vector.y;
    return dotProduct;
};

const perlin = ({x, y, gradientMap}: {x: number; y: number; gradientMap: GradientMap}) => {
    // assume period 4 for now
    const gradientX0 = Math.floor(x / PERLIN_PERIOD);
    const gradientX1 = gradientX0 + 1;
    const gradientY0 = Math.floor(y / PERLIN_PERIOD);
    const gradientY1 = gradientY0 + 1;

    // interpolation weights
    const sx = x / PERLIN_PERIOD - gradientX0;
    const sy = y / PERLIN_PERIOD - gradientY0;
    const v1 = dotGridGradient({
        gradientX: gradientX0,
        gradientY: gradientY0,
        pointX: x,
        pointY: y,
        gradientMap,
    });
    const v2 = dotGridGradient({
        gradientX: gradientX1,
        gradientY: gradientY0,
        pointX: x,
        pointY: y,
        gradientMap,
    });
    const interpolatedX0 = interpolate(v1, v2, sx);

    const v3 = dotGridGradient({
        gradientX: gradientX0,
        gradientY: gradientY1,
        pointX: x,
        pointY: y,
        gradientMap,
    });
    const v4 = dotGridGradient({
        gradientX: gradientX1,
        gradientY: gradientY1,
        pointX: x,
        pointY: y,
        gradientMap,
    });
    const interpolatedX1 = interpolate(v3, v4, sx);

    return interpolate(interpolatedX0, interpolatedX1, sy);
};

const generateNoiseMap = ({
    height,
    width,
}: {
    height: number;
    width: number;
}): Array<Array<number>> => {
    let gradientMap: GradientMap = Array.from(
        {length: Math.ceil(height / PERLIN_PERIOD) + 1},
        () => {
            return Array.from({length: Math.ceil(width / PERLIN_PERIOD) + 1}, () => {
                return randomVector();
            });
        }
    );
    return gridFromDimensions(HEIGHT, WIDTH, 0).map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
            return perlin({y: rowIndex, x: colIndex, gradientMap});
        });
    });
};

const applyVariance = ({
    baseColor,
    noise,
    variance,
}: {
    baseColor: {r: number; g: number; b: number; alpha?: number};
    noise: {r: number; g: number; b: number};
    variance: {r: number; g: number; b: number; overall: number};
}): RGBColor => {
    const shift = randomRange(0, variance.overall);
    const r = clampColor(Math.floor(baseColor.r + noise.r * variance.r + shift));
    const g = clampColor(Math.floor(baseColor.g + noise.g * variance.g + shift));
    const b = clampColor(Math.floor(baseColor.b + noise.b * variance.b + shift));
    return {
        r,
        g,
        b,
        alpha: baseColor.alpha === undefined ? 1 : baseColor.alpha,
    };
};

const colorizeCellTwoPointOh = ({
    cell,
    noiseMaps,
    row,
    col,
}: {
    cell: AnnotatedCell;
    noiseMaps: NoiseMaps;
    row: number;
    col: number;
}): CellColor => {
    let cellType = cell.constant;
    if (cell.constant in noiseMaps) {
        const fgComponentNoiseMaps = noiseMaps[cellType].fg;
        const bgComponentNoiseMaps = noiseMaps[cellType].bg;
        const fgColorRules = PERLIN_COLORS[cellType].fg;
        const bgColorRules = PERLIN_COLORS[cellType].bg;
        const fgNoiseComponents = {
            r: fgComponentNoiseMaps.r[row][col],
            g: fgComponentNoiseMaps.g[row][col],
            b: fgComponentNoiseMaps.b[row][col],
        };
        const bgNoiseComponents = {
            r: bgComponentNoiseMaps.r[row][col],
            g: bgComponentNoiseMaps.g[row][col],
            b: bgComponentNoiseMaps.b[row][col],
        };
        const bg = applyVariance({
            baseColor: bgColorRules.baseColor,
            noise: bgNoiseComponents,
            variance: bgColorRules.variance,
        });

        const fg = applyVariance({
            baseColor: fgColorRules.baseColor,
            noise: fgNoiseComponents,
            variance: fgColorRules.variance,
        });

        const color: CellColor = {fg, bg};

        if (cell.color.dances) {
            return {
                fg: {...color.fg, dancing: {deviations: fgColorRules.variance, period: 100}},
                bg: {...color.bg, dancing: {deviations: bgColorRules.variance, period: 100}},
            };
        } else {
            return color;
        }
    } else if (cellType in RANDOM_COLORS) {
        const rule = RANDOM_COLORS[cellType];
        return {
            bg: applyVariance({
                baseColor: rule.bg.baseColor,
                noise: {
                    r: randomRange(0, rule.bg.noise.r),
                    g: randomRange(0, rule.bg.noise.g),
                    b: randomRange(0, rule.bg.noise.b),
                },
                variance: rule.bg.variance,
            }),
            fg: applyVariance({
                baseColor: rule.fg.baseColor,
                noise: {
                    r: randomRange(0, rule.fg.noise.r),
                    g: randomRange(0, rule.fg.noise.g),
                    b: randomRange(0, rule.fg.noise.b),
                },
                variance: rule.fg.variance,
            }),
        };
    } else {
        return {
            fg: Color(cell.color.fg).object() as RGBColor,
            bg: Color(cell.color.bg).object() as RGBColor,
        };
    }
};

const clampColor = (c: number) => {
    return Math.min(255, Math.max(0, c));
};

type NoiseMap = {r: Array<Array<number>>; g: Array<Array<number>>; b: Array<Array<number>>};
type NoiseMaps = {[cellType in keyof typeof PERLIN_COLORS]: {bg: NoiseMap; fg: NoiseMap}};
const makeNoiseMaps = (): NoiseMaps => {
    const maps = Object.entries(PERLIN_COLORS).reduce(
        (acc: Record<string, unknown>, [cellType, rules]) => {
            acc[cellType] = Object.keys(rules).reduce(
                (acc: Record<string, unknown>, ruleCategory) => {
                    acc[ruleCategory] = {
                        r: generateNoiseMap({
                            height: HEIGHT,
                            width: WIDTH,
                        }),
                        g: generateNoiseMap({
                            height: HEIGHT,
                            width: WIDTH,
                        }),
                        b: generateNoiseMap({
                            height: HEIGHT,
                            width: WIDTH,
                        }),
                    };
                    return acc;
                },
                {}
            );
            return acc;
        },
        {}
    );

    return maps as NoiseMaps;
};

// returns cells with a bgColor and a fgColor
const colorizeDungeon = (dungeon: Grid<AnnotatedCell>) => {
    const noiseMaps = makeNoiseMaps();

    const colorMap = dungeon.map((row, rowIndex) => {
        return row.map((cellType, colIndex) => {
            return colorizeCellTwoPointOh({
                cell: cellType,
                noiseMaps,
                row: rowIndex,
                col: colIndex,
            });
        });
    });
    return colorMap;
};

export {colorizeDungeon, colorizeCellTwoPointOh as colorizeCell, makeNoiseMaps};
