<script>
	import { Carta, MarkdownEditor } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import DOMPurify from 'isomorphic-dompurify';

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize
	});

	export let value = '';
</script>

<div class="max:h-20 bg-white text-white">
	<MarkdownEditor {carta} bind:value />
</div>

<style>
	:global(.carta-theme__default) {
		--text-color: #000; /* Sets text color to white */
		--selection-color: #ffffff;
		--background-color: #ffffff; /* Sets background color to black */
		--height: 200px; /* Sets background color to black */
	}
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-editor) {
		color: #000;
		height: 200px; /* Sets the editor height to 500 pixels */
		max-height: 80vh; /* Sets the maximum height to 80% of the viewport height */
		overflow-y: auto; /* Adds a vertical scrollbar if content exceeds the set height */
	}
	:global(.carta-font-code) {
		font-family: '...', monospace;
		font-size: 1.1rem;
		max-height: 100px;
		color: #000;
	}
</style>
