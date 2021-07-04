import {defineQuery, defineSystem, enterQuery, IWorld, removeComponent} from 'bitecs';
import {ActionMove, Position} from '../components';
import {Grid, RGBColor} from '../level-generation/types';

const actionQuery = defineQuery([ActionMove, Position]);
export default defineSystem(world => {
    const entered = actionQuery(world);
    for (const eid of entered) {
        Position.x[eid] += ActionMove.x[eid];
        Position.y[eid] += ActionMove.y[eid];
        removeComponent(world, ActionMove, eid);
    }
    return world;
});
