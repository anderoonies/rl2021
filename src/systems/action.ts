import {Query, System} from 'ape-ecs';
import ActionMove from '../components/actionmove';
import ColorLayers from '../components/colorlayers';
import Light from '../components/light';
import Position from '../components/position';
import {Grid, LightSource, RGBColor} from '../level-generation/types';

class ActionSystem extends System {
    moveQuery: Query;
    lightColors: Grid<RGBColor>;

    init(lightColors: Grid<RGBColor>) {
        this.lightColors = lightColors;
        this.moveQuery = this.createQuery().fromAny(ActionMove, Position);
    }

    update(tick: number) {
        const entities = this.moveQuery.refresh().execute();
        for (const entity of entities) {
            if (entity.has(ActionMove)) {
                const pos = entity.getOne(Position);
                for (const light of entity.getComponents(Light)) {
                    entity.removeComponent(light);
                }
                for (const move of entity.getComponents(ActionMove)) {
                    pos.update({
                        x: pos.x + move.x,
                        y: pos.y + move.y,
                    });
                    entity.addComponent({type: Light, ...this.lightColors[pos.y][pos.x]});
                    entity.removeComponent(move);
                }
            }
        }
    }
}

export default ActionSystem;
