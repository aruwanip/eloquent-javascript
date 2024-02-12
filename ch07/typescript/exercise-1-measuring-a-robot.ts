import { Action, goalOrientedRobot, RobotFunction, Route, routeRobot, VillageState } from './robot';

function runRobot(state: VillageState, robot: RobotFunction, memory: Route = []): number {
    for (let count = 0; ; count++) {
        if (state.parcels.length === 0) {
            return count;
        }
        let action: Action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
    }
}

export function compareRobots(robot1: RobotFunction, memory1: Route, robot2: RobotFunction, memory2: Route) {
    let robot1Count = 0;
    let robot2Count = 0;

    for (let i = 0; i < 100; i++) {
        let tasks = VillageState.random();
        robot1Count += runRobot(tasks, robot1, memory1);
        robot2Count += runRobot(tasks, robot2, memory2);
    }

    console.log('robot 1 average', robot1Count / 100, 'robot 2 average', robot2Count / 100);
}

compareRobots(routeRobot, [], goalOrientedRobot, []);
