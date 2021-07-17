import Game, {DEBUG_FLAGS} from '../game';

export const launch = (flags: DEBUG_FLAGS): void => {
    const container = document.getElementById('rot-container');
    const logdiv = document.getElementById('log');
    const tileSet = document.createElement('img');

    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game(container, logdiv, tileSet, flags);
    });
};
