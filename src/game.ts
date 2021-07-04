import * as ROT from 'rot-js';
import {DisplayOptions} from 'rot-js/lib/display/types';
import {Entity, Query, World} from 'ape-ecs';

import ActionMove from './components/actionmove';
import Position from './components/position';
import Renderable from './components/renderable';

import ActionSystem from './systems/action';
import RenderSystem from './systems/render';

import {makeDungeon} from './level-generation/generator';
import {makeNoiseMaps} from './level-generation/color';
import {HEIGHT, WIDTH} from './level-generation/constants';
import Uniform from 'rot-js/lib/map/uniform';
import ColorLayers from './components/colorlayers';
import DancingColor from './components/dancingcolor';
import Light from './components/light';
import {Grid, RGBColor} from './level-generation/types';

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
        this.world.registerComponent(ColorLayers);
        this.world.registerComponent(DancingColor);
        this.world.registerComponent(Light);

        this.world.registerTags('Character', 'PlayerControlled', 'Tile');

        this.makeMap();
        this.mapEntity = this.world.createEntity({
            id: 'map',
            Map: {
                width: WIDTH,
                height: HEIGHT,
                map: this.map,
            },
        });
        this.world.registerSystem('everyframe', ActionSystem, [this.lightColors]);
        this.world.registerSystem('render', RenderSystem, [this.display]);
        const player = this.world.createEntity({
            tags: ['Character', 'PlayerControlled'],
            c: {
                Position: {
                    x: 10,
                    y: 10,
                },
                Renderable: {
                    char: '@',
                    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
                    baseFG: {r: 150, g: 150, b: 150, alpha: 1},
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
        const {dungeon, colorizedDungeon, lightColors} = makeDungeon(WIDTH, HEIGHT);
        this.lightColors = lightColors;
        this.map.create((col, row, contents) => {
            if (row == 4 && col == 10) {
                debugger;
            }
            const tile = this.world.createEntity({
                tags: ['Tile'],
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
                    },
                },
            });
            if (lightColors[row][col]) {
                tile.addComponent({
                    type: Light,
                    ...lightColors[row][col],
                });
            }
            if (colorizedDungeon[row][col].fg.dancing) {
                tile.addComponent({
                    type: DancingColor,
                    period: colorizedDungeon[row][col].fg.dancing.period,
                    deviations: colorizedDungeon[row][col].fg.dancing.deviations,
                    timer: Math.random() * colorizedDungeon[row][col].fg.dancing.period,
                });
            }
        });
    }
}
