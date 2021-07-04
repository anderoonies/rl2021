import {TypedComponent} from 'ape-ecs';

export class ActionMove extends TypedComponent({x: 0, y: 0}) {}

export class DancingColor extends TypedComponent({
    deviations: {r: 0, g: 0, b: 0},
    period: 0,
    timer: 0,
}) {}
export class Light extends TypedComponent({
    r: 0,
    g: 0,
    b: 0,
}) {}

export class Position extends TypedComponent({x: 0, y: 0}) {}
export class Renderable extends TypedComponent({
    char: '@',
    baseFG: {r: 0, g: 0, b: 0, alpha: 0},
    fg: {r: 0, g: 0, b: 0, alpha: 0},
    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
    bg: {r: 0, g: 0, b: 0, alpha: 0},
}) {}

export class Map extends TypedComponent({
    tiles: [[]],
}) {}
