// 1. mark all nodes as unvisited, create a set of unvisted nodes
// 2. assign every node a tentative distance. 0 for current, inf for others. mark initial as current
// 3. for current node, consider all unvisited neighbors and calc tentative distance. mark distance of all nodes to the min of previous or just-calculated
// 4. when all unvisited neighbors of current node visited, mark current node as visited and remove it from unvisited set.
// 5. if the destination node has been marked as visited, or the minimum tentative distance among nodes in the unvisited set is inf (unreachable), alg has finished
// 6. select the minimum tentative distance unvisited node.

import {DIR_TO_TRANSFORM, CELL_TYPES} from './constants';
import {annotateCells} from './generator';
import {coordinatesAreInMap} from './utils';
import {DungeonGrid, AnnotatedCell} from './types';

type DNode = {
    x: number;
    y: number;
    visited: boolean;
    fDistance: number;
    gDistance: number;
    accessible: boolean;
    parent?: DNode;
};

type NodeMap = Array<Array<DNode>>;
const dungeonToNodeMap = ({
    dungeon,
    inaccessible,
}: {
    dungeon: DungeonGrid<AnnotatedCell>;
    inaccessible: (a: AnnotatedCell) => boolean;
}): NodeMap => {
    return dungeon.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
            // 2. assign every node a tentative distance. 0 for current, inf for others. mark initial as current
            // debugger;
            return {
                x: colIndex,
                y: rowIndex,
                visited: false,
                fDistance: Infinity,
                gDistance: Infinity,
                accessible: !inaccessible(dungeon[rowIndex][colIndex]),
                parent: undefined,
            };
        });
    });
};

const getNeighbors = (
    {row, col, nodeMap}: {row: number; col: number; nodeMap: NodeMap},
    revisit = false
) => {
    let neighbors = [];
    let transform;
    let candidateNeighbor;
    for (let direction = 0; direction < 4; direction++) {
        transform = DIR_TO_TRANSFORM[direction];
        const y = row + transform.y;
        const x = col + transform.x;
        if (!coordinatesAreInMap(y, x)) {
            continue;
        }
        candidateNeighbor = nodeMap[y][x];
        if (candidateNeighbor.accessible && (revisit || !candidateNeighbor.visited)) {
            neighbors.push(candidateNeighbor);
        }
    }
    return neighbors;
};

const heuristic = (node: DNode, target: DNode) => {
    return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
};

export const pathDistance = ({
    start,
    end,
    dungeon,
    inaccessible,
}: {
    start: DNode;
    end: DNode;
    dungeon: DungeonGrid<AnnotatedCell>;
    inaccessible: (a: AnnotatedCell) => boolean;
}) => {
    // 1. mark all nodes as visited, create a set of unvisited nodes
    let nodeMap = dungeonToNodeMap({dungeon, inaccessible});
    let currentNode = nodeMap[start.y][start.x];
    let destinationNode = nodeMap[end.y][end.x];
    let candidateNextNode = destinationNode;
    currentNode.gDistance = 0;
    currentNode.fDistance = 0 + heuristic(currentNode, end);
    currentNode.visited = true;
    let unvisitedNodes = {
        [`${start.y},${start.x}`]: start,
    };

    let neighbors;
    let tentativeGDistance;
    let nodeKey;

    while (Object.keys(unvisitedNodes).length) {
        // CHECK THIS!
        if (currentNode === destinationNode || currentNode.fDistance === Infinity) {
            return {distance: currentNode.gDistance, nodeMap};
        }

        currentNode.visited = true;
        delete unvisitedNodes[`${currentNode.y},${currentNode.x}`];

        neighbors = getNeighbors({
            row: currentNode.y,
            col: currentNode.x,
            nodeMap,
        });
        for (let neighbor of neighbors) {
            // WE'RE A-STAR NOW!!
            tentativeGDistance = currentNode.gDistance + 1;
            if (tentativeGDistance < neighbor.gDistance) {
                neighbor.gDistance = tentativeGDistance;
                neighbor.fDistance = tentativeGDistance + heuristic(neighbor, destinationNode);
                neighbor.parent = currentNode;
                nodeKey = `${neighbor.y},${neighbor.x}`;
                if (!(nodeKey in unvisitedNodes)) {
                    unvisitedNodes[nodeKey] = neighbor;
                }
            }
        }

        currentNode = Object.values(unvisitedNodes)
            .sort((a, b) => {
                if (a.fDistance < b.fDistance) {
                    return -1;
                } else if (b.fDistance < a.fDistance) {
                    return 1;
                }
                return 0;
            })
            .shift();
    }
    return {distance: Infinity, nodeMap: 'ya baby'};
};

// export const traceShortestPath = (annotatedNodeMap, start, end) => {
//     let currentNode = annotatedNodeMap[end.y][end.x];
//     let startNode = annotatedNodeMap[start.y][start.x];
//     let path = [currentNode];
//     while (currentNode !== startNode) {
//         currentNode = currentNode.parent;
//         path.push(currentNode);
//     }
//     return path;
// };

// export const propagateShortcut = ({ nodeMap, start }) => {
//     // this algorithm doesnt work! i thought it would!
//     let currentNode = nodeMap[start.y][start.x];
//     currentNode.gDistance = 0;
//     currentNode.fDistance = heuristic(currentNode, destinationNode);
//     currentNode.visited = true;
//     let neighbors;
//     let distance;
//     let unvisitedNodes = [currentNode];
//
//     console.log(`propagating shortcut from ${start}`);
//     debugger;
//     while (unvisitedNodes.length) {
//         currentNode = unvisitedNodes.pop();
//         for (let neighbor of getNeighbors(
//             { row: currentNode.y, col: currentNode.x, nodeMap },
//             true
//         )) {
//             // 3. for current node, consider all unvisited neighbors and calc tentative distance. mark distance of all nodes to the min of previous or just-calculated
//             distance = currentNode.distance + heuristic(neighbor);
//             if (distance < neighbor.distance) {
//                 neighbor.distance = currentNode.distance;
//                 neighbor.parent = currentNode;
//                 console.log(`i reduced the distance to ${neighbor}!`);
//                 unvisitedNodes.push(neighbor);
//             }
//         }
//     }
//     return nodeMap;
// };
