import {Component} from 'ape-ecs';

class Renderable extends Component {
    static properties = {
        char: '@',
        fg: 'white',
        bg: 'black',
    };
}

export default Renderable;
