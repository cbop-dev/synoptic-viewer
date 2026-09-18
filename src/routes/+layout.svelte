<script>
	import '../app.css';
	import Footer from '$lib/components/content/Footer.svelte';
	
	let { children } = $props();
</script>

{@render children()}

<div id="page-footer-div" class="border-t-1 block text-sm text-center w-full *:clear-both z-50 mt-8">
	<Footer />
</div>

<style>
	@reference 'tailwindcss';
	#page-footer-div {
		background: color-mix(var(--bg-content, #ffffff88) 60%, transparent);
	}
</style>
