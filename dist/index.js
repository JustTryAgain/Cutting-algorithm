"use strict";
const plane = document.querySelector(".plane");
const SVG_NS = "http://www.w3.org/2000/svg";
if (!plane) {
    throw Error("No plane found!");
}
const squareSize = plane.clientWidth;
// square sides:
const squareSides = [
    { x: 0, y: () => Math.random() * squareSize },
    { x: squareSize, y: () => Math.random() * squareSize },
    { x: () => Math.random() * squareSize, y: 0 },
    { x: () => Math.random() * squareSize, y: squareSize }
];
const getCoordinateValue = (coordinate) => {
    return typeof coordinate === "function" ? coordinate().toString() : coordinate.toString();
};
const generateLines = (nLines) => {
    const lines = [];
    for (let i = 0; i < nLines; i++) {
        // Select two random sides of the square
        const startSide = squareSides[Math.floor(Math.random() * squareSides.length)];
        const otherSides = squareSides.filter(side => side !== startSide);
        const secondSide = otherSides[Math.floor(Math.random() * otherSides.length)];
        const lineCoordinates = {
            x1: getCoordinateValue(startSide.x),
            y1: getCoordinateValue(startSide.y),
            x2: getCoordinateValue(secondSide.x),
            y2: getCoordinateValue(secondSide.y),
        };
        const line = document.createElementNS(SVG_NS, "line");
        Object.entries(lineCoordinates).forEach(([key, value]) => {
            line.setAttribute(key, value);
        });
        line.setAttribute("stroke", "black");
        lines.push(line);
    }
    return lines;
};
// Generate and append lines
const lines = generateLines(6);
lines.forEach(line => plane.append(line));
const segments = lines.map(line => ({
    start: { x: line.x1.baseVal.value, y: line.y1.baseVal.value },
    end: { x: line.x2.baseVal.value, y: line.y2.baseVal.value }
}));
// Function to find intersection of two line segments
const findIntersection = (seg1, seg2) => {
    const { start: A, end: B } = seg1;
    const { start: C, end: D } = seg2;
    const denominator = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
    if (denominator === 0)
        return null; // Parallel lines
    const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / denominator;
    const u = -((A.x - B.x) * (A.y - C.y) - (A.y - B.y) * (A.x - C.x)) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: A.x + t * (B.x - A.x),
            y: A.y + t * (B.y - A.y)
        };
    }
    return null;
};
// Function to build the graph (vertices and edges)
const buildGraph = (segments) => {
    const vertices = new Set();
    const edges = [];
    // For each segment, add vertices and check for intersections
    segments.forEach(({ start: A, end: B }) => {
        const vertexA = `${A.x},${A.y}`;
        const vertexB = `${B.x},${B.y}`;
        vertices.add(vertexA);
        vertices.add(vertexB);
        // Check intersections with other segments
        segments.forEach(({ start: C, end: D }) => {
            const intersection = findIntersection({ start: A, end: B }, { start: C, end: D });
            console.log("intersection");
            console.log(intersection);
            if (intersection) {
                vertices.add(`${intersection.x},${intersection.y}`);
            }
        });
        edges.push([vertexA, vertexB]);
    });
    return { vertices: Array.from(vertices), edges };
};
// Function to find cycles in the graph
const findCycles = (graph) => {
    const { vertices, edges } = graph;
    const adjacencyList = {};
    // Create adjacency list
    vertices.forEach(v => (adjacencyList[v] = []));
    edges.forEach(([from, to]) => {
        adjacencyList[from].push(to);
        adjacencyList[to].push(from);
    });
    const visited = new Set();
    const stack = new Set(); // To track the current recursion stack
    const cycles = [];
    // Depth-first search to find cycles
    const dfs = (current, path, parent) => {
        if (stack.has(current)) {
            // Found a cycle, check if it's valid
            const cycleIndex = path.indexOf(current);
            if (cycleIndex !== -1) {
                const cycle = path.slice(cycleIndex);
                if (!cycles.some(c => JSON.stringify(c) === JSON.stringify(cycle))) {
                    cycles.push(cycle);
                }
            }
            return;
        }
        stack.add(current);
        path.push(current);
        adjacencyList[current].forEach(neighbor => {
            if (neighbor !== parent) {
                dfs(neighbor, [...path], current);
            }
        });
        stack.delete(current);
    };
    // Start DFS for each vertex
    vertices.forEach(v => {
        if (!visited.has(v)) {
            dfs(v, [], "");
            visited.add(v);
        }
    });
    return cycles;
};
const drawPolygons = (cycles, svgElement) => {
    cycles.forEach(cycle => {
        const points = cycle.map(vertex => vertex.split(",").join(" ")).join(" ");
        const polygon = document.createElementNS(SVG_NS, "polygon");
        polygon.setAttribute("points", points);
        polygon.setAttribute("fill", getRandomColor());
        polygon.setAttribute("stroke", "black");
        polygon.setAttribute("stroke-width", "1");
        svgElement.appendChild(polygon);
    });
};
const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
const animateScaling = (svgElement) => {
    const polygons = svgElement.querySelectorAll("polygon");
    polygons.forEach(polygon => {
        polygon.animate([
            { transform: "scale(1)" },
            { transform: "scale(4)" }
        ], {
            duration: 2000,
            iterations: 1,
            easing: "ease-in-out",
            fill: "forwards"
        });
    });
};
const graph = buildGraph(segments);
const cycles = findCycles(graph);
console.log(graph);
console.log("cycles");
console.log(cycles);
drawPolygons(cycles, plane);
animateScaling(plane);
