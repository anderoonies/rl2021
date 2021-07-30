import {
    CellColor,
    CellConstant,
    CellType,
    FeatureType,
    Horde,
    LightSource,
    Monster,
    MonsterType,
    PerlinColorDefinition,
    RandomColorDefiniton,
    RGBColor,
} from './types';

// global
export const CELL_WIDTH = 1;
export const FOV = 10;

// light
export const BRIGHT_THRESHOLD = 10;
export const DIM_THRESHOLD = 30;
export const DARK_THRESHOLD = 60;
export const DARKNESS_MAX = 100;
export const LIGHT_RANGE = 5;

// # and flags~
export const DEBUG_FLAGS = {
    DEBUG: true,
    ROOMS_ONLY: false,
    SHOW_ACCRETION: false,
    SHOW_CA: false,
    FIT: true,
    NO_MONSTERS: false,
} as const;

export let WIDTH = 50;
export let HEIGHT = 20;
export const setWidth = (w: number) => {
    WIDTH = w;
};
export const setHeight = (h: number) => {
    HEIGHT = h;
};

// rooms
export const ROOM_MIN_WIDTH = 4;
export const ROOM_MAX_WIDTH = 20;
export const ROOM_MIN_HEIGHT = 3;
export const ROOM_MAX_HEIGHT = 7;
export const HORIZONTAL_CORRIDOR_MIN_LENGTH = 5;
export const HORIZONTAL_CORRIDOR_MAX_LENGTH = 15;
export const VERTICAL_CORRIDOR_MIN_LENGTH = 2;
export const VERTICAL_CORRIDOR_MAX_LENGTH = 9;

export const ROOM_TYPES = {
    CA: 0,
    CIRCLE: 1,
    SYMMETRICAL_CROSS: 2,
} as const;

export enum CELL_FLAGS {
    OBSTRUCTS_PASSIBILITY = 1,
    OBSTRUCTS_VISION = 1 << 1,
    YIELD_LETTER = 1 << 2,
    HAS_MONSTER = 1 << 3,
    NEVER_PASSABLE = 1 << 4,
}

export const CELL_TYPES: Record<string, number> = {
    DEBUG: -10,
    EMPTY: -1,
    WALL: 17,
    ROCK: 0,
    FLOOR: 1,
    DOOR: 2,
    EXIT_NORTH: 3,
    EXIT_EAST: 4,
    EXIT_SOUTH: 5,
    EXIT_WEST: 6,
    LAKE: 7,
    GRANITE: 8,
    CRYSTAL_WALL: 9,
    LUMINESCENT_FUNGUS: 10,
    GRASS: 11,
    DEAD_GRASS: 12,
    SHALLOW_WATER: 13,
    DEAD_FOLIAGE: 14,
    FOLIAGE: 15,
    RUBBLE: 16,
    TORCH_WALL: 18,
    HAZE: 19,
    LIGHT_POOL: 20,
    CHASM: 21,
    CHASM_EDGE: 22,
    LAVA: 23,
};

export enum LIQUID_TYPES {
    WATER,
    LAVA,
    CHASM,
}
export enum WREATH_TYPES {
    SHALLOW_WATER = CELL_TYPES.SHALLOW_WATER,
    NONE = CELL_TYPES.EMPTY,
    CHASM_EDGE = CELL_TYPES.CHASM_EDGE,
}

export const LIQUID_CELLS: Record<LIQUID_TYPES | WREATH_TYPES, CellConstant> = {
    [LIQUID_TYPES.WATER]: CELL_TYPES.LAKE,
    [WREATH_TYPES.SHALLOW_WATER]: CELL_TYPES.SHALLOW_WATER,
    [LIQUID_TYPES.CHASM]: CELL_TYPES.CHASM,
    [WREATH_TYPES.CHASM_EDGE]: CELL_TYPES.CHASM_EDGE,
    [LIQUID_TYPES.LAVA]: CELL_TYPES.LAVA,
    [WREATH_TYPES.NONE]: CELL_TYPES.EMPTY,
};

export const WREATH_FOR_LIQUID: Record<LIQUID_TYPES, WREATH_TYPES> = {
    [LIQUID_TYPES.WATER]: WREATH_TYPES.SHALLOW_WATER,
    [LIQUID_TYPES.LAVA]: WREATH_TYPES.NONE,
    [LIQUID_TYPES.CHASM]: WREATH_TYPES.CHASM_EDGE,
};

