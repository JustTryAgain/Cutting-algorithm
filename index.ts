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

type Point = { x: number; y: number };
type Segment = { start: Point; end: Point };

// Функция для нахождения пересечения двух отрезков
const findIntersection = (seg1: Segment, seg2: Segment): Point | null => {
  const { start: A, end: B } = seg1;
  const { start: C, end: D } = seg2;

  const denominator = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
  if (denominator === 0) return null; // Отрезки параллельны

  const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / denominator;
  const u = -((A.x - B.x) * (A.y - C.y) - (A.y - B.y) * (A.x - C.x)) / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    // Пересечение внутри отрезков
    return {
      x: A.x + t * (B.x - A.x),
      y: A.y + t * (B.y - A.y),
    };
  }

  return null; // Пересечений нет
}

// Функция для нахождения всех пересечений
const findAllIntersections = (segments: Segment[]): Point[] => {
  const intersections: Point[] = [];

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const intersection = findIntersection(segments[i], segments[j]);
      if (intersection) {
        intersections.push(intersection);
      }
    }
  }

  return intersections;
}

// Функция для построения многоугольников
function findPolygons(segments: Segment[], intersections: Point[]): Point[][] {
  // Здесь нужно реализовать обход графа, который сформирован из отрезков
  // и точек пересечений. Для простоты можно использовать алгоритм поиска
  // границ с сортировкой и обходом по часовой стрелке.

  // Заглушка для многоугольников
  const polygons: Point[][] = [];
  // TODO: Реализовать алгоритм построения многоугольников
  return polygons;
}

// Основная логика
const segments: Segment[] = [
  { start: { x: 0, y: 0 }, end: { x: 100, y: 100 } },
  { start: { x: 100, y: 0 }, end: { x: 0, y: 100 } },
  { start: { x: 50, y: 0 }, end: { x: 50, y: 100 } },
];

const intersections = findAllIntersections(segments);
console.log("Intersections:", intersections);

const polygons = findPolygons(segments, intersections);
console.log("Polygons:", polygons);

// Генерация SVG (примерный код)
function generateSVG(polygons: Point[][]): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
      ${polygons
    .map(
      (polygon, i) =>
        `<polygon points="${polygon
          .map((p) => `${p.x},${p.y}`)
          .join(" ")}" fill="none" stroke="black" stroke-width="0.5" />`
    )
    .join("\n")}
    </svg>
  `;
}

console.log(generateSVG(polygons));




// const cuttingAlgorithm = () => {
//
// }


//
// // Функция для построения графа из отрезков и точек пересечения
// function buildGraph(segments) {
//   const vertices = new Set();
//   const edges = [];
//
//   // Добавляем все конечные точки и пересечения
//   for (let i = 0; i < segments.length; i++) {
//     const [x1, y1, x2, y2] = segments[i];
//     vertices.add(`${x1},${y1}`);
//     vertices.add(`${x2},${y2}`);
//
//     for (let j = i + 1; j < segments.length; j++) {
//       const [x3, y3, x4, y4] = segments[j];
//
//       if (doIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
//         const intersection = findIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
//         if (intersection) {
//           const key = `${intersection.x},${intersection.y}`;
//           vertices.add(key);
//         }
//       }
//     }
//   }
//
//   // Добавляем ребра между соединенными вершинами
//   segments.forEach(([x1, y1, x2, y2]) => {
//     edges.push([`${x1},${y1}`, `${x2},${y2}`]);
//   });
//
//   return { vertices: Array.from(vertices), edges };
// }
//
// // Функция для поиска всех циклов (многоугольников) в графе
// function findCycles(graph) {
//   const { vertices, edges } = graph;
//
//   const adjacencyList = {};
//   vertices.forEach((v) => (adjacencyList[v] = []));
//   edges.forEach(([from, to]) => {
//     adjacencyList[from].push(to);
//     adjacencyList[to].push(from); // граф неориентированный
//   });
//
//   const visited = new Set();
//   const cycles = [];
//
//   function dfs(current, path) {
//     if (visited.has(current)) return;
//
//     visited.add(current);
//     path.push(current);
//
//     adjacencyList[current].forEach((neighbor) => {
//       if (!visited.has(neighbor)) {
//         dfs(neighbor, [...path]);
//       } else if (path.length > 2 && neighbor === path[0]) {
//         // Найден цикл
//         const cycle = [...path];
//         if (!cycles.some((c) => JSON.stringify(c) === JSON.stringify(cycle))) {
//           cycles.push(cycle);
//         }
//       }
//     });
//
//     visited.delete(current);
//   }
//
//   vertices.forEach((v) => dfs(v, []));
//   return cycles;
// }
//
// // Функция для визуализации многоугольников в SVG
// function drawPolygons(cycles, svgElement) {
//   cycles.forEach((cycle) => {
//     const points = cycle
//       .map((vertex) => vertex.split(",").join(" "))
//       .join(" ");
//
//     const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
//     polygon.setAttribute("points", points);
//     polygon.setAttribute("fill", getRandomColor());
//     polygon.setAttribute("stroke", "black");
//     polygon.setAttribute("stroke-width", 1);
//
//     svgElement.appendChild(polygon);
//   });
// }
//
// // Вспомогательная функция для случайного цвета
// function getRandomColor() {
//   return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
// }
//
// // Пример использования
// const segments = [
//   [0, 0, 4, 4],
//   [1, 5, 5, 1],
//   [2, 0, 2, 5],
//   [0, 3, 5, 3]
// ];
//
// const graph = buildGraph(segments);
// const cycles = findCycles(graph);
//
// const svg = document.querySelector("svg"); // Ваш SVG элемент
// drawPolygons(cycles, svg);
