<script>
//    import { tfLxxBooksDict as tfLxxBooksDict, posDict as posDict, } from "$lib/lxx/tfLXX";
    import {onMount} from 'svelte';
    import { TfServer } from '../TfUtils';
    //
    //import Button from "./ui/Button.svelte";\
    import Button from '$lib/components/ui/Button.svelte';
    import Modal2 from '$lib/components/ui/Modal2.svelte';
    import { SynopsisOptions3 } from '../SynopsisClasses.svelte';
    //import { LexQuery, LexQueryFilter } from "./LexQuery.svelte.js";
    //import LxxTextsDisplay from "./LxxTextsDisplay.svelte";
    //const getLexUrl = server + "getrefs/"
//    let getLexUrl = "http://tf.lxx.cbop.faith:5000/getrefs/"

    //let query =$state(new LexQuery());


    let {
        lexId,
        lexGreek,
        link=false,
        //lexRefQuery=new LexQuery(),
        options=new SynopsisOptions3(),
        /**
        * @type {null|number[]} sections
        */
        //sections=null

    } = $props();

    /**
     * 
     * @param wordid {number|string}
     */
    async function fetchRefs(wordid,theSections=null) {
        const url = getLexUrl + wordid +
            (theSections ? "?sections=" + theSections.join(',') : '');
    
        if (theSections) {
            lexRefQuery.sections=theSections

        }
        console.debug("Fetching " + url);
        const res = await fetch(url);
        lexRefQuery.sent = true;
        const theJsonObj = await res.json();
        lexRefQuery.response=theJsonObj
        lexRefQuery.makeReady();
        
    }
    onMount(()=>{
        //fetchRefs(lexId,sections);
    });

</script>

<div>
    {#if lexRefQuery.sent==true && lexRefQuery.ready == false}
        <i>Awaiting data...</i>
    {:else if lexRefQuery.ready == true }
        <Button  buttonColors="btn btn-secondary" buttonStyle="m-1 p-1 mt-0 mb-0 p-0" 
        toggled={()=>{Utils.copyToClipboard(tfLxxBooksDict.combineRefs(lexRefQuery.response['refs']))}} buttonText="Copy" /> 
            
        <ModalButton buttonText="View the Texts"   buttonStyle=" btn btn-secondary text-white m-1 p-1 mt-0 mb-0 p-0">
        <LxxTextsDisplay title="All {sections ? '' : 'LXX ' }instances of {lexGreek} {sections ? 'in section': ''}" 
        sectionIDs={lexRefQuery.response['nodes']} refs={lexRefQuery.response['refs']}/>
        </ModalButton><br/>

            {tfLxxBooksDict.combineRefs(lexRefQuery.response['refs'])}
    {:else}
        <i>Lemma info will show here.</i>
    {/if}
</div>
<div class="float-right"></div>