export const EXIT_TYPE = (CELL_TYPE: CellConstant) => {
    return CELL_TYPE <= CELL_TYPES.EXIT_WEST && CELL_TYPE >= CELL_TYPES.EXIT_NORTH;
};

export const PASSIBLE_TYPES = [
    CELL_TYPES.FLOOR,
    CELL_TYPES.DOOR,
    CELL_TYPES.SHALLOW_WATER,
    CELL_TYPES.DEAD_GRASS,
    CELL_TYPES.GRASS,
];

export const IMPASSIBLE_TYPES = [CELL_TYPES.ROCK, CELL_TYPES.WALL, CELL_TYPES.LAKE];

export const IMPASSIBLE = (cell: CellConstant) => {
    return IMPASSIBLE_TYPES.indexOf(cell) > -1;
};

export const PASSIBLE = (cell: CellConstant) => {
    return PASSIBLE_TYPES.indexOf(cell) > -1;
};

export const HALLWAY_CHANCE = 0.15;
export const CARDINAL_DIRECTIONS = {NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3};
export const DIRECTIONS = {
    ...CARDINAL_DIRECTIONS,
    NO_DIRECTION: -1,
    NE: 4,
    SE: 5,
    SW: 6,
    NW: 7,
};

export const DIR_TO_TRANSFORM = {
    [DIRECTIONS.NORTH]: {
        x: 0,
        y: -1,
    },
    [DIRECTIONS.SOUTH]: {
        x: 0,
        y: 1,
    },
    [DIRECTIONS.EAST]: {
        x: 1,
        y: 0,
    },
    [DIRECTIONS.WEST]: {
        x: -1,
        y: 0,
    },
    [DIRECTIONS.WEST]: {
        x: -1,
        y: 0,
    },
    [DIRECTIONS.NE]: {
        x: 1,
        y: -1,
    },
    [DIRECTIONS.SE]: {
        x: 1,
        y: 1,
    },
    [DIRECTIONS.SW]: {
        x: -1,
        y: 1,
    },
    [DIRECTIONS.NW]: {
        x: -1,
        y: -1,
    },
};

// colors
export const COLORS: Record<
    keyof typeof CELL_TYPES,
    {bg: string; fg: string; dances?: boolean; opacity?: number}
> = {
    FLOOR: {bg: '#23232b', fg: '#bfbfbf'},
    WALL: {bg: '#f5e3cd', fg: 'black'},
    DOOR: {bg: '#583b30', fg: 'black'},
    ROCK: {bg: 'black', fg: 'black'},
    // todo
    GRANITE: {bg: 'black', fg: 'black'},
    LAKE: {bg: '#5e5eca', fg: 'black', dances: true},
    SHALLOW_WATER: {bg: '#70a0ed', fg: 'black', dances: true},
    LAVA: {bg: '', fg: '', dances: true},
    GRASS: {bg: '#23232b', fg: '#8bc34a'},
    DEAD_GRASS: {bg: '#23232b', fg: '#8c542b'},
    DEAD_FOLIAGE: {bg: '#23232b', fg: '#8c542b'},
    FOLIAGE: {bg: '#23232b', fg: '#8bc34a'},
    RUBBLE: {bg: '#23232b', fg: '#bfbfbf'},
    TORCH_WALL: {bg: 'red', fg: 'yellow'},
    HAZE: {bg: 'pink', fg: 'pink', opacity: 0.4},
    // todo
    LUMINESCENT_FUNGUS: {bg: 'green', fg: 'yellow'},
    EMPTY: {bg: 'rgba(0,0,0,0)', fg: 'rgba(0,0,0,0)'},
};

