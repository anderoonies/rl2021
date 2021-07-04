import {TypedComponent} from 'ape-ecs';

export default class DancingColor extends TypedComponent({
    deviations: {r: 0, g: 0, b: 0},
    period: 0,
    timer: 0,
}) {}
