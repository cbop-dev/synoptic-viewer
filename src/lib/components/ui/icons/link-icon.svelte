<script>
    import LinkSvg from  './link.svg'; 
    
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