// cell types
export const CELLS: Record<typeof CELL_TYPES[keyof typeof CELL_TYPES], CellType> = {
    [CELL_TYPES.DEBUG]: {
        type: 'debug',
        letter: ',',
        color: COLORS.EMPTY,
        priority: -1,
        flags: 0,
    },
    [CELL_TYPES.EMPTY]: {
        type: 'EMPTY',
        color: COLORS.EMPTY,
        letter: ' ',
        priority: -1,
        flags: 0,
    },
    [CELL_TYPES.FLOOR]: {
        type: 'FLOOR',
        color: COLORS.FLOOR,
        letter: String.fromCharCode(0x00b7),
        priority: 9,
        flags: 0,
    },
    [CELL_TYPES.WALL]: {
        type: 'WALL',
        color: COLORS.WALL,
        letter: '#',
        priority: 18,
        flags:
            CELL_FLAGS.OBSTRUCTS_PASSIBILITY |
            CELL_FLAGS.OBSTRUCTS_VISION |
            CELL_FLAGS.NEVER_PASSABLE,
    },
    [CELL_TYPES.ROCK]: {
        type: 'ROCK',
        color: COLORS.ROCK,
        letter: '#',
        priority: 15,
        flags:
            CELL_FLAGS.OBSTRUCTS_PASSIBILITY |
            CELL_FLAGS.OBSTRUCTS_VISION |
            CELL_FLAGS.NEVER_PASSABLE,
    },
    [CELL_TYPES.DOOR]: {
        type: 'DOOR',
        color: COLORS.DOOR,
        letter: '+',
        priority: 16,
        flags: CELL_FLAGS.OBSTRUCTS_VISION,
    },
    [CELL_TYPES.EXIT_NORTH]: {
        type: 'DOOR',
        color: COLORS.DOOR,
        letter: '^',
        priority: 0,
        flags: 0,
    },
    [CELL_TYPES.EXIT_EAST]: {
        type: 'DOOR',
        color: COLORS.DOOR,
        letter: '>',
        priority: 0,
        flags: 0,
    },
    [CELL_TYPES.EXIT_SOUTH]: {
        type: 'DOOR',
        color: COLORS.DOOR,
        letter: 'V',
        priority: 0,
        flags: 0,
    },
    [CELL_TYPES.EXIT_WEST]: {
        type: 'DOOR',
        color: COLORS.DOOR,
        letter: '<',
        priority: 0,
        flags: 0,
    },
    [CELL_TYPES.LAKE]: {
        type: 'LAKE',
        color: COLORS.LAKE,
        letter: '~',
        priority: 20,
        flags: CELL_FLAGS.OBSTRUCTS_PASSIBILITY,
        // GLOWING WATER!!!!
        // glowLight: {
        //     // {1000, 1000, 1},		50,		false}
        //     minRadius: 1000,
        //     maxRadius: 1000,
        //     fade: 20,
        //     color: {
        //         baseColor: {
        //             // {75,	38, 15, 0, 15, 	7, 	0, true}
        //             r: 1,
        //             g: 1,
        //             b: 10
        //         },
        //         variance: {
        //             r: 1,
        //             g: 2,
        //             b: 0,
        //             overall: 0,
        //         }
        //     }
        // },
    },
    [CELL_TYPES.SHALLOW_WATER]: {
        type: 'SHALLOW_WATER',
        color: COLORS.SHALLOW_WATER,
        letter: '~',
        priority: 17,
        flags: 0,
    },
    [CELL_TYPES.GRANITE]: {
        type: 'GRANITE',
        color: COLORS.GRANITE,
        letter: 'g',
        priority: 10,
        flags: CELL_FLAGS.OBSTRUCTS_PASSIBILITY | CELL_FLAGS.OBSTRUCTS_VISION,
    },
    [CELL_TYPES.LUMINESCENT_FUNGUS]: {
        type: 'luminescent_fungus',
        color: COLORS.LUMINESCENT_FUNGUS,
        letter: 'f',
        priority: 0,
        flags: 0,
    },
    [CELL_TYPES.GRASS]: {
        type: 'GRASS',
        color: COLORS.GRASS,
        letter: '"',
        priority: 10,
        flags: 0,
    },
    [CELL_TYPES.DEAD_GRASS]: {
        type: 'DEAD_GRASS',
        color: COLORS.DEAD_GRASS,
        letter: '"',
        priority: 10,
        flags: 0,
    },
    [CELL_TYPES.DEAD_FOLIAGE]: {
        type: 'DEAD_FOLIAGE',
        color: COLORS.DEAD_GRASS,
        letter: String.fromCharCode(0x03b3),
        priority: 10,
        flags: CELL_FLAGS.OBSTRUCTS_VISION,
    },
    [CELL_TYPES.FOLIAGE]: {
        type: 'FOLIAGE',
        color: COLORS.GRASS,
        letter: String.fromCharCode(0x03b3),
        priority: 10,
        flags: CELL_FLAGS.OBSTRUCTS_VISION,
    },
    [CELL_TYPES.RUBBLE]: {
        type: 'RUBBLE',
        color: COLORS.RUBBLE,
        letter: ',',
        priority: 11,
        flags: 0,
    },
    [CELL_TYPES.TORCH_WALL]: {
        type: 'TORCH_WALL',
        color: COLORS.TORCH_WALL,
        letter: '#',
        priority: 11,
        glowLight: {
            // {1000, 1000, 1},		50,		false}
            minRadius: 1000,
            maxRadius: 1000,
            fade: 20,
            color: {
                baseColor: {
                    // {75,	38, 15, 0, 15, 	7, 	0, true}
                    r: 10,
                    g: 5,
                    b: 1,
                },
                variance: {
                    r: 0,
                    g: 10,
                    b: 7,
                    overall: 0,
                },
            },
        },
        flags:
            CELL_FLAGS.NEVER_PASSABLE |
            CELL_FLAGS.OBSTRUCTS_PASSIBILITY |
            CELL_FLAGS.OBSTRUCTS_VISION,
    },
    [CELL_TYPES.HAZE]: {
        type: 'HAZE',
        color: COLORS.HAZE,
        letter: ' ',
        priority: 0,
        flags: CELL_FLAGS.YIELD_LETTER,
    },
    [CELL_TYPES.LIGHT_POOL]: {
        type: 'LIGHT_POOL',
        // TODO--this is unused, this is a randomized color
        color: COLORS.EMPTY,
        letter: 'x',
        priority: 0,
        flags: CELL_FLAGS.YIELD_LETTER,
        glowLight: {
            // {1000, 1000, 1},		50,		false}
            minRadius: 200,
            maxRadius: 200,
            fade: 10,
            color: {
                baseColor: {
                    // 100,	100,	75,		0,		0,			0,			0
                    r: 25,
                    g: 25,
                    b: 20,
                },
                variance: {
                    r: 0,
                    g: 0,
                    b: 0,
                    overall: 0,
                },
            },
        },
    },
    [CELL_TYPES.LAVA]: {
        type: 'LAVA',
        color: COLORS.EMPTY,
        letter: '~',
        priority: 0,
        flags: CELL_FLAGS.NEVER_PASSABLE | CELL_FLAGS.OBSTRUCTS_PASSIBILITY,
        // color {47,    13,     0,      10,     7,          0,          0,      true};
        glowLight: {
            minRadius: 200,
            maxRadius: 200,
            fade: 10,
            color: {
                baseColor: {
                    r: 0,
                    g: 0,
                    b: 0,
                },
                variance: {
                    r: 0,
                    g: 0,
                    b: 0,
                    overall: 20,
                },
            },
        },
    },
};

