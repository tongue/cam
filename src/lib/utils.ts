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
	const frame = context.getImageData(0, 0, width, height);
	const bwData = blackOrWhitePixelsByThreshold(frame.data, threshold);
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

export function avarageRGB(frame: ImageData): { r: number; g: number; b: number; char: number } {
	const length = frame.data.length / 4;

	let red = 0;
	let green = 0;
	let blue = 0;

	for (let i = 0; i < length; i++) {
		red += frame.data[i * 4 + 0];
		green += frame.data[i * 4 + 1];
		blue += frame.data[i * 4 + 2];
	}
	const r = red / length;
	const g = green / length;
	const b = blue / length;

	const brightnessLevels = Math.round(255 / charset.length);
	const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

	const char = Math.round(hsp / brightnessLevels);

	return {
		r,
		g,
		b,
		char
	};
}

const charset = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.   ';

export function asciirize(
	context: CanvasRenderingContext2D,
	hiddenContext: CanvasRenderingContext2D,
	width: number,
	height: number,
	fontWidth: number,
	fontHeight: number
) {
	for (let y = 0; y < height; y += fontHeight) {
		for (let x = 0; x < width; x += fontWidth) {
			const frame = hiddenContext.getImageData(x, y, fontWidth, fontHeight);
			const { r, g, b, char } = avarageRGB(frame);

			context.fillStyle = `rgb(${r},${g},${b})`;
			context.fillText(charset[char], x, y);
		}
	}
}
