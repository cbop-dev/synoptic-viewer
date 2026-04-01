<script>
    let {
        height=24,
        width=24,
        scale=1.0,
        svg,
        style=''
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
<img width={theWidth} height={theHeight} src={svg} {style} alt="icon"/>
