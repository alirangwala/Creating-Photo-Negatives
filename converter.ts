const fileInput = <HTMLImageElement> document.getElementById('fileInput');
const canvas = <HTMLCanvasElement> document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const negative = <HTMLInputElement> document.getElementById('negative');
negative.onchange = run;

const srcImage = new Image;
let imgData = null;
let originalPixels = null;
let currentPixels = null;

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
// Executes when image is loaded and sets image
fileInput.onchange = function (e: HTMLInputEvent) {
  if (e.target.files && e.target.files.item(0)) {
    srcImage.src = URL.createObjectURL(e.target.files[0])
  }
}

// After image is loaded this function draws image to page
srcImage.onload = function () {
  canvas.width = srcImage.width
  canvas.height = srcImage.height
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
  // This severs the tie between original array and eventual array
  originalPixels = imgData.data.slice()
}

// The data in the array goes from top left to bottom right
// There are 4 entries per pixel: R, G, B, and alpha (transparency)
function getIndex(x: number, y: number): number {
  return (x + y * srcImage.width) * 4
}

const R_OFFSET = 0
const G_OFFSET = 1
const B_OFFSET = 2

// Logic for making negative image
function setNegative(x: number, y: number) {
  //  get indexes for rgba values
  const redIndex = getIndex(x, y) + R_OFFSET
  const greenIndex = getIndex(x, y) + G_OFFSET
  const blueIndex = getIndex(x, y) + B_OFFSET

  // setting new values for rgb to the opposite of what they were
  const redValue = 255 - currentPixels[redIndex]
  const greenValue = 255 - currentPixels[greenIndex]
  const blueValue = 255 - currentPixels[blueIndex]

  // changing the array to reflect those values
  currentPixels[redIndex] = redValue
  currentPixels[greenIndex] = greenValue
  currentPixels[blueIndex] = blueValue
}

function commitChanges() {
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
  originalPixels = imgData.data.slice()
  // Copy over the current pixel changes to the image
  for (let i = 0; i < imgData.data.length; i++) {
    imgData.data[i] = currentPixels[i]
  }
  // Update the 2d rendering canvas with the image we just updated so the user can see
  ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height)
}

// pipeline of functions
function run() {
  if(!srcImage.src) {
    alert("There is no image loaded")
  return;
  }
  currentPixels = originalPixels.slice()
  let isNegative = negative.checked

  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      if (isNegative) setNegative(j, i);
    }
  }
  commitChanges();
}

function downloadImg(element) {
  let img = canvas.toDataURL("image/bmp");
  element.href=img;
}