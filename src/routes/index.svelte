<script lang="ts">
	import { browser } from '$app/env';
	import { pixelize, binarize } from '$lib/utils';
	import { srcObject } from '$lib/actions';
	import { onMount, onDestroy } from 'svelte';

	export let aspectRatio = 4 / 3;

	let width = 640;
	let height = 480;
	let pixelSize = 8;
	let threshold = 96;

	let video: HTMLVideoElement | null;
	let canvas: HTMLCanvasElement | null;
	let context: CanvasRenderingContext2D | null;
	let stream: MediaStream | null;

	let animationFrame = -1;

	$: height = Math.round(width / aspectRatio);

	const draw = () => {
		if (context && video && canvas) {
			// pixelize the frame
			pixelize(context, video, canvas, pixelSize, width, height);
			// make the frame a binary image (black/white with image thresholding)
			binarize(context, threshold, width, height);
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
		if (video && canvas) {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 640, height: 480, frameRate: 60 }
			});
			context = canvas.getContext('2d');
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
	<title>Pixelized Binary Image Cam</title>
</svelte:head>
<svelte:window bind:innerWidth={width} />
<video use:srcObject={stream} bind:this={video} autoplay on:loadedmetadata={play} on:play={draw}>
	<track kind="captions" />
</video>
<canvas bind:this={canvas} {width} {height} />

<aside>
	<h2>Options</h2>
	<label for="pixelSize">
		<span>Pixel size:</span>
		<input id="pixelSize" type="range" min="0.1" max="32" step="0.1" bind:value={pixelSize} />
		<input type="text" bind:value={pixelSize} />
	</label>
	<label for="threshold">
		<span>Threshhold:</span>
		<input id="threshold" type="range" min="0" max="255" step="1" bind:value={threshold} />
		<input type="text" bind:value={threshold} />
	</label>
</aside>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: sans-serif;
	}

	video {
		display: none;
	}

	aside {
		display: flex;
		flex-direction: column;
		gap: 0.33em;
		position: absolute;
		top: 2em;
		right: 2em;
		background-color: hsla(0, 0%, 0%, 0.7);
		padding: 1em;
		color: hsla(0, 0%, 100%, 1);
	}

	h2 {
		margin: 0 0 0.33em;
	}

	label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
	}

	input[type='text'] {
		width: 4ch;
	}
</style>
