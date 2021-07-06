import {Entity, Query, System} from 'ape-ecs';
import {Lighting} from 'rot-js';
import FOV from 'rot-js/lib/fov/fov';
import {ActionMove, Light, PlayerControlled, Position, Renderable, Tile} from '../components';
import {CellColorLayer, Grid, LightSource, RGBColor} from '../level-generation/types';

class ActionSystem extends System {
    moveQuery: Query;
    lightColors: Grid<RGBColor>;
    tileMap: Grid<Entity>;
    fov: FOV;
    rotLighting: Lighting;
    dynamicLight: Grid<RGBColor>;

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
                    debugger;
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
                this.fov.compute(pos.x, pos.y, Infinity, (x, y, r, visiblity) => {
                    const renderable = this.tileMap[y][x].getOne(Renderable);
                    renderable.update({visible: true});
                });
                // this.rotLighting.setFOV(this.fov);
                // this.rotLighting.clearLights();
                // this.rotLighting.reset();
                // this.rotLighting.setLight(pos.x, pos.y, [240, 240, 240]);
                // this.rotLighting.compute((x, y, color) => {
                //     this.dynamicLight[y][x] = {r: color[0], g: color[1], b: color[2]};
                // });
            }
        }
    }
}

export default ActionSystem;
