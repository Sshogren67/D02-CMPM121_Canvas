import "./style.css";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "Spencer and Seamus' Drawing Canvas";
app.append(heading);

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
canvas.id = "drawing-canvas";
app.append(canvas);

const layerTwo = document.createElement("layer");
const layerThree = document.createElement("layer");

app.append(layerTwo);
app.append(layerThree);

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  type: "stroke";
  points: Point[];
  width: number;
  color: string;
};

type Sticker = {
  type: "sticker";
  x: number;
  y: number;
  emoji: string;
  size: number;
};

type CursorType = {
  type: "marker";
  width: number;
  color: string;
} | {
  type: "sticker";
  emoji: string;
  size: number;
};

const cursors: CursorType[] = [
  { type: "marker", width: 2, color: "black" },
  { type: "marker", width: 8, color: "black" },
  { type: "sticker", emoji: "👾", size: 30 },
  { type: "sticker", emoji: "🕹️", size: 30 },
  { type: "sticker", emoji: "📺", size: 30 },
];

let selectedCursor: CursorType = cursors[0];

type PlacedDrawing = Stroke | Sticker;

let isDrawing = false;
const context = canvas.getContext("2d");
if (context) {
  context.lineCap = "round";
  context.lineWidth = 5;
  context.strokeStyle = "black";
}

const drawings: PlacedDrawing[] = [];
const undoneDrawings: PlacedDrawing[] = [];

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  undoneDrawings.length = 0;

  if (selectedCursor.type === "marker") {
    isDrawing = true;

    drawings.push({
      type: "stroke",
      points: [{ x, y }],
      width: selectedCursor.width,
      color: selectedCursor.color,
    });
  } else {
    drawings.push({
      type: "sticker",
      x,
      y,
      emoji: selectedCursor.emoji,
      size: selectedCursor.size,
    });
    updateCanvas();
  }
});

canvas.addEventListener("mousemove", (event) => {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const currentDrawing = drawings[drawings.length - 1];

  if (currentDrawing && currentDrawing.type === "stroke") {
    currentDrawing.points.push({ x, y });

    if (context) {
      context.lineWidth = currentDrawing.width;
      context.strokeStyle = currentDrawing.color;
      context.beginPath();

      const points = currentDrawing.points;

      context.moveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
      );

      context.lineTo(
        points[points.length - 1].x,
        points[points.length - 1].y,
      );

      context.stroke();
    }
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
  drawings.length = 0;
  undoneDrawings.length = 0;
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
});

function updateCanvas() {
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const drawing of drawings) {
    if (drawing.type === "stroke") {
      context.beginPath();
      context.lineWidth = drawing.width;
      context.strokeStyle = drawing.color;

      const points = drawing.points;

      for (let i = 1; i < points.length; i++) {
        context.moveTo(points[i - 1].x, points[i - 1].y);
        context.lineTo(points[i].x, points[i].y);
        context.stroke();
      }
    } else {
      context.font = `${drawing.size}px Arial`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(drawing.emoji, drawing.x, drawing.y);
    }
  }
}

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  if (drawings.length > 0) {
    const previous = drawings.pop();
    if (previous) {
      undoneDrawings.push(previous);
    }
  }
  updateCanvas();
});

const redoButton = document.createElement("button");
redoButton.textContent = "Restore";
redoButton.addEventListener("click", () => {
  if (undoneDrawings.length > 0) {
    const restoredStroke = undoneDrawings.pop();
    if (restoredStroke) {
      drawings.push(restoredStroke);
    }
  }
  updateCanvas();
});

for (const cursor of cursors) {
  const button = document.createElement("button");

  if (cursor.type === "marker") {
    button.textContent = `Marker ${cursor.width}px`;
  } else {
    button.textContent = cursor.emoji;
  }

  button.addEventListener("click", () => {
    selectedCursor = cursor;
  });

  layerTwo.append(button);
}

layerThree.append(undoButton);
layerThree.append(redoButton);
layerThree.append(clearButton);
