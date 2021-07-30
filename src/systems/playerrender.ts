import {Query, System} from 'ape-ecs';
import {Display} from 'rot-js';
import {Creature, Position, Renderable, Visible} from '../components';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

export default class CreatureRender extends System {
    query: Query;
    display: Display;

    init(display: Display) {
        this.query = this.world.createQuery().fromAll(Creature, Position, Visible);
        this.display = display;
    }

    update(dt: number) {
        for (const entity of this.query.refresh().execute()) {
            const position = entity.getOne(Position);
            const renderable = entity.getOne(Renderable);
            const existingData = this.display._data[`${position.x},${position.y}`];
            let bg;

            this.display.drawOver(
                position.x,
                position.y,
                renderable.char,
                toRGBA([renderable.fg.r, renderable.fg.g, renderable.fg.b, renderable.fg.alpha]),
                null
            );
        }
    }
}
