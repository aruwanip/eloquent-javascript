interface Graph {
    [key: string]: string[];
}

const roads: string[] = [
    'Alice\'s House-Bob\'s House',
    'Alice\'s House-Cabin',
    'Alice\'s House-Post Office',
    'Bob\'s House-Town Hall',
    'Daria\'s House-Ernie\'s House',
    'Daria\'s House-Town Hall',
    'Ernie\'s House-Grete\'s House',
    'Grete\'s House-Farm',
    'Grete\'s House-Shop',
    'Marketplace-Farm',
    'Marketplace-Post Office',
    'Marketplace-Shop',
    'Marketplace-Town Hall',
    'Shop-Town Hall'
];

function buildGraph(edges: string[]): Graph {
    let graph: Graph = Object.create(null);

    function addEdge(from: string, to: string): void {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }

    for (let [from, to] of edges.map(r => r.split('-'))) {
        addEdge(from, to);
        addEdge(to, from);
    }

    return graph;
}

const roadGraph: Graph = buildGraph(roads);

// console.log('Road Graph', roadGraph);

interface Parcel {
    place: string;
    address: string;
}

export class VillageState {
    public place: string;
    public parcels: Parcel[];

    public constructor(place: string, parcels: any[]) {
        this.place = place;
        this.parcels = parcels;
    }

    public move(destination: string): VillageState {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) return p;
                return { place: destination, address: p.address };
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels);
        }
    }

    public static random(parcelCount = 5): VillageState {
        let parcels: Parcel[] = [];
        for (let i = 0; i < parcelCount; i++) {
            let address = randomPick(Object.keys(roadGraph));
            let place;
            do {
                place = randomPick(Object.keys(roadGraph));
            } while (place == address);
            parcels.push({ place, address });
        }
        return new VillageState('Post Office', parcels);
    }
}

let first = new VillageState(
    'Post Office',
    [{ place: 'Post Office', address: 'Alice\'s House' }]
);
let next = first.move('Alice\'s House');

console.log(next.place);
// → Alice's House
console.log(next.parcels);
// → []
console.log(first.place);
// → Post Office

export type Route = string[];

export interface Action {
    direction: string;
    memory?: Route;
}

function runRobot(state: VillageState, robot: RobotFunction, memory: Route = []): number {
    for (let turn = 0; ; turn++) {
        if (state.parcels.length === 0) {
            console.log(`Done in ${ turn } turns`);
            return turn;
        }
        let action: Action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${ action.direction }`);
    }
}

function randomPick(array: string[]): string {
    let choice: number = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state: VillageState): Action {
    return { direction: randomPick(roadGraph[state.place]) };
}

runRobot(VillageState.random(), randomRobot);

const mailRoute: string[] = [
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

export type RobotFunction = (state: VillageState, memory?: Route) => Action;

export function routeRobot(state: VillageState, memory: Route): Action {
    if (memory.length === 0) {
        memory = mailRoute;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}

runRobot(VillageState.random(), routeRobot);

interface Work {
    at: string;
    route: Route;
}

function findRoute(graph: Graph, from: string, to: string): Route {
    let work: Work[] = [{ at: from, route: [] }];
    for (let i = 0; i < work.length; i++) {
        let { at, route } = work[i];
        for (let place of graph[at]) {
            if (place === to) return route.concat(place);
            if (!work.some(w => w.at === place)) {
                work.push({ at: place, route: route.concat(place) });
            }
        }
    }
}

export function goalOrientedRobot({ place, parcels }: VillageState, route: Route): Action {
    if (route.length === 0) {
        let parcel = parcels[0];
        if (parcel.place !== place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return { direction: route[0], memory: route.slice(1) };
}

runRobot(VillageState.random(), goalOrientedRobot);

/*
Road Graph
{
  "Alice's House": [ "Bob's House", 'Cabin', 'Post Office' ],
  "Bob's House": [ "Alice's House", 'Town Hall' ],
  Cabin: [ "Alice's House" ],
  'Post Office': [ "Alice's House", 'Marketplace' ],
  'Town Hall': [ "Bob's House", "Daria's House", 'Marketplace', 'Shop' ],
  "Daria's House": [ "Ernie's House", 'Town Hall' ],
  "Ernie's House": [ "Daria's House", "Grete's House" ],
  "Grete's House": [ "Ernie's House", 'Farm', 'Shop' ],
  Farm: [ "Grete's House", 'Marketplace' ],
  Shop: [ "Grete's House", 'Marketplace', 'Town Hall' ],
  Marketplace: [ 'Farm', 'Post Office', 'Shop', 'Town Hall' ]
}
 */

