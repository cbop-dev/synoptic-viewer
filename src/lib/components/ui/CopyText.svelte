<script>
    import copyIcon from '$lib/components/ui/icons/copy.svg'
    import Icon from './icons/Icon.svelte';
    import { mylog } from '$lib/env/env';
    let {
        copyText='',
        getTextFunc=null,
        icon=copyIcon,
        tooltip='Copy',
        linkText='',
        showButton=true,
        btnSizeCssClass='btn-sm',
        btnCssClass='',
        width=0,
        height=0
    } = $props();

    function copyToClipboard(){
        let theText=copyText;
        if (getTextFunc) {
            theText=getTextFunc();
//            mylog("called getTextFunc()!")
        }
        navigator.clipboard.writeText(theText);
    }
</script>
<button title={tooltip} onclick={copyToClipboard} class={["btn btn-ghost p-0.5",btnSizeCssClass, btnCssClass]}>
    {#if linkText}
    {linkText}
    {/if}
    {#if showButton}
        {#if width && height}
            <Icon svg={icon} {width} {height}/>
        {:else}
        <Icon svg={icon} />
        {/if}
    {/if}
</button>