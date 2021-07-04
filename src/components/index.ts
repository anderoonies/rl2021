import {defineComponent, Types} from 'bitecs';
export const ActionMove = defineComponent({
    x: Types.i8,
    y: Types.i8,
});
export const DancingColor = defineComponent({
    deviations: {r: Types.i32, g: Types.i32, b: Types.i32},
    period: Types.f32,
    timer: Types.f32,
});
export const Light = defineComponent({
    r: Types.i8,
    g: Types.i8,
    b: Types.i8,
});
export const Position = defineComponent({
    x: Types.i8,
    y: Types.i8,
    other: {x: Types.i8},
});
export const Renderable = defineComponent({
    baseFG: {r: Types.i16, g: Types.i16, b: Types.i16, alpha: Types.i16},
    fg: {r: Types.i16, g: Types.i16, b: Types.i16, alpha: Types.i16},
    baseBG: {r: Types.i16, g: Types.i16, b: Types.i16, alpha: Types.i16},
    bg: {r: Types.i16, g: Types.i16, b: Types.i16, alpha: Types.i16},
});
export const MapRecord = (width: number, height: number) => {
    return defineComponent({
        tileMap: [[Types.i16, width], height],
    });
};

export const Character = defineComponent();
export const PlayerControlled = defineComponent();
export const Tile = defineComponent();
