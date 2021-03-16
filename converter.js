const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const canvasNeg = document.getElementById('canvasNeg');
const ctx = canvas.getContext('2d');
const ctxNeg = canvasNeg.getContext('2d');
const srcImage = new Image;
const negative = document.getElementById('negative');
negative.onchange = runPipeline;
let imgData = null;
let originalPixels = null;
let currentPixels = null;
fileInput.onchange = function (e) {
    console.log(e);
    if (e.target.files && e.target.files.item(0)) {
        srcImage.src = URL.createObjectURL(e.target.files[0]);
    }
};
srcImage.onload = function () {
    canvas.width = srcImage.width;
    canvas.height = srcImage.height;
    ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height);
    imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height);
    originalPixels = imgData.data.slice();
};
function commitChanges() {
    canvasNeg.width = srcImage.width;
    canvasNeg.height = srcImage.height;
    ctxNeg.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height);
    imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height);
    originalPixels = imgData.data.slice();
    // Copy over the current pixel changes to the image
    for (let i = 0; i < imgData.data.length; i++) {
        imgData.data[i] = currentPixels[i];
    }
    // Update the 2d rendering canvas with the image we just updated so the user can see
    ctxNeg.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height);
}
function getIndex(x, y) {
    return (x + y * srcImage.width) * 4;
}
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
function runPipeline() {
    currentPixels = originalPixels.slice();
    let negativeFilter = negative.checked;
    for (let i = 0; i < srcImage.height; i++) {
        for (let j = 0; j < srcImage.width; j++) {
            if (negativeFilter) {
                setNegative(j, i);
            }
        }
    }
    commitChanges();
}
// Logic for negative
function setNegative(x, y) {
    const redIndex = getIndex(x, y) + R_OFFSET;
    const greenIndex = getIndex(x, y) + G_OFFSET;
    const blueIndex = getIndex(x, y) + B_OFFSET;
    const redValue = 255 - currentPixels[redIndex];
    const greenValue = 255 - currentPixels[greenIndex];
    const blueValue = 255 - currentPixels[blueIndex];
    currentPixels[redIndex] = redValue;
    currentPixels[greenIndex] = greenValue;
    currentPixels[blueIndex] = blueValue;
}
