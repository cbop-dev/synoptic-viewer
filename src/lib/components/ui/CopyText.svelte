<script>
    import copyIcon from '$lib/components/ui/icons/copy.svg'
    let {
        copyText='',
        getTextFunc=null,
        tooltip='Copy',
        linkText='',
        showButton=true
    } = $props();

    function copyToClipboard(){
        let theText=copyText;
        if (getTextFunc)
            theText=getTextFunc();
        navigator.clipboard.writeText(theText);
    }
</script>
<button title={tooltip} onclick={copyToClipboard} class="btn btn-sm btn-ghost">
    {#if linkText}
    {linkText}
    {/if}
    {#if showButton}
        <img src={copyIcon} />
    {/if}
</button>