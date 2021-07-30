import {Entity, Query, System} from 'ape-ecs';
import {Color as ROTColor} from 'rot-js';
import {DancingColor, Renderable} from '../components';
import {Grid} from '../level-generation/types';
import {randomRange} from '../level-generation/utils';

export default class DancingColorUpdate extends System {
    dancerQuery: Query;
    tiles: Grid<{tile: Entity; light: Entity; monster?: Entity}>;

    init(tiles: Grid<{tile: Entity; light: Entity; monster?: Entity}>) {
        this.dancerQuery = this.createQuery().fromAll(DancingColor, Renderable);
        this.tiles = tiles;
    }

    update(tick: number) {
        const entities = this.dancerQuery.refresh().execute();
        for (const entity of entities) {
            const dancingColor = entity.getOne(DancingColor);
            const renderable = entity.getOne(Renderable);

            let fg = {
                ...renderable.baseFG,
            };
            let bg = {
                ...renderable.baseBG,
            };
            if (dancingColor) {
                if (dancingColor.timer <= 0) {
                    const dancingDeviations = {
                        ...dancingColor.deviations,
                    };
                    dancingColor.update({timer: dancingColor.period});
                    const mixedBG = ROTColor.add(
                        [bg.r, bg.g, bg.b],
                        [
                            randomRange(0, dancingDeviations.bg.r + dancingDeviations.bg.overall),
                            randomRange(0, dancingDeviations.bg.g + dancingDeviations.bg.overall),
                            randomRange(0, dancingDeviations.bg.b + dancingDeviations.bg.overall),
                        ]
                    );
                    const mixedFG = ROTColor.add(
                        [fg.r, fg.g, fg.b],
                        [
                            randomRange(0, dancingDeviations.fg.r + dancingDeviations.fg.overall),
                            randomRange(0, dancingDeviations.fg.g + dancingDeviations.fg.overall),
                            randomRange(0, dancingDeviations.fg.b + dancingDeviations.fg.overall),
                        ]
                    );
                    renderable.update({
                        bg: {
                            r: mixedBG[0],
                            g: mixedBG[1],
                            b: mixedBG[2],
                        },
                        fg: {
                            r: mixedFG[0],
                            g: mixedFG[1],
                            b: mixedFG[2],
                        },
                    });
                }
                fg = {
                    ...renderable.fg,
                };
                bg = {
                    ...renderable.bg,
                };
                dancingColor.update({timer: Math.random() * dancingColor.period});
            }

            dancingColor.update({timer: dancingColor.timer - tick / 2});
        }
    }
}
