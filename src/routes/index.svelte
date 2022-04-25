<script lang="ts">
	const camWidth = 640;
	const camHeight = 480;
	const frameRate = 30;
	const aspectRatio = 4 / 3;

	let width = 640;
	let height = 480;
	let pixelSize = 8;
	let threshold = 96;
	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;

	async function init(videoElement: HTMLVideoElement): Promise<void> {
		if (videoElement) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { width: camWidth, height: camHeight, frameRate }
				});
				videoElement.srcObject = stream;
			} catch (error) {
				alert('no video stream');
			}
			context = canvas.getContext('2d');
		}
	}

	const draw = () => {
		if (context) {
			const scale = 1 / pixelSize; // calculate scale fraction
			const widthScaled = width * scale;
			const heightScaled = height * scale;

			context.drawImage(video, 0, 0, widthScaled, heightScaled); // draw small version of image
			context.imageSmoothingEnabled = false;
			context.drawImage(canvas, 0, 0, widthScaled, heightScaled, 0, 0, width, height); // scale up the previously drawn image

			let color: number = 0;
			let image = context.getImageData(0, 0, width, height);

			let { data } = image;
			for (let i = 0; i < data.length; i = i + 4) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];

				if ((r + g + b) / 3 < threshold) {
					color = 0;
				} else {
					color = 255;
				}

				data[i] = data[i + 1] = data[i + 2] = color;
			}

			context.putImageData(new ImageData(data, width, height), 0, 0);
		}

		setTimeout(draw, frameRate);
	};

	$: init(video);

	$: height = width / aspectRatio;
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<video bind:this={video} autoplay on:loadedmetadata={() => video.play()} on:play={draw}>
	<track kind="captions" />
</video>
<canvas bind:this={canvas} {width} {height} />
<aside>
	<label for="pixelSize">
		Pixel size:
		<input id="pixelSize" type="range" min="0.1" max="32" step="0.1" bind:value={pixelSize} />
	</label>
	<label for="threshold">
		Threshhold:
		<input id="threshold" type="range" min="0" max="255" step="1" bind:value={threshold} />
	</label>
</aside>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	video {
		display: none;
	}
	aside {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 2em;
		right: 2em;
	}
	label {
		display: flex;
		color: hotpink;
	}
</style>
