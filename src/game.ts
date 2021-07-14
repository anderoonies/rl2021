import {Entity, Query, World} from 'ape-ecs';
import * as ROT from 'rot-js';
import {DisplayOptions} from 'rot-js/lib/display/types';
import FOV from 'rot-js/lib/fov/fov';
import Uniform from 'rot-js/lib/map/uniform';
import * as allComponents from './components';
import {
    ActionMove,
    Creature,
    DancingColor,
    Light,
    Map,
    PlayerControlled,
    Position,
    Renderable,
    Tile,
    Visible,
} from './components';
import {HEIGHT, WIDTH} from './level-generation/constants';
import {makeDungeon} from './level-generation/generator';
import {Grid, RGBColor} from './level-generation/types';
import ActionSystem from './systems/action';
import LightSystem from './systems/light';
import MemoryRenderSystem from './systems/memoryrender';
import CreatureRender from './systems/playerrender';
import RenderSystem from './systems/render';

const options: Partial<DisplayOptions> = {
    // layout: "tile",
    bg: 'black',
    fontSize: 20,
    spacing: 1.2,
    fontFamily: 'monospace',
    width: WIDTH,
    height: HEIGHT,
};

export default class Game {
    display: ROT.Display;
    world: World;
    globalEntity: Entity;
    mapEntity: Entity;
    lastUpdate: number;
    tickTime: number;
    playerQuery: Query;
    player: Entity;
    seed: string;
    map: Uniform;
    fov: FOV;
    lighting: ROT.Lighting;
    lightColors: Grid<RGBColor>;

