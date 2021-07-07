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
import {HEIGHT, WIDTH} from '../level-generation/constants';

class ActionSystem extends System {
    moveQuery: Query;
    lightColors: Grid<RGBColor>;
    tileMap: Grid<{tile: Entity; light: Entity}>;
    fov: FOV;
    rotLighting: Lighting;
    lastVisible: Record<string, {visible: -1 | 0 | 1; y: number; x: number}>;

    init(
        fov: FOV,
        rotLighting: Lighting,
        tileMap: Grid<{tile: Entity; light: Entity}>,
        lightColors: Grid<RGBColor>
    ) {
        this.lightColors = lightColors;
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
        return !this.tileMap[y]?.[x]?.tile.getOne(Tile).flags.OBSTRUCTS_PASSIBILITY;
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
                console.log(`move to ${pos.y},${pos.x}`);
                this.fov.compute(pos.x, pos.y, WIDTH, (x, y, r, visiblity) => {
                    if (y >= HEIGHT || x >= WIDTH) {
                        return;
                    }
                    newVisible[`${y},${x}`].visible += 1;
                });
                newVisible[`${pos.y},${pos.x}`].visible += 1;
                Object.entries(this.lastVisible).forEach(([cell, {x, y, visible}]) => {
                    const newVisibility = newVisible[`${y},${x}`].visible;
                    const oldVisibility = visible;
                    if (newVisibility > oldVisibility) {
                        // seeing it anew, either from memory or unseeing
                        if (newVisibility === 0) {
                            for (const memory of this.tileMap[y][x].tile.getComponents(Memory)) {
                                memory.destroy();
                                this.tileMap[y][x].tile.removeComponent(memory);
                            }
                        }
                        if (!this.tileMap[y][x].tile.has(Visible)) {
                            this.tileMap[y][x].tile.addComponent({type: Visible});
                        }
                        this.lastVisible[`${y},${x}`].visible = 1;
                    } else if (newVisibility === oldVisibility) {
                        if (newVisibility > 0) {
                            // fading to memory
                            if (this.tileMap[y][x].tile.has(Visible)) {
                                for (const visible of this.tileMap[y][x].tile.getComponents(
                                    Visible
                                )) {
                                    this.tileMap[y][x].tile.removeComponent(visible);
                                }
                                this.tileMap[y][x].tile.addComponent({type: Memory});
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