// CA constants
const operators = {
    lt: {
        fn: (a: number, b: number) => {
            return a < b;
        },
        string: 'less than',
    },
    gt: {
        fn: (a: number, b: number) => {
            return a > b;
        },
        string: 'greater than',
    },
    lte: {
        fn: (a: number, b: number) => {
            return a <= b;
        },
        string: 'less than or equal to',
    },
    gte: {
        fn: (a: number, b: number) => {
            return a >= b;
        },
        string: 'greater than or equal to',
    },
    eq: {
        fn: (a: any, b: any) => {
            return a === b;
        },
        string: 'equal to',
    },
};

export const CA = {
    rules: {
        ROOM_GENERATION: {
            0: [
                {
                    adjacentType: 1,
                    // will turn
                    into: 1,
                    // if there are
                    operator: operators.gte,
                    nNeighbors: 5,
                },
            ],
            1: [
                {
                    adjacentType: 1,
                    into: 0,
                    operator: operators.lt,
                    nNeighbors: 2,
                },
            ],
        },
        LAKE_GENERATION: {
            // "ffffftttt", "ffffttttt"
            0: [
                {
                    adjacentType: 1,
                    into: 1,
                    operator: operators.gte,
                    nNeighbors: 5,
                },
            ],
            1: [
                {
                    adjacentType: 1,
                    into: 0,
                    operator: operators.lte,
                    nNeighbors: 4,
                },
            ],
        },
    },
};

export const DIRECTION_TO_DOOR_LETTER = {
    [DIRECTIONS.NORTH]: '^',
    [DIRECTIONS.EAST]: '>',
    [DIRECTIONS.SOUTH]: 'V',
    [DIRECTIONS.WEST]: '<',
};

const FEATURES = {
    DF_GRANITE_COLUMN: 0,
    DF_CRYSTAL_WALL: 1,
    DF_LUMINESCENT_FUNGUS: 2,
    DF_GRASS: 3,
    DF_DEAD_GRASS: 4,
    DF_DEAD_FOLIAGE: 5,
    DF_FOLIAGE: 6,
    DF_TORCH_WALL: 7,
    DF_RUBBLE: 8,
    DF_LIGHT_POOL: 9,
};

