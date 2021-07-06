import {Component} from 'ape-ecs';

export class ActionMove extends Component({x: 0, y: 0}) {}

export class DancingColor extends Component({
    deviations: {r: 0, g: 0, b: 0},
    period: 0,
    timer: 0,
}) {}
export class Light extends Component({
    base: {r: 0, g: 0, b: 0, alpha: 0},
    current: {r: 0, g: 0, b: 0, alpha: 0},
}) {}

export class Position extends Component({x: 0, y: 0}) {}
export class Renderable extends Component({
    char: '@',
    baseFG: {r: 0, g: 0, b: 0, alpha: 0},
    fg: {r: 0, g: 0, b: 0, alpha: 0},
    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
    bg: {r: 0, g: 0, b: 0, alpha: 0},
}) {}
export class Visible extends Component({}) {}
export class Memory extends Component({}) {}

export class Tile extends Component({
    flags: {
        OBSTRUCTS_PASSIBILITY: false,
        OBSTRUCTS_VISION: false,
    },
}) {}

export class Map extends Component({
    width: 0,
    height: 0,
    tiles: [[]],
}) {}

export class Character extends Component({}) {}
export class PlayerControlled extends Component({}) {}
