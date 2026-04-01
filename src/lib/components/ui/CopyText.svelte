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
        tooltipBottom=false,
        width=0,
        height=0,
        svgStyle=''
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
<button title={tooltip} onclick={copyToClipboard} 
class={["btn btn-ghost p-0.5",btnSizeCssClass, btnCssClass,
 tooltip? "tooltip":'',
 tooltipBottom ? 'tooltip-bottom' : '']}
data-tip={tooltip} >
    {#if linkText}
    {linkText}
    {/if}
    {#if showButton}
        {#if width && height}
            <Icon svg={icon} {width} {height} style={svgStyle}/>
        {:else}
        <Icon svg={icon} style={svgStyle}/>
        {/if}
    {/if}
</button>