export const DUNGEON_FEATURE_CATALOG = {
    [FEATURES.DF_GRANITE_COLUMN]: {
        tile: CELL_TYPES.GRANITE,
        start: 80,
        decr: 70,
        propagate: true,
    },
    [FEATURES.DF_CRYSTAL_WALL]: {
        tile: CELL_TYPES.CRYSTAL_WALL,
        start: 200,
        decr: 50,
        propagate: true,
    },
    [FEATURES.DF_GRASS]: {
        tile: CELL_TYPES.GRASS,
        start: 75,
        decr: 10,
        propagationTerrains: [CELL_TYPES.FLOOR, CELL_TYPES.DEAD_GRASS],
        subsequentFeature: FEATURES.DF_FOLIAGE,
        propagate: true,
    },
    [FEATURES.DF_DEAD_GRASS]: {
        tile: CELL_TYPES.DEAD_GRASS,
        start: 75,
        decr: 10,
        propagationTerrains: [CELL_TYPES.FLOOR, CELL_TYPES.GRASS],
        subsequentFeature: FEATURES.DF_DEAD_FOLIAGE,
        propagate: true,
    },
    [FEATURES.DF_DEAD_FOLIAGE]: {
        tile: CELL_TYPES.DEAD_FOLIAGE,
        start: 50,
        decr: 30,
        propagate: true,
        propagationTerrains: [CELL_TYPES.FLOOR, CELL_TYPES.DEAD_GRASS, CELL_TYPES.GRASS],
    },
    [FEATURES.DF_FOLIAGE]: {
        tile: CELL_TYPES.FOLIAGE,
        start: 50,
        decr: 30,
        propagate: true,
        propagationTerrains: [CELL_TYPES.FLOOR, CELL_TYPES.DEAD_GRASS, CELL_TYPES.GRASS],
    },
    [FEATURES.DF_RUBBLE]: {
        tile: CELL_TYPES.RUBBLE,
        start: 45,
        decr: 23,
        propagate: true,
    },
    [FEATURES.DF_TORCH_WALL]: {
        tile: CELL_TYPES.TORCH_WALL,
        propagate: false,
    },
    [FEATURES.DF_LIGHT_POOL]: {
        tile: CELL_TYPES.LIGHT_POOL,
        propagate: true,
        start: 66,
        decr: 20,
        propagationTerrains: Object.values(CELL_TYPES).filter(
            type => !(type === CELL_TYPES.WALL || type === CELL_TYPES.ROCK)
        ),
    },
};

