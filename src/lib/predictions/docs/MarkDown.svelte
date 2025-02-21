<script>
	import { marked } from 'marked';
	export let markdown;

	// Remove metadata (lines starting with "icon:")
	let cleanedMarkdown = markdown.replace(/^icon:.*$/gm, '');

	// Convert Markdown to HTML
	let htmlContent = marked(cleanedMarkdown);
</script>

<div class="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg">
	<div class="prose prose-lg prose-blue custom-markdown mx-auto">
		{@html htmlContent}
	</div>
</div>

<style>
	/* Markdown Styling Fix */
	.custom-markdown {
		@apply leading-relaxed text-gray-800;
	}

	.custom-markdown h1 {
		@apply mb-6 mt-6 text-center text-5xl font-bold;
	}

	.custom-markdown h2 {
		@apply mb-5 mt-10 text-3xl font-semibold text-gray-700;
	}

	.custom-markdown h3 {
		@apply mb-4 mt-8 text-2xl font-semibold text-gray-600;
	}

	.custom-markdown p {
		@apply mb-6 text-lg leading-relaxed;
	}

	.custom-markdown ul,
	.custom-markdown ol {
		@apply my-4 space-y-4 pl-5 text-lg leading-relaxed;
	}

	.custom-markdown li {
		@apply pl-2;
	}

	.custom-markdown a {
		@apply font-medium text-blue-600 underline hover:text-blue-800;
	}

	.custom-markdown strong {
		@apply font-semibold text-gray-900;
	}

	.custom-markdown blockquote {
		@apply my-6 border-l-4 border-blue-500 pl-4 italic text-gray-700;
	}

	.custom-markdown hr {
		@apply my-8 border-gray-300;
	}

	.custom-markdown pre {
		@apply my-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white;
	}

	.custom-markdown code {
		@apply rounded bg-gray-200 p-1 text-sm;
	}
</style>
