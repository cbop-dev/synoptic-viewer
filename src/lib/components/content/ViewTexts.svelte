<script>
    import { mylog } from "$lib/env/env";
    //import { TextAndRef,} from "./parallelTexts.svelte";
    import { TfServer } from "./TfUtils";
    import { GreekUtils } from "$lib/utils/greek-utils";
    import Button from "../ui/Button.svelte";
    import ButtonSelect from "../ui/ButtonSelect.svelte";
    import Loading from "../ui/Loading.svelte";
    import Modal2 from "../ui/Modal2.svelte";
    import CopyText from "../ui/CopyText.svelte";
    /**
     * @type {{refs:string[],
     * title:string,
     * tfServer:TfServer}}
     */
    let {
        refs,
        title='View Texts',
        tfServer
    } = $props();

    let hideApparatus=$state(true);
    /**
     * @type {Object<string,string>}
     */
    const texts=$state({});
    let fetching=$state(false);
    let showModal=$state(false);
    let ref2Show=$state('');
    /**
     * 
     * @param {string} ref
     */
    async function getText(ref){
        showModal=false;
        let text = ''
        ref2Show='';
        if (!texts[ref]){
           // mylog(`gonna fetch text for '${ref}'`, true)
            fetching=true;
            //const bcvArray = tfServer.getBCVarrayFromRefs([ref]);
            const node=await tfServer.getNodeFromRef(ref);
           // mylog(`Gotta bcvArray: [${bcvArray}]`, true);
            const response = node ? await tfServer.fetchText(node) : '';// tfServer.getTexts(bcvArray,false) : null;
            
            if (response && response.text){
                text=response.text;
                ref2Show=ref;
                texts[ref2Show]=text;
             //   mylog(`ViewTexts got reponse: ${response.text}`,true)
                showModal=true;
            }
            else{
               // mylog(`ViewTexts got nadda! Reponse props:${Object.getOwnPropertyNames(response)}`, true);
            }
            fetching=false;
        }
        else{
            text = texts[ref];
            ref2Show=ref;
            showModal=true;
        }
        
    }
//SD$inspect(`ref2Show: '${ref2Show}'; fetching:${fetching}; textReady=${textReady}`)
</script>
<h2>{title}</h2>
<span class='italic'>Click on a reference to view the text:</span><br/>
{#each refs as ref, index}
    <Button buttonText={ref} onclick={()=>{getText(ref)}}/>
{/each}
<hr/>

<Modal2 bind:showModal={showModal}>
{#if ref2Show && !fetching}
{@const plainText=GreekUtils.removeApparatusMarks(texts[ref2Show])}
{@const theText=hideApparatus ? plainText: texts[ref2Show] }
<h2 class="text-2xl bold">{ref2Show} {#if texts[ref2Show] != plainText}<ButtonSelect bind:selected={hideApparatus} buttonText="Apparatus marks" buttonStyle='btn btn-xs'/>{/if}</h2>

<div class="text-3xl bg-slate-200 shadow-2xl">
    {theText}
    <CopyText copyText={theText}/>
</div>

{:else if fetching}
<Loading title="Please wait while we load the text..." message={[]}/>

{/if}

</Modal2>
