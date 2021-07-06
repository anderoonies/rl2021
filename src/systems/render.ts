import {Color as ROTColor, Display} from 'rot-js';
import {Entity, Query, System} from 'ape-ecs';

import {
    Position,
    Renderable,
    Light,
    DancingColor,
    Memory,
    Visible,
    Character,
    Tile,
} from '../components';
import {Grid, RGBColor} from '../level-generation/types';
import {Color} from 'rot-js/lib/color';

const toRGBA = ([r, g, b, a]: [number, number, number, number?]) => {
    if (a !== undefined) {
        return `rgb(${r},${g},${b},${a})`;
    } else {
        return `rgb(${r},${g},${b})`;
    }
};

class RenderSystem extends System {
    mainRenderQuery: Query;
    lightQuery: Query;
    display: Display;
    dynamicLight: Grid<RGBColor>;

    init(display: Display, dynamicLight: Grid<RGBColor>) {
        this.mainRenderQuery = this.createQuery().fromAll(Renderable, Position).not(Light);
        this.lightQuery = this.createQuery().fromAll(Light, Position);
        this.display = display;
        this.dynamicLight = dynamicLight;
    }

    update(dt: number) {
        const renderableEntities = this.mainRenderQuery.refresh().execute();
        for (const entity of renderableEntities) {
            let fg;
            let bg;
            let char;

            const position = entity.getOne(Position);
            const renderable = entity.getOne(Renderable);
            const visible = entity.getOne(Visible);
            const memory = entity.getOne(Memory);
            const character = entity.getOne(Character);

            if (memory) {
                this.display.draw(
                    position.x,
                    position.y,
                    renderable.char,
                    toRGBA(
                        ROTColor.multiply_(
                            [renderable.fg.r, renderable.fg.g, renderable.fg.b],
                            [100, 100, 100]
                        )
                    ),
                    toRGBA(
                        ROTColor.multiply_(
                            [renderable.bg.r, renderable.bg.g, renderable.bg.b],
                            [100, 100, 100]
                        )
                    )
                );
                continue;
            }

            if (!visible && !character) {
                this.display.draw(position.x, position.y, ' ', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)');
                continue;
            }

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
                dancingColor.update({timer: dancingColor.timer - dt / 2});
            }
            if (this.dynamicLight[position.y][position.x]) {
                const dl = this.dynamicLight[position.y][position.x];
                fg = {
                    r: fg.r + dl.r,
                    g: fg.g + dl.g,
                    b: fg.b + dl.b,
                };
                bg = {
                    r: bg.r + dl.r,
                    g: bg.g + dl.g,
                    b: bg.b + dl.b,
                };
            }
            this.display.draw(
                position.x,
                position.y,
                char,
                toRGBA([fg.r, fg.g, fg.b, fg.alpha]),
                toRGBA([bg.r, bg.g, bg.b, bg.alpha])
            );
        }

        for (const entity of this.lightQuery.execute()) {
            const position = entity.getOne(Position);
            const light = entity.getOne(Light);
            const dancing = entity.getOne(DancingColor);
            if (dancing) {
                if (dancing.timer <= 0) {
                    dancing.update({timer: dancing.period});
                    const mixed = ROTColor.randomize(
                        [light.base.r, light.base.g, light.base.b],
                        [
                            dancing.deviations.r / 2,
                            dancing.deviations.g / 2,
                            dancing.deviations.b / 2,
                        ]
                    );
                    light.update({
                        current: {r: mixed[0], g: mixed[1], b: mixed[2], alpa: light.base.alpha},
                    });
                }
                dancing.update({timer: dancing.timer - dt});
            }
            const lightValue = [light.current.r, light.current.g, light.current.b].map(
                Math.floor
            ) as Color;
            const [_, __, ch, existingFG, existingBG] =
                this.display._data[`${position.x},${position.y}`];
            let existingFGColor = ROTColor.fromString(existingFG);
            let existingBGColor = ROTColor.fromString(existingBG);
            let resultingFG = ROTColor.add(existingFGColor, lightValue);
            let resultingBG = ROTColor.add(existingBGColor, lightValue);
            // @ts-ignore
            this.display.draw(
                position.x,
                position.y,
                ch,
                ROTColor.toRGB(resultingFG),
                ROTColor.toRGB(resultingBG)
            );
        }
    }
}

export default RenderSystem;
