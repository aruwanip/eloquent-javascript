import { compareRobots } from './exercise-1-measuring-a-robot';
import { Action, findRoute, goalOrientedRobot, roadGraph, Route, VillageState } from './robot';

function efficientRobot({ place, parcels }: VillageState, route: Route): Action {
    // Strategy: Rather than taking first parcel in list, find the parcel that is closest
    if (route.length === 0) {
        for (let parcel of parcels) {
            if (parcel.place !== place) { // Set route of un-picked up parcel to current location of parcel
                parcel.route = findRoute(roadGraph, place, parcel.place);
            } else { // Set route of picked up parcel to destination of parcel
                parcel.route = findRoute(roadGraph, place, parcel.address);
            }
        }
        // Sort parcel by distance of their route
        parcels.sort((a, b) => {
            if (a.route.length === b.route.length) { // For parcels where distances are same, prefer the parcel that is not yet picked up
                return a.place !== place ? -1 : 1
            } else {
                return a.route.length - b.route.length;
            }
        });
        route = parcels[0].route;
    }
    return { direction: route[0], memory: route.slice(1) };
}

compareRobots(efficientRobot, [], goalOrientedRobot, []);
