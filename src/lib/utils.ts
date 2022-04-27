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
	height: number,
	camWidth: number,
	camHeight: number
): void {
	context.clearRect(0, 0, width, height);

	const scale = 1 / pixelSize;
	const widthScaled = width * scale;
	const heightScaled = height * scale;
	const {
		offsetX,
		offsetY,
		width: newWidth,
		height: newHeight
	} = cover(width, height, camWidth, camHeight);

	context.drawImage(video, 0, 0, widthScaled, heightScaled); // draw small version of image
	context.imageSmoothingEnabled = false;
	context.drawImage(canvas, 0, 0, widthScaled, heightScaled, offsetX, offsetY, newWidth, newHeight); // scale up the previously drawn image
}

function normalize(val: number, min: number, max: number) {
	return (val - min) / (max - min);
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

	const char = Math.round(normalize(hsp, 0, 255) * brightnessLevels);

	return {
		r,
		g,
		b,
		char
	};
}

const charset = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'.   ';

function fit(contains: boolean) {
	return (
		parentWidth: number,
		parentHeight: number,
		childWidth: number,
		childHeight: number,
		scale = 1,
		offsetX = 0.5,
		offsetY = 0.5
	) => {
		const childRatio = childWidth / childHeight;
		const parentRatio = parentWidth / parentHeight;

		let width = parentWidth * scale;
		let height = parentHeight * scale;

		if (contains ? childRatio > parentRatio : childRatio < parentRatio) {
			height = width / childRatio;
		} else {
			width = height * childRatio;
		}

		return {
			width,
			height,
			offsetX: (parentWidth - width) * offsetX,
			offsetY: (parentHeight - height) * offsetY
		};
	};
}

const cover = fit(false);

export function asciirize(
	context: CanvasRenderingContext2D,
	hiddenContext: CanvasRenderingContext2D,
	video: HTMLVideoElement,
	width: number,
	height: number,
	camWidth: number,
	camHeight: number,
	fontHeight: number
) {
	context.textBaseline = 'top';
	context.font = `${fontHeight}px monospace`;
	const {
		offsetX,
		offsetY,
		width: newWidth,
		height: newHeight
	} = cover(width, height, camWidth, camHeight);

	hiddenContext.drawImage(video, offsetX, offsetY, newWidth, newHeight);
	const { width: fontWidth } = context.measureText('@');
	context.clearRect(0, 0, width, height);
	context.fillStyle = 'rgb(32, 32, 32)';
	context.fillRect(0, 0, newWidth, newHeight);
	for (let y = 0; y < height; y += fontHeight) {
		for (let x = 0; x < width; x += fontWidth) {
			const frame = hiddenContext.getImageData(x, y, fontWidth, fontHeight);
			const { r, g, b, char } = avarageRGB(frame);

			context.fillStyle = `rgb(${r},${g},${b})`;
			context.fillText(charset[char], x, y);
		}
	}
}
