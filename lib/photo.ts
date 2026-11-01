/**
 * Turns a picture the person chose into a small square JPEG (data URL), entirely in the browser.
 * The picture is cropped to a centred square and shrunk, so it stays light enough to keep in local storage and
 * to embed in the PDF. It is never uploaded anywhere.
 */
export async function fileToSquareJpeg(file: File, size = 320, quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That picture is too large. Please choose one under 15 MB.");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Couldn't read that picture. Try a JPG or PNG."));
      image.src = url;
    });

    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser couldn't process that picture.");

    context.fillStyle = "#ffffff"; // JPEG has no transparency
    context.fillRect(0, 0, size, size);
    context.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
