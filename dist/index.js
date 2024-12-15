"use strict";
const SVG_NS = "http://www.w3.org/2000/svg";
const plane = document.querySelector(".plane");
const square = plane.querySelector("rect");
// Square parameters
const sqX = parseFloat(square.getAttribute("x") || "0");
const sqY = parseFloat(square.getAttribute("y") || "0");
const sqWidth = parseFloat(square.getAttribute("width") || "0");
const sqHeight = parseFloat(square.getAttribute("height") || "0");
const squareAngles = [
    { x: sqX, y: sqY }, { x: sqX + sqWidth, y: sqY },
    { x: sqX + sqWidth, y: sqY + sqHeight }, { x: sqX, y: sqY + sqHeight }
];
const squareSides = squareAngles.map((point, i) => ({
    start: point,
    end: squareAngles[(i + 1) % squareAngles.length]
}));
console.log({ squareAngles, squareSides });
// Generate random points on the selected sides
const getRandomPointOnSide = (side) => {
    const rand = Math.random();
    return {
        x: side.start.x + rand * (side.end.x - side.start.x),
        y: side.start.y + rand * (side.end.y - side.start.y)
    };
};
const cuttingAlgorithm = (nSegments = 6) => {
    const lines = [];
    for (let i = 0; i < nSegments; i++) {
        // Select two random sides of the square
        const startSide = squareSides[Math.floor(Math.random() * squareSides.length)];
        const otherSides = squareSides.filter(side => side !== startSide);
        const secondSide = otherSides[Math.floor(Math.random() * otherSides.length)];
        // and two random points on them
        const point1 = getRandomPointOnSide(startSide);
        const point2 = getRandomPointOnSide(secondSide);
        // Create a line connecting the two points
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", point1.x.toString());
        line.setAttribute("y1", point1.y.toString());
        line.setAttribute("x2", point2.x.toString());
        line.setAttribute("y2", point2.y.toString());
        line.setAttribute("stroke", "black");
        lines.push(line);
    }
    return lines;
};
const findIntersection = (seg1, seg2) => {
    const { start: A1, end: B1 } = seg1;
    const { start: A2, end: B2 } = seg2;
    // Calculate the determinant (denominator)
    const determinant = (A1.x - B1.x) * (A2.y - B2.y) - (A1.y - B1.y) * (A2.x - B2.x);
    // Use an EPSILON for precision issues
    const EPSILON = 1e-10;
    if (Math.abs(determinant) < EPSILON)
        return null; // Parallel or coincident lines
    // Calculate the parameters t and u
    const t = ((A1.x - A2.x) * (A2.y - B2.y) - (A1.y - A2.y) * (A2.x - B2.x)) / determinant;
    const u = -((A1.x - B1.x) * (A1.y - A2.y) - (A1.y - B1.y) * (A1.x - A2.x)) / determinant;
    // Check if the intersection point lies on both segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: A1.x + t * (B1.x - A1.x),
            y: A1.y + t * (B1.y - A1.y)
        };
    }
    // No intersection
    return null;
};
// Утилита для преобразования точки в строку (для ключей в Map)
const pointToString = (point) => {
    return `${point.x},${point.y}`;
};
// Утилита для вычисления равенства двух точек
const pointsAreEqual = (p1, p2) => {
    return p1.x === p2.x && p1.y === p2.y;
};
// Построение графа из отрезков
const buildGraph = (segments, intersections) => {
    const graph = new Map();
    // Функция для добавления ребра в граф
    const addEdge = (p1, p2) => {
        const key1 = pointToString(p1);
        const key2 = pointToString(p2);
        if (!graph.has(key1))
            graph.set(key1, []);
        if (!graph.has(key2))
            graph.set(key2, []);
        graph.get(key1).push(p2);
        graph.get(key2).push(p1);
    };
    // Добавляем отрезки и точки пересечений в граф
    for (const segment of segments) {
        addEdge(segment.start, segment.end);
    }
    for (const intersection of intersections) {
        for (const segment of segments) {
            if ((pointsAreEqual(segment.start, intersection) || pointsAreEqual(segment.end, intersection)) &&
                !pointsAreEqual(segment.start, segment.end)) {
                addEdge(segment.start, intersection);
                addEdge(segment.end, intersection);
            }
        }
    }
    return graph;
};
// Алгоритм обхода графа для построения фигур (поиск циклов)
function findShapes(graph) {
    const visitedEdges = new Set();
    const shapes = [];
    function edgeToString(p1, p2) {
        return `${pointToString(p1)}-${pointToString(p2)}`;
    }
    function dfs(current, start, path) {
        const neighbors = graph.get(pointToString(current)) || [];
        for (const neighbor of neighbors) {
            const edgeKey = edgeToString(current, neighbor);
            const reverseEdgeKey = edgeToString(neighbor, current);
            if (!visitedEdges.has(edgeKey) && !visitedEdges.has(reverseEdgeKey)) {
                visitedEdges.add(edgeKey);
                path.push(neighbor);
                if (pointsAreEqual(neighbor, start) && path.length > 2) {
                    shapes.push([...path]);
                }
                else {
                    dfs(neighbor, start, path);
                }
                path.pop();
            }
        }
    }
    for (const [key, point] of graph.entries()) {
        const neighbors = graph.get(key) || [];
        for (const neighbor of neighbors) {
            // @ts-ignore
            const edgeKey = edgeToString(point, neighbor);
            if (!visitedEdges.has(edgeKey)) {
                visitedEdges.add(edgeKey);
                // @ts-ignore
                dfs(point, point, [point]);
            }
        }
    }
    return shapes;
}
// Generate and append lines
const lines = cuttingAlgorithm();
lines.forEach(line => plane.append(line));
const segments = lines.map(line => ({
    start: { x: line.x1.baseVal.value, y: line.y1.baseVal.value },
    end: { x: line.x2.baseVal.value, y: line.y2.baseVal.value }
}));
const intersections = [];
segments.forEach((segment1) => {
    segments.forEach((segment2) => {
        const intersection = findIntersection(segment1, segment2);
        if (intersection) {
            intersections.push(intersection);
        }
    });
});
const graph = buildGraph([...segments, ...squareSides], intersections);
console.log("graph");
console.log(graph);
const shapes = findShapes(graph);
console.log("Найденные фигуры:", shapes);
// // Draw intersections for test
// intersections.forEach(({x, y}) => {
//   const circle = document.createElementNS(SVG_NS, "circle");
//   circle.setAttribute("cx", x.toString());
//   circle.setAttribute("cy", y.toString());
//   circle.setAttribute("r", "3");
//   circle.setAttribute("fill", "red");
//   plane.appendChild(circle);
// });