// terrains
export const AUTO_GENERATOR_CATALOG = [
    //	 terrain layer DF Machine reqDungeon reqLiquid  >Depth <Depth freq minIncp minSlope maxNumber
    // {
    //     terrain: 0,
    //     layer: 0,
    //     DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_GRANITE_COLUMN],
    //     machine: 0,
    //     reqDungeon: CELL_TYPES.FLOOR,
    //     reqLiquid: -1,
    //     minDepth: 0,
    //     maxDepth: 0,
    //     frequency: 60,
    //     minIntercept: 100,
    //     minSlop: 0,
    //     maxNumber: 4
    // },
    // {
    //     terrain: 0,
    //     layer: 0,
    //     DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_CRYSTAL_WALL],
    //     machine: 0,
    //     reqDungeon: CELL_TYPES.ROCK,
    //     reqLiquid: -1,
    //     minDepth: 14,
    //     maxDepth: 0,
    //     frequency: 15,
    //     minIntercept: -325,
    //     minSlop: 25,
    //     maxNumber: 5
    // },
    // {
    //     terrain: 0,
    //     layer: 0,
    //     DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_LUMINESCENT_FUNGUS],
    //     machine: 0,
    //     reqDungeon: CELL_TYPES.FLOOR,
    //     reqLiquid: -1,
    //     minDepth: 0,
    //     maxDepth: 0,
    //     frequency: 15,
    //     minIntercept: -300,
    //     minSlop: 70,
    //     maxNumber: 14
    // },
    {
        terrain: 0,
        layer: 0,
        DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_GRASS],
        machine: 0,
        reqDungeon: [CELL_TYPES.FLOOR],
        reqLiquid: [],
        minDepth: 0,
        maxDepth: 10,
        frequency: 10,
        minIntercept: 1000,
        minSlope: -80,
        maxNumber: 20,
    },
    {
        terrain: 0,
        layer: 0,
        DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_DEAD_GRASS],
        machine: 0,
        reqDungeon: [CELL_TYPES.FLOOR],
        reqLiquid: [],
        minDepth: 0,
        maxDepth: 9,
        frequency: 0,
        minIntercept: 500,
        minSlope: 100,
        maxNumber: 10,
    },
    // [0, 0, DF_DEAD_GRASS, 0, FLOOR, NOTHING, 9, 14, 0, 1200, -80, 10],
    // [0, 0, DF_BONES, 0, FLOOR, NOTHING, 12, DEEPEST_LEVEL - 1, 30, 0, 0, 4],
    {
        terrain: 0,
        layer: 0,
        DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_RUBBLE],
        machine: 0,
        reqDungeon: [CELL_TYPES.FLOOR],
        reqLiquid: [],
        minDepth: 0,
        maxDepth: 9,
        frequency: 0,
        minIntercept: 0,
        minSlope: 0,
        maxNumber: 4,
    },
    {
        terrain: 0,
        layer: 0,
        DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_TORCH_WALL],
        machine: 0,
        reqDungeon: [CELL_TYPES.WALL],
        reqLiquid: [],
        minDepth: 0,
        maxDepth: 9,
        frequency: 100,
        minIntercept: 100,
        minSlope: 70,
        maxNumber: 10,
    },
    {
        terrain: 0,
        layer: 1,
        DF: DUNGEON_FEATURE_CATALOG[FEATURES.DF_LIGHT_POOL],
        machine: 0,
        reqDungeon: Object.values(CELL_TYPES).filter(
            type => !(type === CELL_TYPES.WALL || type === CELL_TYPES.ROCK)
        ),
        reqLiquid: Object.values(CELL_TYPES).filter(
            type => !(type === CELL_TYPES.WALL || type === CELL_TYPES.ROCK)
        ),
        minDepth: 0,
        // this doesnt do anything yet, make it a million, who cares
        maxDepth: 1000000,
        frequency: 70,
        minIntercept: 70,
        minSlope: 70,
        maxNumber: 2,
    },
    // [0, 0, DF_FOLIAGE, 0, FLOOR, NOTHING, 0, 8, 15, 1000, -333, 10],
    // [
    //     0,
    //     0,
    //     DF_FUNGUS_FOREST,
    //     0,
    //     FLOOR,
    //     NOTHING,
    //     13,
    //     DEEPEST_LEVEL,
    //     30,
    //     -600,
    //     50,
    //     12
    // ],
    // [
    //     0,
    //     0,
    //     DF_BUILD_ALGAE_WELL,
    //     0,
    //     FLOOR,
    //     DEEP_WATER,
    //     10,
    //     DEEPEST_LEVEL,
    //     50,
    //     0,
    //     0,
    //     2
    // ],
    // [
    //     STATUE_INERT,
    //     DUNGEON,
    //     0,
    //     0,
    //     WALL,
    //     NOTHING,
    //     6,
    //     DEEPEST_LEVEL - 1,
    //     5,
    //     -100,
    //     35,
    //     3
    // ],
    // [
    //     STATUE_INERT,
    //     DUNGEON,
    //     0,
    //     0,
    //     FLOOR,
    //     NOTHING,
    //     10,
    //     DEEPEST_LEVEL - 1,
    //     50,
    //     0,
    //     0,
    //     3
    // ],
    // [
    //     TORCH_WALL,
    //     DUNGEON,
    //     0,
    //     0,
    //     WALL,
    //     NOTHING,
    //     6,
    //     DEEPEST_LEVEL - 1,
    //     5,
    //     -200,
    //     70,
    //     12
    // ]
];

