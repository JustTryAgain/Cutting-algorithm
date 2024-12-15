type Point = { x: number; y: number };
type Segment = { start: Point; end: Point };

const SVG_NS = "http://www.w3.org/2000/svg";
const plane = document.querySelector(".plane") as SVGSVGElement;
const square = plane.querySelector("rect") as SVGRectElement;
// Square parameters
const sqX = parseFloat(square.getAttribute("x") || "0");
const sqY = parseFloat(square.getAttribute("y") || "0");
const sqWidth = parseFloat(square.getAttribute("width") || "0");
const sqHeight = parseFloat(square.getAttribute("height") || "0");

const squareAngles: Point[] = [
  {x: sqX, y: sqY}, {x: sqX + sqWidth, y: sqY},
  {x: sqX + sqWidth, y: sqY + sqHeight}, {x: sqX, y: sqY + sqHeight}
];
const squareSides: Segment[] = squareAngles.map((point, i) => ({
  start: point,
  end: squareAngles[(i + 1) % squareAngles.length]
}));

console.log({squareAngles, squareSides});

// Generate random points on the selected sides
const getRandomPointOnSide = (side: Segment): Point => {
  const rand = Math.random();
  return {
    x: side.start.x + rand * (side.end.x - side.start.x),
    y: side.start.y + rand * (side.end.y - side.start.y)
  };
};

const cuttingAlgorithm = (nSegments: number = 6): SVGLineElement[] => {
  const lines: SVGLineElement[] = [];

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

const findIntersection = (seg1: Segment, seg2: Segment): Point | null => {
  const {start: A1, end: B1} = seg1;
  const {start: A2, end: B2} = seg2;

  // Calculate the determinant (denominator)
  const determinant = (A1.x - B1.x) * (A2.y - B2.y) - (A1.y - B1.y) * (A2.x - B2.x);

  // Use an EPSILON for precision issues
  const EPSILON = 1e-10;
  if (Math.abs(determinant) < EPSILON) return null; // Parallel or coincident lines

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

// Generate and append lines
const lines = cuttingAlgorithm();
lines.forEach(line => plane.append(line));

const segments: Segment[] = lines.map(line => ({
  start: {x: line.x1.baseVal.value, y: line.y1.baseVal.value},
  end: {x: line.x2.baseVal.value, y: line.y2.baseVal.value}
}));
const intersections: Point[] = [];

segments.forEach((segment1) => {
  segments.forEach((segment2) => {
    const intersection = findIntersection(segment1, segment2);
    console.log("intersection");
    console.log(intersection);
    if (intersection) {
      intersections.push(intersection);
    }
  });
});

intersections.forEach(({x, y}) => {
  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("cx", x.toString());
  circle.setAttribute("cy", y.toString());
  circle.setAttribute("r", "3");
  circle.setAttribute("fill", "red");
  plane.appendChild(circle);
});
