import {Display} from 'rot-js';
import {Query, System} from 'ape-ecs';

import Position from '../components/position';
import Renderable from '../components/renderable';

class RenderSystem extends System {
    renderQuery: Query;
    display: Display;

    init(display: Display) {
        this.renderQuery = this.createQuery().fromAll('Renderable', 'Position');
        this.display = display;
    }
    update(tick: number) {
        const entities = this.renderQuery.execute();
        for (const entity of entities) {
            const positions: Set<Position> = entity.getComponents('Position');
            for (const position of positions) {
                for (const renderable of entity.getComponents('Renderable')) {
                    this.display.draw(
                        position.x,
                        position.y,
                        renderable.char,
                        renderable.fg,
                        renderable.bg
                    );
                }
            }
        }
    }
}

export default RenderSystem;
