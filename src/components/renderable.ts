import {TypedComponent} from 'ape-ecs';
import * as Color from 'color';

class Renderable extends TypedComponent({
    char: '@',
    baseFG: {r: 0, g: 0, b: 0, alpha: 0},
    fg: {r: 0, g: 0, b: 0, alpha: 0},
    baseBG: {r: 0, g: 0, b: 0, alpha: 0},
    bg: {r: 0, g: 0, b: 0, alpha: 0},
}) {}

export default Renderable;
