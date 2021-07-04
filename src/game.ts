import * as ROT from 'rot-js';
import {DisplayOptions} from 'rot-js/lib/display/types';

import {
    ActionMove,
    Character,
    PlayerControlled,
    Tile,
    DancingColor,
    Light,
    Position,
    Renderable,
    MapRecord,
} from './components';
const MapComponent = MapRecord(WIDTH, HEIGHT);

import {makeDungeon} from './level-generation/generator';
import {makeNoiseMaps} from './level-generation/color';
import {HEIGHT, WIDTH} from './level-generation/constants';
import Uniform from 'rot-js/lib/map/uniform';
import {AnnotatedCell, CellColor, Grid, RGBColor} from './level-generation/types';
import {addComponent, addEntity, createWorld, defineQuery, IWorld, pipe} from 'bitecs';
import {ActionSystem, RenderSystem} from './systems';

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
    world: IWorld;
    // globalEntity: Entity;
    // mapEntity: Entity;
    lastUpdate: number;
    tickTime: number;
    everyFrame: any;
    render: any;
    // playerQuery: Query;
    map: Uniform;
    lightColors: Grid<RGBColor>;

    constructor(container: HTMLElement, logdiv: HTMLElement, tileSet: HTMLImageElement) {
        this.display = new ROT.Display(options);

        const world = createWorld();
        this.world = world;
        world.time = {
            delta: 0,
            elapsed: 0,
            then: performance.now(),
        };
        world.charMap = new Map();

        this.lastUpdate = performance.now();
        this.tickTime = 0;
        container.appendChild(this.display.getContainer());

        const map = addEntity(world);
        addComponent(world, MapComponent, map);
        this.makeMap(map);
        const mapEntity = addEntity(world);
        this.everyFrame = pipe(ActionSystem);
        this.render = pipe(RenderSystem);
        // this.world.registerSystem('everyframe', ActionSystem, [this.lightColors]);
        // this.world.registerSystem('render', RenderSystem, [this.display]);
        const player = addEntity(world);
        addComponent(world, Character, player);
        addComponent(world, PlayerControlled, player);
        addComponent(world, Position, player);
        addComponent(world, Renderable, player);
        world.charMap.set(player, '@');
        world.display = this.display;
        Position.x[player] = 10;
        Position.y[player] = 10;
        Renderable.baseBG.r[player] = 0;
        Renderable.baseBG.g[player] = 0;
        Renderable.baseBG.b[player] = 0;
        Renderable.baseBG.alpha[player] = 0;
        Renderable.baseFG.r[player] = 255;
        Renderable.baseFG.g[player] = 255;
        Renderable.baseFG.b[player] = 255;
        Renderable.baseFG.alpha[player] = 1;

        const playerQuery = defineQuery([PlayerControlled]);
        window.addEventListener('keydown', e => {
            const entities = playerQuery(world);
            for (const player of entities) {
                switch (e.code) {
                    case 'ArrowUp':
                        addComponent(world, ActionMove, player);
                        ActionMove.x[player] = 0;
                        ActionMove.y[player] = -1;
                        break;
                    case 'ArrowDown':
                        addComponent(world, ActionMove, player);
                        ActionMove.x[player] = 0;
                        ActionMove.y[player] = 1;
                        break;
                    case 'ArrowLeft':
                        addComponent(world, ActionMove, player);
                        ActionMove.x[player] = -1;
                        ActionMove.y[player] = 0;
                        break;
                    case 'ArrowRight':
                        addComponent(world, ActionMove, player);
                        ActionMove.x[player] = 1;
                        ActionMove.y[player] = 0;
                        break;
                    default:
                        console.log(e.code);
                        break;
                }
            }
        });

        this.update(this.lastUpdate);
    }

    update(time: number) {
        window.requestAnimationFrame(this.update.bind(this));
        const now = performance.now();
        const dt = now - this.world.time.then;
        this.world.time.delta = dt;
        this.world.time.elapsed += dt;
        this.world.time.then = now;
        this.everyFrame(this.world);
        this.render(this.world);
    }

    createTile(
        col: number,
        row: number,
        dungeon: Grid<AnnotatedCell>,
        colorizedDungeon: Grid<CellColor>,
        lightColors: Grid<RGBColor>
    ) {
        if (col == 0 && row == 14) {
            debugger;
        }
        const tile = addEntity(this.world);
        addComponent(this.world, Tile, tile);
        addComponent(this.world, Position, tile);
        addComponent(this.world, Renderable, tile);
        Position.x[tile] = col;
        Position.y[tile] = row;
        this.world.charMap.set(tile, dungeon[row][col].letter);
        const baseBG = colorizedDungeon[row][col].bg;
        const baseFG = colorizedDungeon[row][col].fg;
        Renderable.baseBG.r[tile] = baseBG.r;
        Renderable.baseBG.g[tile] = baseBG.g;
        Renderable.baseBG.b[tile] = baseBG.b;
        Renderable.baseBG.alpha[tile] = baseBG.alpha ?? 1;
        Renderable.baseFG.r[tile] = baseFG.r;
        Renderable.baseFG.g[tile] = baseFG.g;
        Renderable.baseFG.b[tile] = baseFG.b;
        Renderable.baseFG.alpha[tile] = baseFG.alpha ?? 1;
        Renderable.bg.r[tile] = baseBG.r;
        Renderable.bg.g[tile] = baseBG.g;
        Renderable.bg.b[tile] = baseBG.b;
        Renderable.bg.alpha[tile] = baseBG.alpha ?? 1;
        Renderable.fg.r[tile] = baseFG.r;
        Renderable.fg.g[tile] = baseFG.g;
        Renderable.fg.b[tile] = baseFG.b;
        Renderable.fg.alpha[tile] = baseFG.alpha ?? 1;

        if (lightColors[row][col]) {
            const light = lightColors[row][col];
            addComponent(this.world, Light, tile);
            Light.r[tile] = light.r;
            Light.g[tile] = light.g;
            Light.b[tile] = light.b;
        }
        if (baseBG.dancing) {
            addComponent(this.world, DancingColor, tile);
            DancingColor.period[tile] = baseBG.dancing.period;
            DancingColor.deviations.r[tile] = baseBG.dancing.deviations.r;
            DancingColor.deviations.g[tile] = baseBG.dancing.deviations.g;
            DancingColor.deviations.b[tile] = baseBG.dancing.deviations.b;
            DancingColor.timer[tile] = baseBG.dancing.period;
        }
        return tile;
    }

    makeMap(map: number) {
        this.map = new Uniform(WIDTH, HEIGHT, {});
        const {dungeon, colorizedDungeon, lightColors} = makeDungeon(WIDTH, HEIGHT);
        this.lightColors = lightColors;
        this.map.create((col, row, contents) => {
            const tile = this.createTile(col, row, dungeon, colorizedDungeon, lightColors);
        });
    }
}
