import {Color as ROTColor, Display} from 'rot-js';
import {RGBColor} from '../level-generation/types';
import * as Color from 'color';
import {Changed, defineQuery, defineSystem, hasComponent} from 'bitecs';
import {DancingColor, Light, Position, Renderable} from '../components';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

const renderableQuery = defineQuery([Renderable, Position]);
export default defineSystem(world => {
    const renderableEntities = renderableQuery(world);
    let char;
    let fg;
    let bg;
    for (const eid of renderableEntities) {
        fg = {
            r: Renderable.baseFG.r[eid],
            g: Renderable.baseFG.g[eid],
            b: Renderable.baseFG.b[eid],
            alpha: Renderable.baseFG.alpha[eid],
        };
        bg = {
            r: Renderable.baseBG.r[eid],
            g: Renderable.baseBG.g[eid],
            b: Renderable.baseBG.b[eid],
            alpha: Renderable.baseBG.alpha[eid],
        };
        char = world.charMap.get(eid);
        if (char === '@') {
            debugger;
        }
        if (hasComponent(world, DancingColor, eid)) {
            const dancingTimer = DancingColor.timer[eid];
            const dancingPeriod = DancingColor.period[eid];
            if (dancingTimer <= 0) {
                const dancingDeviations = {
                    r: DancingColor.deviations.r[eid],
                    g: DancingColor.deviations.g[eid],
                    b: DancingColor.deviations.b[eid],
                };
                DancingColor.timer[eid] = DancingColor.period[eid];
                const mixed = ROTColor.randomize(
                    [bg.r, bg.g, bg.b],
                    [dancingDeviations.r / 2, dancingDeviations.g / 2, dancingDeviations.b / 2]
                );
                Renderable.bg.r[eid] = mixed[0];
                Renderable.bg.g[eid] = mixed[1];
                Renderable.bg.b[eid] = mixed[2];
            }
            fg = {
                r: Renderable.fg.r[eid],
                g: Renderable.fg.g[eid],
                b: Renderable.fg.b[eid],
            };
            bg = {
                r: Renderable.bg.r[eid],
                g: Renderable.bg.g[eid],
                b: Renderable.bg.b[eid],
            };
            DancingColor.timer[eid] -= world.time.delta;
        }
        if (hasComponent(world, Light, eid)) {
            bg = {
                r: bg.r + Light.r[eid],
                g: bg.g + Light.g[eid],
                b: bg.b + Light.b[eid],
                alpha: bg.alpha,
            };
            fg = {
                r: fg.r + Light.r[eid],
                g: fg.g + Light.g[eid],
                b: fg.b + Light.b[eid],
                alpha: fg.alpha,
            };
        }
        debugger;
        world.display.draw(
            Position.x[eid],
            Position.y[eid],
            char,
            toRGBA([fg.r, fg.g, fg.b, fg.alpha]),
            toRGBA([bg.r, bg.g, bg.b, bg.alpha])
        );
    }
    return world;
});
