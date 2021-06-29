import { Component } from "ape-ecs";

class Renderable extends Component { };
Renderable.properties = {
    char: '@',
    fg: 'white',
    bg: 'black'
};

export default Renderable;