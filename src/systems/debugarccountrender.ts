import {Query, System} from 'ape-ecs';
import {Display} from 'rot-js';
import {DebugPassableArcCounter, Position} from '../components';

export default class DebugArcCountRender extends System {
    query: Query;
    display: Display;

    init(display: Display) {
        this.query = this.createQuery().fromAll(DebugPassableArcCounter);
        this.display = display;
    }

    update(dt: number) {
        const entities = this.query.refresh().execute();
        for (const entity of entities) {
            const p = entity.getOne(Position);
            const arcCounter = entity.getOne(DebugPassableArcCounter);
            this.display.drawOver(
                p.x,
                p.y,
                arcCounter.count.toString(),
                'rgba(255,255,255,1)',
                'rgba(0, 100, 100, 0.5)'
            );
        }
    }
}
