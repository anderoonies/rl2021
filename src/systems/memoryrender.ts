import {Query, System} from 'ape-ecs';
import {Color, Display} from 'rot-js';
import {Light, Memory, Position, Renderable, Visible} from '../components';
import {Grid, RGBColor} from '../level-generation/types';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

class MemoryRenderSystem extends System {
    memoryRender: Query;
    display: Display;

    init(display: Display, dynamicLight: Grid<RGBColor>) {
        this.memoryRender = this.createQuery().fromAll(Renderable, Memory, Position).not(Light, Visible);
        this.display = display;
    }

    update(dt: number) {
        const renderableEntities = this.memoryRender.refresh().execute();
        for (const entity of renderableEntities) {
            let fg;
            let bg;
            let char;

            const position = entity.getOne(Position);
            const renderable = entity.getOne(Renderable);
            
            fg = {
                ...renderable.baseFG,
            };
            bg = {
                ...renderable.baseBG,
            };
            char = renderable.char;

            this.display.draw(
                position.x,
                position.y,
                char,
                toRGBA(Color.multiply_([fg.r, fg.g, fg.b], [100, 100, 100])),
                toRGBA(Color.multiply_([bg.r, bg.g, bg.b], [100, 100, 100]))
            );
        }
    }
}

export default MemoryRenderSystem;
