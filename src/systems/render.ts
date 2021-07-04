import {Color as ROTColor, Display} from 'rot-js';
import * as Color from 'color';
import {Query, System} from 'ape-ecs';

import {Position, Renderable, Light, DancingColor} from '../components';
import {RGBColor} from '../level-generation/types';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

class RenderSystem extends System {
    renderQuery: Query;
    display: Display;

    init(display: Display) {
        this.renderQuery = this.createQuery()
            .fromAll(Renderable, Position)
            .fromAny(DancingColor, Light);
        this.display = display;
    }

    update(dt: number) {
        const renderableEntities = this.renderQuery.execute();
        for (const entity of renderableEntities) {
            let fg;
            let bg;
            let char;

            let renderable = entity.getOne(Renderable);
            fg = {
                ...renderable.baseFG,
            };
            bg = {
                ...renderable.baseBG,
            };
            char = renderable.char;
            let dancingColor = entity.getOne(DancingColor);
            if (dancingColor) {
                if (dancingColor.timer <= 0) {
                    const dancingDeviations = {
                        ...dancingColor.deviations,
                    };
                    dancingColor.update({timer: dancingColor.period});
                    const mixed = ROTColor.randomize(
                        [bg.r, bg.g, bg.b],
                        [dancingDeviations.r / 2, dancingDeviations.g / 2, dancingDeviations.b / 2]
                    );
                    renderable.update({
                        bg: {
                            r: mixed[0],
                            g: mixed[1],
                            b: mixed[2],
                        },
                    });
                }
                fg = {
                    ...renderable.fg,
                };
                bg = {
                    ...renderable.bg,
                };
                dancingColor.timer -= dt;
            }
            const lights = entity.getComponents(Light);
            if (lights) {
                for (const light of lights) {
                    bg = {
                        r: bg.r + light.r,
                        g: bg.g + light.g,
                        b: bg.b + light.b,
                        alpha: bg.alpha,
                    };
                    fg = {
                        r: fg.r + light.r,
                        g: fg.g + light.g,
                        b: fg.b + light.b,
                        alpha: fg.alpha,
                    };
                }
            }
            const position = entity.getOne(Position);
            this.display.draw(
                position.x,
                position.y,
                char,
                toRGBA([fg.r, fg.g, fg.b, fg.alpha]),
                toRGBA([bg.r, bg.g, bg.b, bg.alpha])
            );
        }
    }
}

export default RenderSystem;
