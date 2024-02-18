import { roadGraph } from './roads.mjs';
import { VillageState, runRobot } from './state.mjs';
import randomItem from 'random-item';
import dijkstrajs from 'dijkstrajs';
const { find_path } = dijkstrajs;

export function randomRobot(state) {
    return { direction: randomItem(Object.keys(roadGraph[state.place])) };
}

console.log('randomRobot');
runRobot(VillageState.random(), randomRobot);

const mailRoute = [
    'Alice\'s House',
    'Cabin',
    'Alice\'s House',
    'Bob\'s House',
    'Town Hall',
    'Daria\'s House',
    'Ernie\'s House',
    'Grete\'s House',
    'Shop',
    'Grete\'s House',
    'Farm',
    'Marketplace',
    'Post Office'
];

export function routeRobot(state, memory) {
    if (memory.length === 0) {
        memory = mailRoute;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}

console.log('routeRobot');
runRobot(VillageState.random(), routeRobot, mailRoute);

export function goalOrientedRobot({place, parcels}, route) {
    if (route.length === 0) {
        let parcel = parcels[0];
        if (parcel.place !== place) {
            route = find_path(roadGraph, place, parcel.place);
        } else {
            route = find_path(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

console.log('goalOrientedRobot');
runRobot(VillageState.random(), goalOrientedRobot, []);
