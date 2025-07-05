<script>
    import copyIcon from '$lib/components/ui/icons/copy.svg'
    let {
        copyText='',
        getTextFunc=null,
        tooltip='Copy',
        linkText='',
        showButton=true,
        btnSizeCssClass='btn-sm'
    } = $props();

    function copyToClipboard(){
        let theText=copyText;
        if (getTextFunc)
            theText=getTextFunc();
        navigator.clipboard.writeText(theText);
    }
</script>
<button title={tooltip} onclick={copyToClipboard} class={["btn btn-ghost p-0.5",btnSizeCssClass]}>
    {#if linkText}
    {linkText}
    {/if}
    {#if showButton}
        <img src={copyIcon} />
    {/if}
</button>