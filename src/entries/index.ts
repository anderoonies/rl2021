import Game, {DEBUG_FLAGS} from '../game';

export const launch = (containerID: string, flags: DEBUG_FLAGS): void => {
    const container = document.getElementById(containerID);
    const logdiv = document.getElementById('log');
    const tileSet = document.createElement('img');

    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game(container, logdiv, tileSet, flags);
    });
};