export const RANDOM_COLORS: Record<CellConstant, RandomColorDefiniton> = {
    [CELL_TYPES.TORCH_WALL]: {
        bg: {
            baseColor: {
                r: 210,
                g: 94,
                b: 73,
            },
            noise: {
                r: 0,
                g: 30,
                b: 20,
                overall: 0,
            },
            variance: {
                r: 1,
                g: 1,
                b: 1,
                overall: 0,
            },
        },
        fg: {
            baseColor: {
                r: 251,
                g: 139,
                b: 40,
            },
            noise: {
                r: 0,
                g: 15,
                b: 7,
                overall: 0,
            },
            variance: {
                r: 1,
                g: 1,
                b: 1,
                overall: 0,
            },
        },
    },
};
export const PERLIN_COLORS: Record<CellConstant, PerlinColorDefinition> = {
    [CELL_TYPES.FLOOR]: {
        bg: {
            baseColor: {
                r: 10,
                g: 10,
                b: 10,
            },
            variance: {
                r: 0,
                g: 0,
                b: 0,
                overall: 4,
            },
        },
        fg: {
            baseColor: {
                r: 191,
                g: 191,
                b: 191,
            },
            variance: {
                r: 2,
                g: 2,
                b: 2,
                overall: 2,
            },
        },
    },
    [CELL_TYPES.WALL]: {
        bg: {
            baseColor: {
                r: 119,
                g: 116,
                b: 70,
            },
            variance: {
                r: 40,
                g: 10,
                b: 40,
                overall: 40,
            },
        },
        fg: {
            baseColor: {
                r: 0,
                g: 0,
                b: 0,
            },
            variance: {
                r: 20,
                g: 0,
                b: 20,
                overall: 20,
            },
        },
    },
    [CELL_TYPES.LAKE]: {
        bg: {
            baseColor: {
                r: 30,
                g: 30,
                b: 120,
            },
            variance: {
                r: 5,
                g: 5,
                b: 5,
                overall: 15,
            },
        },
        fg: {
            baseColor: {
                r: 60,
                g: 60,
                b: 180,
            },
            variance: {
                r: 0,
                g: 0,
                b: 10,
                overall: 15,
            },
        },
    },
    [CELL_TYPES.LAVA]: {
        // fg {20,    20,     20,     100,    10,         0,          0,      true};
        // bg {70,    20,     0,      15,     10,         0,          0,      true};
        bg: {
            baseColor: {
                r: 150,
                g: 60,
                b: 0,
            },
            variance: {
                r: 60,
                g: 10,
                b: 0,
                overall: 0,
            },
        },
        fg: {
            baseColor: {
                r: 20,
                g: 20,
                b: 20,
            },
            variance: {
                r: 100,
                g: 10,
                b: 0,
                overall: 0,
            },
        },
    },
    [CELL_TYPES.SHALLOW_WATER]: {
        bg: {
            baseColor: {
                r: 80,
                g: 80,
                b: 190,
            },
            variance: {
                r: 0,
                g: 0,
                b: 10,
                overall: 15,
            },
        },
        fg: {
            baseColor: {
                r: 150,
                g: 150,
                b: 200,
            },
            variance: {
                r: 0,
                g: 0,
                b: 10,
                overall: 30,
            },
        },
    },
    [CELL_TYPES.GRASS]: {
        fg: {
            baseColor: {
                r: 15,
                g: 40,
                b: 15,
            },
            variance: {
                r: 30,
                g: 100,
                b: 60,
                overall: 30,
            },
        },
        bg: {
            baseColor: {
                r: 10,
                g: 10,
                b: 10,
            },
            variance: {
                r: 0,
                g: 0,
                b: 0,
                overall: 0,
            },
        },
    },
    [CELL_TYPES.FOLIAGE]: {
        fg: {
            baseColor: {
                r: 15,
                g: 40,
                b: 15,
            },
            variance: {
                r: 30,
                g: 100,
                b: 60,
                overall: 30,
            },
        },
        bg: {
            baseColor: {
                r: 10,
                g: 10,
                b: 10,
            },
            variance: {
                r: 0,
                g: 0,
                b: 0,
                overall: 0,
            },
        },
    },
    [CELL_TYPES.DEAD_GRASS]: {
        fg: {
            baseColor: {
                r: 51,
                g: 33,
                b: 24,
            },
            variance: {
                r: 50,
                g: 40,
                b: 10,
                overall: 25,
            },
        },
        bg: {
            baseColor: {
                r: 10,
                g: 10,
                b: 10,
            },
            variance: {
                r: 0,
                g: 0,
                b: 0,
                overall: 0,
            },
        },
    },
    [CELL_TYPES.DEAD_FOLIAGE]: {
        fg: {
            baseColor: {
                r: 51,
                g: 33,
                b: 24,
            },
            variance: {
                r: 20,
                g: 10,
                b: 5,
                overall: 20,
            },
        },
        bg: {
            baseColor: {
                r: 10,
                g: 10,
                b: 10,
            },
            variance: {
                r: 0,
                g: 0,
                b: 0,
                overall: 0,
            },
        },
    },
    // [CELL_TYPES.LIGHT_POOL]: {
    //     fg: {
    //         baseColor: {
    //             r: 255,
    //             g: 0,
    //             b: 0,
    //             alpha: 0,
    //         },
    //         variance: {
    //             r: 0,
    //             g: 0,
    //             b: 0,
    //             overall: 0,
    //         },
    //     },
    //     bg: {
    //         baseColor: {
    //             r: 220,
    //             g: 220,
    //             b: 220,
    //             alpha: 0.10,
    //         },
    //         variance: {
    //             r: 0,
    //             g: 0,
    //             b: 0,
    //             overall: 30,
    //         },
    //     },
    // },
} as const;

