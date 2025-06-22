<!-- @migration-task Error while migrating Svelte code: Expected a valid element or component name. Components must have a valid variable name or dot notation expression
https://svelte.dev/e/tag_invalid_name -->
<script>
    let {
        height=122.433,
        width=122.433,
        scale=1.0
    } = $props();

    let theHeight=$derived(height*scale);
    let theWidth=$derived(width*scale);
</script>
<style>
    @reference 'tailwindcss';
    svg{
        @apply inline;

    }
</style>
<svg  xmlns="http://www.w3.org/2000/svg" width={theWidth} height={theHeight}
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="M6 4h12v2H6zM12 7.59l-6.71 6.7 1.42 1.42 4.29-4.3V20h2v-8.59l4.29 4.3 1.42-1.42z"></path>
</svg>