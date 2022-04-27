<script lang="ts">
	import { browser } from '$app/env';
	import { pixelize, binarize, asciirize } from '$lib/utils';
	import { srcObject } from '$lib/actions';
	import { onMount, onDestroy } from 'svelte';

	let width = 640;
	let height = 360;
	let pixelSize = 16;
	let fontSize = 16;
	let threshold = 96;
	let type: 'ascii' | 'binary' = 'ascii';

	let video: HTMLVideoElement | null;
	let canvas: HTMLCanvasElement | null;
	let hiddenCanvas: HTMLCanvasElement | null;
	let context: CanvasRenderingContext2D | null;
	let hiddenContext: CanvasRenderingContext2D | null;
	let stream: MediaStream | null;

	let animationFrame = -1;

	let camWidth = 640;
	let camHeight = 360;

	const draw = () => {
		if (context && hiddenContext && video && canvas && hiddenCanvas) {
			if (type === 'binary') {
				// pixelize the frame
				pixelize(context, video, canvas, pixelSize, width, height, camWidth, camHeight);
				// make the frame a binary image (black/white with image thresholding)
				binarize(context, threshold, width, height);
			}

			if (type === 'ascii') {
				asciirize(context, hiddenContext, video, width, height, camWidth, camHeight, fontSize);
			}
		}

		// continue animation loop
		animationFrame = requestAnimationFrame(draw);
	};

	const play = () => {
		if (video) {
			video.play();
		}
	};

	const mount = async () => {
		if (video && canvas && hiddenCanvas) {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { width: camWidth, height: camHeight, frameRate: 60 }
			});
			video.setAttribute('playsinline', 'true');
			context = canvas.getContext('2d');
			hiddenContext = hiddenCanvas.getContext('2d');
		}
	};

	const destroy = () => {
		if (browser) {
			cancelAnimationFrame(animationFrame);
		}
	};

	onMount(mount);
	onDestroy(destroy);
</script>

<svelte:head>
	<title>BootCam(py)</title>
</svelte:head>
<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<video
	class="hidden"
	use:srcObject={stream}
	bind:this={video}
	autoplay
	on:loadedmetadata={play}
	on:play={draw}
>
	<track kind="captions" />
</video>
<canvas bind:this={canvas} {width} {height} class:dark={type === 'ascii'} />
<canvas class="hidden" bind:this={hiddenCanvas} {width} {height} />

<aside>
	<details>
		<summary>Options</summary>
		<fieldset for="type">
			<h3>Effect type</h3>
			<div>
				<label>
					<input type="radio" name="type" value="ascii" bind:group={type} /><span>Asciirize</span>
				</label>
				<label>
					<input type="radio" name="type" value="binary" bind:group={type} /><span>Binarize</span>
				</label>
			</div>
		</fieldset>
		{#if type === 'binary'}
			<label for="threshold">
				<span>Threshhold:</span>
				<input id="threshold" type="range" min="0" max="255" step="1" bind:value={threshold} />
				<input type="text" bind:value={threshold} />
			</label>
			<label for="pixelSize">
				<span>Pixel size:</span>
				<input id="pixelSize" type="range" min="0.1" max="32" step="0.1" bind:value={pixelSize} />
				<input type="text" bind:value={pixelSize} />
			</label>
		{/if}
		{#if type === 'ascii'}
			<label for="fontSize">
				<span>Font size:</span>
				<input id="fontSize" type="range" min="8" max="48" step="1" bind:value={fontSize} />
				<input type="text" bind:value={fontSize} />
			</label>
		{/if}
	</details>
</aside>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: sans-serif;
		overflow: hidden;
	}

	.hidden {
		display: none;
	}

	summary {
		cursor: pointer;
	}

	aside {
		gap: 0.33em;
		position: fixed;
		top: 2rem;
		right: 2rem;
		background-color: hsla(0, 0%, 0%, 0.7);
		padding: 1em;
		color: hsla(0, 0%, 100%, 1);
	}

	label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
	}

	fieldset {
		border: 0;
		border-bottom: 1px dashed hsla(0, 0%, 100%, 1);
		padding: 0 0 1em;
	}

	fieldset > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	fieldset label {
		display: inline;
	}

	fieldset + label {
		margin-top: 1em;
	}

	input[type='text'] {
		width: 4ch;
	}
</style>
