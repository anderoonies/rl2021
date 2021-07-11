import {Query, System} from 'ape-ecs';
import {Color as ROTColor, Display} from 'rot-js';
import {Color} from 'rot-js/lib/color';
import {DancingColor, Light, Position, Visible} from '../components';

export default class LightRender extends System {
    lightQuery: Query;
    display: Display;

    init(display: Display) {
        this.lightQuery = this.world.createQuery().fromAll(Light, Position);
        this.display = display;
    }

    update(dt: number) {
        for (const entity of this.lightQuery.refresh().execute()) {
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
            const lightValue = [light.current.r, light.current.g, light.current.b]
                .map(c => c * 20)
                .map(Math.floor) as Color;
            const [_, __, ch, existingFG, existingBG] =
                this.display._data[`${position.x},${position.y}`];
            let existingFGColor = ROTColor.fromString(existingFG);
            let existingBGColor = ROTColor.fromString(existingBG);
            let resultingFG = ROTColor.add(existingFGColor, lightValue);
            let resultingBG = ROTColor.add(existingBGColor, lightValue);
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
