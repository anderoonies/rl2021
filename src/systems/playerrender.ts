import {Query, System} from 'ape-ecs';
import {Display} from 'rot-js';
import {Character, Position, Renderable} from '../components';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

export default class PlayerRender extends System {
    query: Query;
    display: Display;

    init(display: Display) {
        this.query = this.world.createQuery().fromAll(Character);
        this.display = display;
    }

    update(dt: number) {
        for (const entity of this.query.refresh().execute()) {
            const position = entity.getOne(Position);
            const renderable = entity.getOne(Renderable);
            this.display.draw(
                position.x,
                position.y,
                renderable.char,
                toRGBA([renderable.fg.r, renderable.fg.g, renderable.fg.b, renderable.fg.alpha]),
                toRGBA([renderable.bg.r, renderable.bg.g, renderable.bg.b, renderable.bg.alpha])
            );
        }
    }
}
