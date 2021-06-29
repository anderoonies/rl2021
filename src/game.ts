import * as ROT from 'rot-js';
import { DisplayOptions } from 'rot-js/lib/display/types';
import { Entity, Query, World } from 'ape-ecs';

import ActionMove from './components/actionmove';
import Position from './components/position';
import Renderable from './components/renderable';

import ActionSystem from './systems/action';
import RenderSystem from './systems/render';

const options: Partial<DisplayOptions> = {
    // layout: "tile",
    bg: "black",
    tileWidth: 16,
    tileHeight: 16,
    tileSet: null,
    tileMap: {
    },
    tileColorize: true,
    width: 40,
    height: 40
};

export default class Game {
    display: ROT.Display;
    world: World;
    globalEntity: Entity;
    lastUpdate: number;
    tickTime: number;
    playerQuery: Query;

    constructor(container: HTMLElement, logdiv: HTMLElement, tileSet: HTMLImageElement) {
        this.display = new ROT.Display(options);
        this.world = new World();

        this.lastUpdate = performance.now();
        this.tickTime = 0;
        this.update(this.lastUpdate);
        container.appendChild(this.display.getContainer());

        this.world.registerComponent(Position);
        this.world.registerComponent(ActionMove);
        this.world.registerComponent(Renderable);
        this.world.registerTags('Character', 'PlayerControlled');
        this.world.registerSystem('everyframe', ActionSystem);
        this.world.registerSystem('render', RenderSystem, [this.display]);
        const player = this.world.createEntity({
            tags: ['Character', 'PlayerControlled'],
            c: {
                Position: {
                    x: 10,
                    y: 10,
                },
                Renderable: {
                    char: '@',
                },
            }
        })

        this.playerQuery = this.world.createQuery().fromAll('PlayerControlled');
        window.addEventListener('keydown', (e) => {
            const entities = this.playerQuery.refresh().execute();
            for (const player of entities) {
                switch (e.code) {
                    case 'ArrowUp':
                        player.addComponent({
                            type: 'ActionMove',
                            y: -1
                        });
                        break;
                    case 'ArrowDown':
                        player.addComponent({
                            type: 'ActionMove',
                            y: 1
                        });
                        break;
                    case 'ArrowLeft':
                        player.addComponent({
                            type: 'ActionMove',
                            x: -1
                        });
                        break;
                    case 'ArrowRight':
                        player.addComponent({
                            type: 'ActionMove',
                            x: 1
                        });
                        break;
                }
            }
        });

    }

    update(time: number) {
        window.requestAnimationFrame(this.update.bind(this));
        const elapsed = time - this.lastUpdate;
        this.tickTime += elapsed;
        this.lastUpdate = time;
        this.world.runSystems('everyframe');
        this.world.runSystems('render');
        this.world.tick();
    }
}