import {
    CA,
    CARDINAL_DIRECTIONS,
    CELL_TYPES,
    DIRECTIONS,
    DUNGEON_FEATURE_CATALOG,
    MONSTER_TYPES,
    ROOM_TYPES,
    HORDE_FLAGS,
    BEHAVIOR_FLAGS,
    ABILITY_FLAGS,
    CELL_FLAGS,
} from './constants';

export type CellConstant = typeof CELL_TYPES[keyof typeof CELL_TYPES];
type CellFlags = number;
export type CellType = {
    type: string;
    color: {fg: string; bg: string; dances?: boolean};
    letter: string;
    priority: number;
    flags: CellFlags;
    glowLight?: LightSource;
    terrain?: CellConstant;
    flavor?: string;
};
export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
export type FeatureType = typeof DUNGEON_FEATURE_CATALOG[keyof typeof DUNGEON_FEATURE_CATALOG];
export type CellularAutomataRules = typeof CA.rules[keyof typeof CA.rules];

export type ColorString = `#${number}${number}${number}`;
type ColoredCell = {bg: ColorString; fg: ColorString};
export type DungeonCell = CellConstant | ColoredCell;
export type AnnotatedCell = CellType & {constant: CellConstant};
export type Grid<T = DungeonCell> = Array<Array<T>>;
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
        deviations: {r: number; g: number; b: number; overall: number};
        period: number;
    };
};

// DUNGEON
type Dungeon = {
    DUNGEON: Grid<CellConstant>;
    TERRAIN: Grid<CellConstant>;
    FLAGS: Grid<number>;
};

// Monsters D:<
export type MonsterType = MONSTER_TYPES;
type HordeFlags = typeof HORDE_FLAGS[keyof typeof HORDE_FLAGS];
export type Horde = {
    leaderType: MonsterType;
    numberOfMembers: number;
    memberType: Array<MonsterType>;
    memberCount: Array<number>;
    minLevel: number;
    maxLevel: number;
    frequency: number;
    spawnsIn?: CellConstant;
    flags?: HordeFlags;
};

type BehaviorFlags = BEHAVIOR_FLAGS;
type AbilityFlags = ABILITY_FLAGS;
export type Monster = {
    name: string;
    // @, G, etc.
    ch: string;
    color: RGBColor;
    HP: number;
    def: number;
    acc: number;
    damage: number[];
    reg: number;
    move: number;
    attack: number;
    // todo
    blood?: FeatureType;
    light?: LightSource;
    isLarge: boolean;
    dfChance?: number;
    dfType?: FeatureType;
    // TODO
    bolts?: null;
    // todo
    behaviorFlags?: BehaviorFlags[];
    abilityFlags?: AbilityFlags[];
};

export type Creature = {
    info?: Monster;
    xLoc: number;
    yLoc: number;
    depth?: number;
    currentHP: number;
    turnsUntilRegen?: number;
    regenPerTurn?: number;
    weaknessAmount?: number;
    poisonAmount?: number;
    // todo
    creatureState?: number;
    // todo
    creatureMode?: number;
    mutationIndex?: number;
    wasNegated?: boolean;
    // waypoints
    targetWaypointIndex?: number;
    waypointAlreadyVisited?: Array<boolean>;
    lastSeenPlayerAt?: [number, number];
    targetCorpseLoc?: [number, number]; // location of the corpse that the monster is approaching to gain its abilities
    targetCorpseName?: string; // name of the deceased monster that we're approaching to gain its abilities
    absorptionFlags?: never; // ability/behavior flags that the monster will gain when absorption is complete
    absorbBehavior?: never; // above flag is behavior instead of ability (ignored if absorptionBolt is set)
    absorptionBolt?: never; // bolt index that the monster will learn to cast when absorption is complete
    corpseAbsorptionCounter?: never; // used to measure both the time until the monster stops being interested in the corpse,
    // and, later, the time until the monster finishes absorbing the corpse.
    mapToMe?: number[][]; // if a pack leader, this is a periodically updated pathing map to get to the leader
    safetyMap?: number[][]; // fleeing monsters store their own safety map when out of player FOV to avoid omniscience
    ticksUntilTurn?: number; // how long before the creature gets its next move

    // Locally cached statistics that may be temporarily modified:
    movementSpeed?: number;
    attackSpeed?: number;

    previousHealthPoints?: number; // remembers what your health proportion was at the start of the turn
    turnsSpentStationary?: number; // how many (subjective) turns it's been since the creature moved between tiles
    flashStrength?: number; // monster will flash soon; this indicates the percent strength of flash
    flashColor?: RGBColor; // the color that the monster will flash
    status?: Array<never>;
    maxStatus?: Array<never>; // used to set the max point on the status bars
    bookkeepingFlags?: never;
    spawnDepth?: number; // keep track of the depth of the machine to which they relate (for activation monsters)
    machineHome?: number; // monsters that spawn in a machine keep track of the machine number here (for activation monsters)
    xpxp?: number; // exploration experience (used to time telepathic bonding for allies)
    newPowerCount?: number; // how many more times this monster can absorb a fallen monster
    totalPowerCount?: number; // how many times has the monster been empowered? Used to recover abilities when negated.

    leader?: Creature; // only if monster is a follower
    carriedMonster?: Creature; // when vampires turn into bats, one of the bats restores the vampire when it dies
    carriedItem?: never; // only used for monsters
};
