import Game from './game';

const container = document.getElementById('rot-container');
const logdiv = document.getElementById('log');
const tileSet = document.createElement('img');

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game(container, logdiv, tileSet);
});