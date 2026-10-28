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

const context = canvas.getContext("2d");
canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  context?.beginPath();
  context?.moveTo(x, y);

  const onMouseMove = (event: MouseEvent) => {
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    context?.lineTo(x, y);
    context?.stroke();
  };

  const onMouseUp = () => {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup", onMouseUp);
  };

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
});
