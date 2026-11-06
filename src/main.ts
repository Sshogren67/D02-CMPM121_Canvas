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
const layerFour = document.createElement("layer");

app.append(layerTwo);
app.append(layerThree);
app.append(layerFour);

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  type: "stroke";
  points: Point[];
  width: number;
  color: string;
  draw(context: CanvasRenderingContext2D): void;
};

type Sticker = {
  type: "sticker";
  x: number;
  y: number;
  image: string;
  size: number;
  draw(context: CanvasRenderingContext2D): void;
};

type ToolType = {
  type: "marker";
  width: number;
  color: string;
} | {
  type: "sticker";
  name: string;
  emoji: string;
  size: number;
};

const tools: ToolType[] = [
  { type: "marker", width: 2, color: "black" },
  { type: "marker", width: 8, color: "black" },
  { type: "sticker", name: "sprite", emoji: "👾", size: 30 },
  { type: "sticker", name: "controller", emoji: "🕹️", size: 30 },
  { type: "sticker", name: "TV", emoji: "📺", size: 30 },
];

let selectedTool: ToolType = tools[0];

type PlacedDrawing = Stroke | Sticker;

let isDrawing = false;
let currentStroke: Stroke | null = null;

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

  if (selectedTool.type === "marker") {
    isDrawing = true;

    currentStroke = {
      type: "stroke",
      points: [{ x, y }],
      width: selectedTool.width,
      color: selectedTool.color,
      draw(context: CanvasRenderingContext2D) {
        drawStroke(this, context);
      },
    };
  } else {
    drawings.push({
      type: "sticker",
      x,
      y,
      image: selectedTool.emoji,
      size: selectedTool.size,
      draw(context: CanvasRenderingContext2D) {
        drawSticker(this, context);
      },
    });
    updateCanvas();
  }
});

canvas.addEventListener("mousemove", (event) => {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (currentStroke) {
    currentStroke.points.push({ x, y });

    if (context) {
      context.lineWidth = currentStroke.width;
      context.strokeStyle = currentStroke.color;
      context.beginPath();

      const points = currentStroke.points;

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
  if (currentStroke) {
    drawings.push(currentStroke);
    currentStroke = null;
  }
  isDrawing = false;
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && currentStroke) {
    currentStroke = null;
    isDrawing = false;
    updateCanvas();
  }
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
    drawing.draw(context);
  }
}

function addTool(cursor: ToolType) {
  const button = document.createElement("button");

  if (cursor.type === "marker") {
    button.textContent = `Marker ${cursor.width}px`;
  } else {
    button.textContent = cursor.emoji;
  }

  button.addEventListener("click", () => {
    selectedTool = cursor;
  });

  layerTwo.append(button);
}

for (const cursor of tools) {
  addTool(cursor);
}

function drawStroke(
  stroke: Stroke,
  context: CanvasRenderingContext2D,
) {
  context.save();

  context.beginPath();
  context.lineWidth = stroke.width;
  context.strokeStyle = stroke.color;

  for (let i = 1; i < stroke.points.length; i++) {
    context.moveTo(stroke.points[i - 1].x, stroke.points[i - 1].y);
    context.lineTo(stroke.points[i].x, stroke.points[i].y);
  }

  context.stroke();
  context.restore();
}

function drawSticker(
  sticker: Sticker,
  context: CanvasRenderingContext2D,
) {
  context.save();

  context.font = `${sticker.size}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(sticker.image, sticker.x, sticker.y);

  context.restore();
}

function exportDrawing() {
  if (!exportContext) return;

  exportContext.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportContext.fillStyle = "white";
  exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

  exportContext.scale(2, 2);

  for (const drawing of drawings) {
    drawing.draw(exportContext);
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

const createSticker = document.createElement("button");
createSticker.textContent = "Create Custom Sticker";
createSticker.addEventListener("click", () => {
  const sticker = prompt("Enter your own Emoji or Short Text");
  if (sticker === null || sticker.trim() === "") return;

  const newCursor: ToolType = {
    type: "sticker",
    name: sticker.trim(),
    emoji: sticker.trim(),
    size: 30,
  };

  tools.push(newCursor);
  addTool(newCursor);
});

const exportButton = document.createElement("button");
exportButton.textContent = "Export PNG";

const exportCanvas = document.createElement("canvas");
exportCanvas.width = canvas.width * 2;
exportCanvas.height = canvas.height * 2;

const exportContext = exportCanvas.getContext("2d");

exportButton.addEventListener("click", () => {
  exportDrawing();

  exportCanvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "my-drawing.png";
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }, "image/png");
});

layerTwo.append(createSticker);

layerThree.append(undoButton);
layerThree.append(redoButton);
layerThree.append(clearButton);

layerFour.append(exportButton);