export const PERLIN_PERIOD = 4;

// Monsters D:<
export const HORDE_FLAGS: Record<string, (h?: Horde) => boolean> = {
    TODO: () => {
        return true;
    },
};

export enum MONSTER_TYPES {
    RAT,
    KOBOLD,
    JACKAL,
    EEL,
}

export enum BEHAVIOR_FLAGS {
    TODO,
}

export enum ABILITY_FLAGS {
    TODO,
}

export const MONSTER_CATALOG: Record<MonsterType, Monster> = {
    [MONSTER_TYPES.RAT]: {
        name: 'ratty spaghetti',
        ch: 'r',
        color: {r: 100, g: 100, b: 100, alpha: 1},
        // this rat is freaking huge
        HP: 100,
        def: 100,
        acc: 100,
        damage: [1],
        // no idea what this does yet
        reg: 1,
        move: 1,
        attack: 100,
        // this rat bleeds rubble
        blood: DUNGEON_FEATURE_CATALOG[FEATURES.DF_RUBBLE],
        // yep
        isLarge: true,
    },
    [MONSTER_TYPES.KOBOLD]: {
        name: 'kobold',
        ch: 'k',
        color: {r: 60, g: 45, b: 30, alpha: 1},
        // this rat is freaking huge
        HP: 100,
        def: 100,
        acc: 100,
        damage: [1],
        // no idea what this does yet
        reg: 1,
        move: 1,
        attack: 100,
        blood: DUNGEON_FEATURE_CATALOG[FEATURES.DF_RUBBLE],
        // yep
        isLarge: true,
    },
    [MONSTER_TYPES.JACKAL]: {
        name: 'jackal seinfeld',
        ch: 'j',
        color: {r: 60, g: 42, b: 27, alpha: 1},
        HP: 100,
        def: 100,
        acc: 100,
        damage: [1],
        // no idea what this does yet
        reg: 1,
        move: 1,
        attack: 100,
        // this rat bleeds rubble
        blood: DUNGEON_FEATURE_CATALOG[FEATURES.DF_RUBBLE],
        // yep
        isLarge: true,
    },
    [MONSTER_TYPES.EEL]: {
        name: 'eelaine benez',
        ch: 'e',
        color: {r: 30, g: 12, b: 12, alpha: 1},
        HP: 100,
        def: 100,
        acc: 100,
        damage: [1],
        reg: 1,
        move: 1,
        attack: 100,
        blood: DUNGEON_FEATURE_CATALOG[FEATURES.DF_RUBBLE],
        isLarge: true,
    },
};
export const HORDE_CATALOG: Array<Horde> = [
    {
        leaderType: MONSTER_TYPES.RAT,
        numberOfMembers: 0,
        memberType: [MONSTER_TYPES.RAT],
        memberCount: [0],
        minLevel: 1,
        maxLevel: 5,
        frequency: 150,
    },
    {
        leaderType: MONSTER_TYPES.KOBOLD,
        numberOfMembers: 0,
        memberType: [MONSTER_TYPES.KOBOLD],
        memberCount: [0],
        minLevel: 1,
        maxLevel: 6,
        frequency: 150,
    },
    {
        leaderType: MONSTER_TYPES.JACKAL,
        numberOfMembers: 0,
        memberType: [MONSTER_TYPES.JACKAL],
        memberCount: [1, 3, 1],
        minLevel: 1,
        maxLevel: 6,
        frequency: 50,
    },
    {
        leaderType: MONSTER_TYPES.EEL,
        numberOfMembers: 0,
        memberType: [MONSTER_TYPES.EEL],
        memberCount: [0],
        minLevel: 1,
        maxLevel: 6,
        frequency: 50,
        spawnsIn: CELL_TYPES.LAKE,
    },
];
