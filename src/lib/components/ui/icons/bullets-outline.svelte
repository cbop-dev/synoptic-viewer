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
<path d="M9 11h11v2H9zM9 6h11v2H9zM9 16h11v2H9zM4 5.5h3v3H4zM4 10.5h3v3H4zM4 15.5h3v3H4z"></path>
</svg>