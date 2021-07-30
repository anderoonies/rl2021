import {Query, System} from 'ape-ecs';
import {Display} from 'rot-js';
import {Creature, Light, Memory, Position, Renderable, Visible} from '../components';
import type {DEBUG_FLAGS} from '../game';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

class RenderSystem extends System {
    mainRenderQuery: Query;
    display: Display;
    DEBUG_FLAGS: DEBUG_FLAGS;

    init(display: Display, DEBUG_FLAGS: DEBUG_FLAGS) {
        this.mainRenderQuery = this.createQuery()
            .fromAll(Renderable, Position, Visible)
            .not(Light, Creature);
        if (!DEBUG_FLAGS.OMNISCIENT) {
            this.mainRenderQuery = this.mainRenderQuery.not(Memory);
        }
        this.display = display;
    }

    update(dt: number) {
        const renderableEntities = this.mainRenderQuery.refresh().execute();
        for (const entity of renderableEntities) {
            let fg;
            let bg;
            let char;

            const position = entity.getOne(Position);
            const renderable = entity.getOne(Renderable);

            (fg = renderable.fg), (bg = renderable.bg);
            char = renderable.char;
            this.display.draw(
                position.x,
                position.y,
                char,
                toRGBA([fg.r, fg.g, fg.b, fg.alpha]),
                toRGBA([bg.r, bg.g, bg.b, bg.alpha])
            );
        }
    }
}

export default RenderSystem;
