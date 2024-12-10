"use strict";
console.log("worked!");
// Define the SVG namespace
const SVG_NS = "http://www.w3.org/2000/svg";
const plane = document.querySelector(".plane");
if (!plane) {
    throw Error("No plane found!");
}
const squareSize = plane.clientWidth;
console.log(squareSize);
// square sides:
// left x = 0: coordinates - 0, y, where y in [0, 400]
// right x = 400: coordinates 400, y, where y in [0, 400]
// top y = 400: coordinates x, 400, where x in [0, 400]
// bottom y = 0: coordinates x, 0, where x in [0, 400]
const squareSides = [
    { x: 0, y: squareSize }, { x: squareSize, y: squareSize },
    { x: squareSize, y: squareSize }, { x: squareSize, y: 0 }
];
const generateLines = (nLines) => {
    const lines = [];
    for (let i = 0; i < nLines; i++) {
        const startSide = squareSides[Math.floor(Math.random() * squareSides.length)];
        const otherSides = squareSides.filter(side => side !== startSide);
        const endSide = otherSides[Math.floor(Math.random() * otherSides.length)];
        const lineCoordinates = {
            x1: Math.floor(Math.random() * startSide.x).toString(),
            y1: Math.floor(Math.random() * startSide.y).toString(),
            x2: Math.floor(Math.random() * endSide.x).toString(),
            y2: Math.floor(Math.random() * endSide.y).toString(),
        };
        console.log(lineCoordinates);
        const line = document.createElementNS(SVG_NS, "line");
        // Set line attributes through OBJ entries
        Object.entries(lineCoordinates).forEach(([key, value]) => {
            line.setAttribute(key, value);
        });
        line.setAttribute("stroke", "black");
        lines.push(line);
    }
    return lines;
};
const lines = generateLines(5);
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    plane.append(line);
}
const cuttingAlgorithm = () => {
};
