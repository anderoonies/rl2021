import { Query, System } from "ape-ecs";

class ActionSystem extends System {
    moveQuery: Query;

    init() {
        this.moveQuery = this.createQuery().fromAll('ActionMove', 'Position');
    }

    update(tick: number) {
        const entities = this.moveQuery.refresh().execute();
        for (const entity of entities) {
            const pos = entity.getOne('Position');
            for (const move of entity.getComponents('ActionMove')) {
                pos.update({
                    x: pos.x + move.x,
                    y: pos.y + move.y
                });
                entity.removeComponent(move);
            }
        }
    }
}

export default ActionSystem;