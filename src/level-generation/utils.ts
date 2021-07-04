import {Dungeon, DungeonCell, Grid} from './types';
import {WIDTH, HEIGHT} from './constants';

export const clamp = (x: number, min: number, max: number) => {
    return Math.min(max, Math.max(x, min));
};

export const boundX = (value: number) => {
    return clamp(value, 0, WIDTH);
};

export const boundY = (value: number) => {
    return clamp(value, 0, HEIGHT);
};

export const gridFromDimensions = <T>(height: number, width: number, value: T): Grid<T> => {
    return new Array(height).fill(value).map(row => {
        return new Array(width).fill(value);
    });
};

export const coordinatesAreInMap = (row: number, col: number, dungeon?: Dungeon) => {
    if (dungeon === undefined) {
        return row >= 0 && row < HEIGHT && col >= 0 && col < WIDTH;
    } else {
        return row >= 0 && row < dungeon.length && col >= 0 && col < dungeon[0].length;
    }
};

export const randomRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

export const randomRangeInclusive = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
