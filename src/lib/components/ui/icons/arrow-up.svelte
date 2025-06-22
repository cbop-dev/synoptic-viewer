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
<path d="M13 18V9.91l3.29 3.3 1.42-1.42L12 6.09l-5.71 5.7 1.42 1.42L11 9.91V18z"></path>
</svg>