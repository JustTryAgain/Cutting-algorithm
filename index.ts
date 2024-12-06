console.log("worked!");

const plane = document.getElementsByClassName("plane");
console.log(plane);
// square sides:
// left x = 0: coordinates - 0, y, where y in [0, 400]
// right x = 400: coordinates 400, y, where y in [0, 400]
// top y = 400: coordinates x, 400, where x in [0, 400]
// bottom y = 0: coordinates x, 0, where x in [0, 400]
const squareSides = [
  {x: 0, y: [0, 400]}, {x: 400, y: [0, 400]},
  {x: [0, 400], y: 400}, {x: [0, 400], y: 0}
]

const generateLines = (squareSize: number, nLines: number) => {
  const randomSide = Math.floor(Math.random() * squareSides.length);
  console.log(squareSides[randomSide]);
}

const cuttingAlgorithm = () => {

}