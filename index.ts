const plane = document.querySelector(".plane");
const SVG_NS = "http://www.w3.org/2000/svg";

if (!plane) {
  throw Error("No plane found!");
}

const squareSize: number = plane.clientWidth;

// square sides:
// left x = 0: coordinates - 0, y, where y in [0, 400]
// right x = 400: coordinates 400, y, where y in [0, 400]
// top y = 400: coordinates x, 400, where x in [0, 400]
// bottom y = 0: coordinates x, 0, where x in [0, 400]
const squareSides = [
  {x1: 0, y1: () => Math.random() * squareSize },
  {x1: squareSize, y1: () => Math.random() * squareSize },
  {x1: () => Math.random() * squareSize, y1: 0 },
  {x1: () => Math.random() * squareSize, y1: squareSize }
];

const getCoordinateValue = (coordinate: number | (() => number)): string => {
  return typeof coordinate === "function" ? coordinate().toString() : coordinate.toString();
};

const generateLines = (nLines: number): SVGLineElement[] => {
  const lines: SVGLineElement[] = [];

  for (let i = 0; i < nLines; i++) {
    // Select two random sides of the square
    const startSide = squareSides[Math.floor(Math.random() * squareSides.length)];
    const otherSides = squareSides.filter(side => side !== startSide);
    const secondSide = otherSides[Math.floor(Math.random() * (otherSides.length))];

    // Generate line coordinates from the selected sides
    const lineCoordinates: Record<"x1" | "y1" | "x2" | "y2", string> = {
      x1: getCoordinateValue(startSide.x1),
      y1: getCoordinateValue(startSide.y1),
      x2: getCoordinateValue(secondSide.x1),
      y2: getCoordinateValue(secondSide.y1),
    };

    const line = document.createElementNS(SVG_NS, "line");
    // Set line attributes
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

const cuttingAlgorithm = () => {

}