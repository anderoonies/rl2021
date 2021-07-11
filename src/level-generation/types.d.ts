import {
    CA,
    CARDINAL_DIRECTIONS,
    CELLS,
    CELL_TYPES,
    DIRECTIONS,
    DUNGEON_FEATURE_CATALOG,
    PERLIN_COLORS,
    ROOM_TYPES,
} from './constants';
import type * as Color from 'color';
import {RGB} from 'color-name';

export type CellConstant = typeof CELL_TYPES[keyof typeof CELL_TYPES];
type CellFlags = {
    OBSTRUCTS_PASSIBILITY?: boolean;
    OBSTRUCTS_VISION?: boolean;
    YIELD_LETTER?: boolean;
};
export type CellType = {
    type: string;
    color: {fg: string; bg: string; dances?: boolean};
    letter: string;
    priority: number;
    flags: CellFlags;
    glowLight?: LightSource;
};
export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
export type FeatureType = typeof DUNGEON_FEATURE_CATALOG[keyof typeof DUNGEON_FEATURE_CATALOG];
export type CellularAutomataRules = typeof CA.rules[keyof typeof CA.rules];

export type ColorString = `#${number}${number}${number}`;
type ColoredCell = {bg: ColorString; fg: ColorString};
export type DungeonCell = CellConstant | ColoredCell;
export type AnnotatedCell = CellType & {constant: CellConstant};
export type Grid<T = DungeonCell> = Array<Array<T>>;
export type Dungeon = Grid;
export type Directions = typeof DIRECTIONS[keyof typeof DIRECTIONS];
export type CardinalDirections = typeof CARDINAL_DIRECTIONS[keyof typeof CARDINAL_DIRECTIONS];
export type DoorSite = {x: number; y: number; direction: 0 | 1 | 2 | 3};
export type DoorSites = Array<DoorSite>;
export type RGBColor = {r: number; g: number; b: number; alpha?: number};
export type CellColor = {fg: CellColorLayer; bg: CellColorLayer};
export type LightSource = {
    minRadius: number;
    maxRadius: number;
    fade: number;
    color: {
        baseColor: RGBColor;
        variance: RGBColor & {
            overall: number;
        };
    };
};

// Color types
type RandomColorDefiniton = {
    bg: {
        baseColor: RGBColor;
        noise: RGBColor & {overall: number};
        variance: RGBColor & {overall: number};
    };
    fg: {
        baseColor: RGBColor;
        noise: RGBColor & {overall: number};
        variance: RGBColor & {overall: number};
    };
};
type PerlinColorDefinition = {
    bg: {
        baseColor: RGBColor;
        variance: RGBColor & {overall: number};
    };
    fg: {
        baseColor: RGBColor;
        variance: RGBColor & {overall: number};
    };
};
type CellColorLayer = RGBColor & {
    dancing?: {
        deviations: {r: number; g: number; b: number};
        period: number;
    };
};
