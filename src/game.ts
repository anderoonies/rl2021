import * as ROT from 'rot-js';
import {DisplayOptions} from 'rot-js/lib/display/types';
import {Entity, IComponentConfigVal, Query, World} from 'ape-ecs';

import * as allComponents from './components';
import {
    ActionMove,
    Position,
    Renderable,
    DancingColor,
    Light,
    Tile,
    Map,
    Character,
    PlayerControlled,
    Visible,
} from './components';

import ActionSystem from './systems/action';
import RenderSystem from './systems/render';
import MemoryRenderSystem from './systems/memoryrender';
import LightSystem from './systems/light';

import {makeDungeon} from './level-generation/generator';
import {HEIGHT, WIDTH} from './level-generation/constants';
import Uniform from 'rot-js/lib/map/uniform';
import {Grid, RGBColor} from './level-generation/types';
import FOV from 'rot-js/lib/fov/fov';
import PlayerRender from './systems/playerrender';

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

        // this.world.registerTags(Character.name, PlayerControlled.name);

        const player = this.world.createEntity<
            Character | PlayerControlled | Position | Renderable | Visible
        >({
            c: [
                {type: Character},
                {type: PlayerControlled},
                {type: Position, x: 8, y: 12},
                {
                    type: Renderable,
                    char: '@',
                    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
                    bg: {r: 0, g: 0, b: 0, alpha: 0},
                    baseFG: {r: 150, g: 150, b: 150, alpha: 1},
                    fg: {r: 150, g: 150, b: 150, alpha: 1},
                    visible: true,
                },
                {type: Visible},
            ],
        });
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
        this.world.registerSystem('render', LightSystem, [this.display]);
        this.world.registerSystem('render', MemoryRenderSystem, [this.display]);
        this.world.registerSystem('render', PlayerRender, [this.display]);

        this.fov.compute(8, 12, Infinity, (x, y, r, v) => {
            tiles[y][x].tile.addComponent({type: allComponents.Visible});
            tiles[y][x].light?.addComponent({type: allComponents.Visible});
        });

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
        this.world.tick();
    }

    makeMap(): Grid<{light: Entity | undefined; tile: Entity}> {
        this.map = new Uniform(WIDTH, HEIGHT, {});
        const tiles = new Array(HEIGHT).fill(undefined).map(() => new Array(WIDTH).fill(undefined));
        const {dungeon, colorizedDungeon, lightColors} = makeDungeon(WIDTH, HEIGHT);
        this.lightColors = lightColors;
        this.map.create((col, row, contents) => {
            const tile = this.world.createEntity({
                c: [
                    {type: Position, x: col, y: row},
                    {
                        type: Renderable,
                        char: dungeon[row][col].letter,
                        fg: colorizedDungeon[row][col].fg,
                        bg: colorizedDungeon[row][col].bg,
                        baseFG: colorizedDungeon[row][col].fg,
                        baseBG: colorizedDungeon[row][col].bg,
                        visible: false,
                    },
                    {type: Tile, flags: dungeon[row][col].flags},
                ],
            });
            let light;
            if (lightColors[row][col]) {
                light = this.world.createEntity({
                    c: [
                        {
                            type: Light,
                            base: {...lightColors[row][col]},
                            current: {...lightColors[row][col]},
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
        return tiles;
    }
}
