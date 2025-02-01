<script>
	import { Carta, Markdown } from 'carta-md';
	import DOMPurify from 'isomorphic-dompurify';

	export let value;

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize
	});
</script>

<Markdown {carta} {value} />
