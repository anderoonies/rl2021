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
export type CellConstant = typeof CELL_TYPES[keyof typeof CELL_TYPES];
export type CellType = typeof CELLS[keyof typeof CELLS];
export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
export type FeatureType = typeof DUNGEON_FEATURE_CATALOG[keyof typeof DUNGEON_FEATURE_CATALOG];
export type CellularAutomataRules = typeof CA.rules[keyof typeof CA.rules];
export type PerlinColor = typeof PERLIN_COLORS[keyof typeof PERLIN_COLORS];

export type ColorString = string;
type ColoredCell = {bg: ColorString; fg: ColorString};
export type DungeonCell = CellConstant | ColoredCell;
export type AnnotatedCell = CellType & {constant: CellConstant};
export type DungeonGrid<T = DungeonCell> = Array<Array<T>>;
export type Dungeon = DungeonGrid;
export type Directions = typeof DIRECTIONS[keyof typeof DIRECTIONS];
export type CardinalDirections = typeof CARDINAL_DIRECTIONS[keyof typeof CARDINAL_DIRECTIONS];
export type DoorSite = {x: number; y: number; direction: 0 | 1 | 2 | 3};
export type DoorSites = Array<DoorSite>;
export type RGBColor = {r: number; g: number; b: number};
export type CellColor = {fg: RGBColor; bg: RGBColor};
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
