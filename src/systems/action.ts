import {Entity, Query, System} from 'ape-ecs';
import {Lighting} from 'rot-js';
import FOV from 'rot-js/lib/fov/fov';
import {
    ActionMove,
    Light,
    Memory,
    PlayerControlled,
    Position,
    Renderable,
    Tile,
    Visible,
} from '../components';
import {CellColorLayer, Grid, LightSource, RGBColor} from '../level-generation/types';
import {cloneDeep} from 'lodash';

class ActionSystem extends System {
    moveQuery: Query;
    lightColors: Grid<RGBColor>;
    tileMap: Grid<Entity>;
    fov: FOV;
    rotLighting: Lighting;
    dynamicLight: Grid<RGBColor>;
    lastVisible: Record<string, {visible: -1 | 0 | 1; y: number; x: number}>;

    init(
        fov: FOV,
        rotLighting: Lighting,
        dynamicLight: Grid<RGBColor>,
        tileMap: Grid<Entity>,
        lightColors: Grid<RGBColor>
    ) {
        this.lightColors = lightColors;
        this.dynamicLight = dynamicLight;
        this.rotLighting = rotLighting;
        this.tileMap = tileMap;
        this.moveQuery = this.createQuery().fromAll(ActionMove, Position);
        this.fov = fov;

        this.lastVisible = tileMap.reduce((acc, row, y) => {
            return Object.assign(
                acc,
                row.reduce((acc, col, x) => {
                    return Object.assign(acc, {[`${y},${x}`]: {visible: 0, y, x}});
                }, {})
            );
        }, {});
    }

    canMove({x, y}: {x: number; y: number}): boolean {
        const tile = this.tileMap[y][x].getOne(Tile);
        return !tile.flags.OBSTRUCTS_PASSIBILITY;
    }

    update(tick: number) {
        const entities = this.moveQuery.refresh().execute();
        for (const entity of entities) {
            const pos = entity.getOne(Position);
            for (const light of entity.getComponents(Light)) {
                entity.removeComponent(light);
            }
            for (const move of entity.getComponents(ActionMove)) {
                const destination = {x: pos.x + move.x, y: pos.y + move.y};
                if (this.canMove(destination)) {
                    pos.update({...destination});
                }
                if (this.lightColors[pos.y][pos.x]) {
                    // adds light to the player. tbd
                    // entity.addComponent({
                    //     type: Light,
                    //     base: {
                    //         ...this.lightColors[pos.y][pos.x],
                    //         alpha: this.lightColors[pos.y][pos.x].alpha,
                    //     },
                    //     current: {
                    //         ...this.lightColors[pos.y][pos.x],
                    //         alpha: this.lightColors[pos.y][pos.x].alpha,
                    //     },
                    // });
                }
                entity.removeComponent(move);
            }

            if (entity.has(PlayerControlled.name)) {
                const newVisible = cloneDeep(this.lastVisible);
                this.fov.compute(pos.x, pos.y, Infinity, (x, y, r, visiblity) => {
                    const renderable = this.tileMap[y][x].getOne(Renderable);
                    newVisible[`${y},${x}`].visible += 1;
                });
                Object.entries(this.lastVisible).forEach(([cell, {x, y, visible}]) => {
                    const newVisibility = newVisible[`${y},${x}`].visible;
                    const oldVisibility = visible;
                    if (y === 15 && x === 20) {
                        debugger;
                    }
                    if (newVisibility > oldVisibility) {
                        // seeing it anew, either from memory or unseeing
                        if (newVisibility === 0) {
                            // console.log(`welcome back! ${y},${x}`);
                            for (const memory of this.tileMap[y][x].getComponents(Memory)) {
                                memory.destroy();
                                this.tileMap[y][x].removeComponent(memory);
                            }
                        }
                        if (newVisibility > 0) {
                            if (!this.tileMap[y][x].has(Visible)) {
                                this.tileMap[y][x].addComponent({type: Visible});
                                // this.tileMap[y][x].addComponent({type: Visible});
                            }
                        }
                        this.lastVisible[`${y},${x}`].visible = 1;
                    } else if (newVisibility === oldVisibility) {
                        if (newVisibility > 0) {
                            // fading to memory
                            if (this.tileMap[y][x].has(Visible)) {
                                // console.log(`goodbye to ${y},${x}`);
                                this.tileMap[y][x].addComponent({type: Memory});
                                // this.tileMap[y][x].removeComponent(Visible.name);
                            }

                            this.lastVisible[`${y},${x}`].visible = -1;
                        }
                    } else {
                        this.lastVisible[`${y},${x}`].visible = 0;
                    }
                });
                // this.lastVisible = cloneDeep(newVisible);
            }
        }
    }
}

export default ActionSystem;
