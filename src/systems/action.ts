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
import {CELL_FLAGS, HEIGHT, WIDTH} from '../level-generation/constants';

class ActionSystem extends System {
    moveQuery: Query;
    lightColors: Grid<RGBColor>;
    tileMap: Grid<{tile: Entity; light: Entity; monster: Entity}>;
    fov: FOV;
    rotLighting: Lighting;
    lastVisible: Record<string, {visible: -1 | 0 | 1; y: number; x: number}>;

    init(
        fov: FOV,
        rotLighting: Lighting,
        tileMap: Grid<{tile: Entity; light: Entity; monster: Entity}>,
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

    canMove(source: {x: number; y: number}, destination: {x: number; y: number}): boolean {
        const destinationBlocked =
            this.tileMap[destination.y]?.[destination.x]?.tile.getOne(Tile).flags &
            CELL_FLAGS.OBSTRUCTS_PASSIBILITY;
        // imagine
        const oneComponentBlocked =
            this.tileMap[destination.y]?.[source.x]?.tile.getOne(Tile).flags &
                CELL_FLAGS.OBSTRUCTS_PASSIBILITY ||
            this.tileMap[source.y]?.[destination.x]?.tile.getOne(Tile).flags &
                CELL_FLAGS.OBSTRUCTS_PASSIBILITY;
        return !(destinationBlocked || oneComponentBlocked);
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
                if (this.canMove({x: pos.x, y: pos.y}, destination)) {
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
                    if (y >= HEIGHT || x >= WIDTH || x < 0 || y < 0) {
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
                        Object.entries(this.tileMap[y][x]).forEach(([type, entity]) => {
                            if (!entity) {
                                return;
                            }
                            if (newVisibility === 0) {
                                for (const memory of entity.getComponents(Memory)) {
                                    memory.destroy();
                                    entity.removeComponent(memory);
                                }
                            }
                            if (!entity.has(Visible)) {
                                entity.addComponent({type: Visible});
                            }
                            if (!entity?.has(Visible)) {
                                entity?.addComponent({type: Visible});
                            }
                        });
                        this.lastVisible[`${y},${x}`].visible = 1;
                    } else if (newVisibility === oldVisibility) {
                        if (newVisibility > 0) {
                            // fading to memory
                            Object.entries(this.tileMap[y][x]).forEach(([type, entity]) => {
                                if (!entity) {
                                    return;
                                }
                                if (entity.has(Visible)) {
                                    for (const visible of entity.getComponents(Visible)) {
                                        entity.removeComponent(visible);
                                    }
                                    entity.addComponent({type: Memory});
                                }
                            });

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
