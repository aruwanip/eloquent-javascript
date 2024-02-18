import randomItem from 'random-item';
import { roadGraph } from './roads.mjs';

export class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!destination in roadGraph[this.place]) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if (p.place !== this.place) return p;
                return {place: destination, address: p.address};
            }).filter(p => p.place !== p.address);
            return new VillageState(destination, parcels);
        }
    }
}

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomItem(Object.keys(roadGraph));
        let place;
        do {
            place = randomItem(Object.keys(roadGraph));
        } while (place === address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
};

export function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length === 0) {
            console.log(`Done in ${turn} turns`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        // console.log(`Moved to ${action.direction}`);
    }
}
