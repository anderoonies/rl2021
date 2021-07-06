import * as ROT from 'rot-js';
import {DisplayOptions} from 'rot-js/lib/display/types';
import {Entity, IComponentConfigValObject, Query, World} from 'ape-ecs';

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
} from './components';

import ActionSystem from './systems/action';
import RenderSystem from './systems/render';

import {makeDungeon} from './level-generation/generator';
import {HEIGHT, WIDTH} from './level-generation/constants';
import Uniform from 'rot-js/lib/map/uniform';
import {Grid, RGBColor} from './level-generation/types';
import FOV from 'rot-js/lib/fov/fov';

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

        this.world.registerComponent(Position);
        this.world.registerComponent(ActionMove);
        this.world.registerComponent(Renderable);
        this.world.registerComponent(DancingColor);
        this.world.registerComponent(Light);
        this.world.registerComponent(Tile);
        this.world.registerComponent(Map);

        this.world.registerTags(Character.name, PlayerControlled.name);

        const tiles = this.makeMap();
        const dynamicLight: Grid<RGBColor> = new Array(HEIGHT).fill(undefined).map(() => {
            return new Array(WIDTH);
        });
        this.fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            try {
                return !tiles[y][x].getOne(Tile).flags.OBSTRUCTS_VISION;
            } catch (e) {
                debugger;
                return false;
            }
        }, {});
        this.lighting = new ROT.Lighting(
            () => {
                return 1;
            },
            {range: 5, passes: 1}
        );
        this.lighting.setFOV(this.fov);
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
            dynamicLight,
            tiles,
            this.lightColors,
        ]);
        this.world.registerSystem('render', RenderSystem, [this.display, dynamicLight]);
        const player = this.world.createEntity({
            tags: [Character.name, PlayerControlled.name],
            c: {
                Position: {
                    x: 8,
                    y: 12,
                },
                Renderable: {
                    char: '@',
                    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
                    baseFG: {r: 150, g: 150, b: 150, alpha: 1},
                    visible: true,
                },
            },
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
        });
    }

    update(time: number) {
        window.requestAnimationFrame(this.update.bind(this));
        const elapsed = time - this.lastUpdate;
        this.tickTime += elapsed;
        this.lastUpdate = time;
        this.world.runSystems('everyframe');
        this.world.runSystems('render');
        this.world.tick();
    }

    makeMap() {
        this.map = new Uniform(WIDTH, HEIGHT, {});
        const tiles = new Array(HEIGHT).fill(undefined).map(() => new Array(WIDTH).fill(undefined));
        const {dungeon, colorizedDungeon, lightColors} = makeDungeon(WIDTH, HEIGHT);
        this.lightColors = lightColors;
        this.map.create((col, row, contents) => {
            const tile = this.world.createEntity({
                c: {
                    Position: {
                        x: col,
                        y: row,
                    },
                    Renderable: {
                        char: dungeon[row][col].letter,
                        fg: colorizedDungeon[row][col].fg,
                        bg: colorizedDungeon[row][col].bg,
                        baseFG: colorizedDungeon[row][col].fg,
                        baseBG: colorizedDungeon[row][col].bg,
                        visible: false,
                    },
                    Tile: {
                        flags: dungeon[row][col].flags,
                    },
                },
            });
            if (lightColors[row][col]) {
                const light = this.world.createEntity({
                    c: {
                        Light: {
                            base: {...lightColors[row][col]},
                            current: {...lightColors[row][col]},
                        },
                        Position: {
                            x: col,
                            y: row,
                        },
                    },
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
            tiles[row][col] = tile;
        });
        return tiles;
    }
}
