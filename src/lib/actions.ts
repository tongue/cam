export function srcObject(node: HTMLVideoElement, stream: MediaStream | null) {
	node.srcObject = stream;
	return {
		update(newStream: MediaStream | null) {
			if (node.srcObject !== newStream) {
				node.srcObject = newStream;
			}
		}
	};
}
