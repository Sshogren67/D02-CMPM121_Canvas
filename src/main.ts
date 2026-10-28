import "./style.css";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Spencer and Seamus' Drawing Canvas";
app.append(heading);

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.style.border = "1px solid black";
canvas.id = "drawing-canvas";
app.append(canvas);

type Point = {
  x: number;
  y: number;
};
type Stroke = {
  points: Point[];
  width: number;
  color: string;
};

let isDrawing = false;
const context = canvas.getContext("2d");
if (context) {
  context.lineCap = "round";
  context.lineWidth = 5;
  context.strokeStyle = "black";
}

const strokes: Stroke[] = [];
canvas.addEventListener("mousedown", (event) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  strokes.push({
    points: [{ x, y }],
    width: context?.lineWidth || 5,
    color: context && typeof context.strokeStyle === "string"
      ? context.strokeStyle
      : "black",
  });
});
canvas.addEventListener("mousemove", (event) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const currentStroke = strokes[strokes.length - 1];
  currentStroke.points.push({ x, y });
  if (context) {
    context.lineWidth = currentStroke.width;
    context.strokeStyle = currentStroke.color;
    context.beginPath();
    const points = currentStroke.points;
    context.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    context.stroke();
  }
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
clearButton.addEventListener("click", () => {
  strokes.length = 0;
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
});
app.append(clearButton);
