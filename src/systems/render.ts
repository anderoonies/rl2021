import {Color as ROTColor, Display} from 'rot-js';
import * as Color from 'color';
import {Query, System} from 'ape-ecs';

import Position from '../components/position';
import Renderable from '../components/renderable';
import Light from '../components/light';
import {RGBColor} from '../level-generation/types';
import DancingColor from '../components/dancingcolor';

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
        const entities = this.renderQuery.execute();
        const map = this.world.getEntity('map');
        for (const entity of entities) {
            const positions: Set<Position> = entity.getComponents(Position);
            for (const position of positions) {
                let baseFG: RGBColor;
                let baseBG: RGBColor;
                let char;
                for (const renderable of entity.getComponents(Renderable)) {
                    const dancing = entity.getOne(DancingColor);
                    if (renderable.char === '@') {
                        debugger;
                    }
                    if (typeof renderable.baseFG === 'string') {
                        const fgArray = ROTColor.fromString(renderable.baseFG);
                        baseFG = {
                            r: fgArray[0],
                            g: fgArray[1],
                            b: fgArray[2],
                        } as RGBColor;
                    }
                    if (typeof renderable.baseBG === 'string') {
                        const bgArray = ROTColor.fromString(renderable.baseBG);

                        baseBG = {
                            r: bgArray[0],
                            g: bgArray[1],
                            b: bgArray[2],
                        } as RGBColor;
                    }
                    if (typeof renderable.baseFG === 'object') {
                        baseFG = {...renderable.baseFG};
                    }
                    if (typeof renderable.baseBG === 'object') {
                        baseBG = {...renderable.baseBG};
                    }
                    if (dancing) {
                        if (dancing.timer <= 0) {
                            let variation = dancing.deviations;
                            dancing.update({timer: dancing.period});
                            const mixed = ROTColor.randomize(
                                [baseBG.r, baseBG.g, baseBG.b],
                                [variation.r / 2, variation.g / 2, variation.b / 2]
                            );
                            renderable.update({
                                bg: {
                                    r: mixed[0],
                                    g: mixed[1],
                                    b: mixed[2],
                                },
                            });
                        }
                        baseBG = {
                            r: renderable.bg.r,
                            g: renderable.bg.g,
                            b: renderable.bg.b,
                            alpha: renderable.bg.alpha,
                        };
                        baseFG = {
                            r: renderable.fg.r,
                            g: renderable.fg.g,
                            b: renderable.fg.b,
                            alpha: renderable.bg.alpha,
                        };
                        dancing.update({timer: (dancing.timer -= dt)});
                    }
                    char = renderable.char;
                }
                const lights = entity.getComponents(Light);

                for (const light of lights) {
                    baseBG = {
                        r: baseBG.r + light.r,
                        g: baseBG.g + light.g,
                        b: baseBG.b + light.b,
                        alpha: baseBG.alpha,
                    };
                    baseFG = {
                        r: baseFG.r + light.r,
                        g: baseFG.g + light.g,
                        b: baseFG.b + light.b,
                        alpha: baseFG.alpha,
                    };
                }
                this.display.draw(
                    position.x,
                    position.y,
                    char,
                    toRGBA([baseFG.r, baseFG.g, baseFG.b, baseFG.alpha]),
                    toRGBA([baseBG.r, baseBG.g, baseBG.b, baseBG.alpha])
                );
            }
        }
    }
}

export default RenderSystem;
