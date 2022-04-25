export function blackOrWhitePixelsByThreshold(
	data: Uint8ClampedArray,
	threshold: number
): Uint8ClampedArray {
	let index = 0;
	while (index < data.length) {
		const red = data[index];
		const green = data[index + 1];
		const blue = data[index + 2];
		const blackOrWhite = (red + green + blue) / 3 < threshold ? 0 : 255;
		data[index] = data[index + 1] = data[index + 2] = blackOrWhite;
		index = index + 4;
	}
	return data;
}

export function binarize(
	context: CanvasRenderingContext2D,
	threshold: number,
	width: number,
	height: number
): void {
	const image = context.getImageData(0, 0, width, height);
	const bwData = blackOrWhitePixelsByThreshold(image.data, threshold);
	context.putImageData(new ImageData(bwData, width, height), 0, 0);
}

export function pixelize(
	context: CanvasRenderingContext2D,
	video: HTMLVideoElement,
	canvas: HTMLCanvasElement,
	pixelSize: number,
	width: number,
	height: number
): void {
	const scale = 1 / pixelSize;
	const widthScaled = width * scale;
	const heightScaled = height * scale;

	context.drawImage(video, 0, 0, widthScaled, heightScaled); // draw small version of image
	context.imageSmoothingEnabled = false;
	context.drawImage(canvas, 0, 0, widthScaled, heightScaled, 0, 0, width, height); // scale up the previously drawn image
}