    constructor(container: HTMLElement, logdiv: HTMLElement, tileSet: HTMLImageElement) {
        this.display = new ROT.Display(options);
        this.world = new World();

        this.lastUpdate = performance.now();
        this.tickTime = 0;
        this.update(this.lastUpdate);
        container.appendChild(this.display.getContainer());

        this.registerComponents();

        const player = this.world.createEntityTypesafe({
            c: [
                {type: Creature},
                {type: PlayerControlled},
                {
                    type: Renderable,
                    char: '@',
                    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
                    bg: {r: 0, g: 0, b: 0, alpha: 0},
                    baseFG: {r: 150, g: 150, b: 150, alpha: 1},
                    fg: {r: 150, g: 150, b: 150, alpha: 1},
                },
                {type: Visible},
            ],
        });
        this.player = player;
        const tiles = this.makeMap();
        this.fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            const playerPosition = player.getOne(Position);
            if (x === playerPosition.x && y === playerPosition.y) {
                return true;
            }
            return !tiles?.[y]?.[x]?.tile.getOne(Tile).flags.OBSTRUCTS_VISION;
        }, {});
        this.mapEntity = this.world.createEntity({
            id: 'map',
        });
        this.mapEntity.addComponent({
            type: Map,
            width: WIDTH,
            height: HEIGHT,
            tiles: tiles,
        });
        this.world.registerSystem('everyframe', ActionSystem, [
            this.fov,
            this.lighting,
            tiles,
            this.lightColors,
        ]);
        this.world.registerSystem('render', RenderSystem, [this.display]);
        this.world.registerSystem('render', MemoryRenderSystem, [this.display]);
        this.world.registerSystem('light', LightSystem, [this.display]);
        this.world.registerSystem('postrender', CreatureRender, [this.display]);

        const playerPosition = player.getOne(Position);
        this.fov.compute(
            playerPosition.x,
            playerPosition.y,
            Math.max(WIDTH, HEIGHT),
            (x, y, r, v) => {
                if (y < 0 || x < 0 || y >= HEIGHT || y >= WIDTH) {
                    return;
                }
                tiles[y][x].tile.addComponent({type: allComponents.Visible});
                tiles[y][x].light?.addComponent({type: allComponents.Visible});
            }
        );

        this.playerQuery = this.world.createQuery().fromAll('PlayerControlled');
        window.addEventListener('keydown', e => {
            const entities = this.playerQuery.refresh().execute();
            for (const player of entities) {
                switch (e.code) {
                    case 'ArrowUp':
                        player.addComponent({
                            type: ActionMove,
                            y: -1,
                            x: 0,
                        });
                        break;
                    case 'ArrowDown':
                        player.addComponent({
                            type: ActionMove,
                            y: 1,
                            x: 0,
                        });
                        break;
                    case 'ArrowLeft':
                        player.addComponent({
                            type: ActionMove,
                            x: -1,
                            y: 0,
                        });
                        break;
                    case 'ArrowRight':
                        player.addComponent({
                            type: ActionMove,
                            x: 1,
                            y: 0,
                        });
                        break;
                    case 'Enter':
                        this.makeMap();
                        break;
                    default:
                        console.log(e.code);
                        break;
                }
            }
            this.world.runSystems('everyframe');
        });
    }

    registerComponents() {
        Object.entries(allComponents).forEach(([name, component]) => {
            this.world.registerComponent(component);
        });
    }

    update(time: number) {
        window.requestAnimationFrame(this.update.bind(this));
        const elapsed = time - this.lastUpdate;
        this.tickTime += elapsed;
        this.lastUpdate = time;
        this.world.runSystems('render');
        this.world.runSystems('postrender');
        // this.world.runSystems('light');
        this.world.tick();
    }

    makeMap(): Grid<{light: Entity | undefined; tile: Entity}> {
        this.map = new Uniform(WIDTH, HEIGHT, {});
        const tiles = new Array(HEIGHT).fill(undefined).map(() => new Array(WIDTH).fill(undefined));
        this.seed = '111';
        const seedDestination = document.querySelector('#seed');
        if (seedDestination) {
            seedDestination.innerHTML = `Seed: ${this.seed}`;
        }
        const {dungeon, colorizedDungeon, lightColors, monsters} = makeDungeon(
            WIDTH,
            HEIGHT,
            this.seed
        );
        this.lightColors = lightColors;
        let foundASpotForThePlayer = false;
        this.map.create((col, row, contents) => {
            const tile = this.world.createEntityTypesafe({
                c: [
                    {type: Position, x: col, y: row},
                    {
                        type: Renderable,
                        char: dungeon[row][col].letter,
                        fg: {
                            ...colorizedDungeon[row][col].fg,
                            alpha: colorizedDungeon[row][col].fg.alpha,
                        },
                        bg: {
                            ...colorizedDungeon[row][col].bg,
                            alpha: colorizedDungeon[row][col].bg.alpha,
                        },
                        baseFG: {
                            ...colorizedDungeon[row][col].fg,
                            alpha: colorizedDungeon[row][col].fg.alpha,
                        },
                        baseBG: {
                            ...colorizedDungeon[row][col].bg,
                            alpha: colorizedDungeon[row][col].bg.alpha,
                        },
                    },
                    {type: Tile, flags: dungeon[row][col].flags},
                ],
            });
            if (!dungeon[row][col].flags?.OBSTRUCTS_PASSIBILITY && !foundASpotForThePlayer) {
                this.player.addComponent({type: Position, x: col, y: row});
                foundASpotForThePlayer = true;
            }
            let light;
            if (lightColors[row][col]) {
                light = this.world.createEntityTypesafe({
                    c: [
                        {
                            type: Light,
                            base: {...lightColors[row][col], alpha: lightColors[row][col].alpha},
                            current: {...lightColors[row][col], alpha: lightColors[row][col].alpha},
                        },
                        {type: Position, x: col, y: row},
                    ],
                });
                if (lightColors[row][col].dancing) {
                    light.addComponent({
                        type: DancingColor,
                        ...lightColors[row][col].dancing,
                        timer: lightColors[row][col].dancing.period,
                    });
                }
            }
            if (colorizedDungeon[row][col].fg.dancing) {
                tile.addComponent({
                    type: DancingColor,
                    period: colorizedDungeon[row][col].fg.dancing.period,
                    deviations: colorizedDungeon[row][col].fg.dancing.deviations,
                    timer: Math.random() * colorizedDungeon[row][col].fg.dancing.period,
                });
            }
            tiles[row][col] = {tile, light};
        });

        monsters.forEach(monster => {
            this.world.createEntityTypesafe({
                c: [
                    {
                        type: Renderable,
                        char: monster.info.ch,
                        fg: {...monster.info.color, alpha: 1},
                        baseFG: {...monster.info.color, alpha: 1},
                        baseBG: {r: 0, g: 0, b: 0, alpha: 0},
                        bg: {r: 0, g: 0, b: 0, alpha: 0},
                    },
                    {
                        type: Position,
                        x: monster.xLoc,
                        y: monster.yLoc,
                    },
                    {
                        type: Visible,
                    },
                    {
                        type: Creature,
                    },
                ],
            });
        });

        return tiles;
    }
}
