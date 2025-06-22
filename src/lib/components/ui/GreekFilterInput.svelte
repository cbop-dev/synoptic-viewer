<script>
    import FilterInput from "./FilterInput.svelte";
    import { GreekUtils } from "$lib/utils/greek-utils.js";
    //import { Utils } from "$lib/utils/utils";
    let {
        /**
        * @type {string[]} itemsList
        */
        itemsList,
        max=100,
        labelText="Type some Greek letters in betacode:",
        casesensitive=$bindable(false),

        /**
         * @param {string} input
        */
        //filter= (input)=>{return [input.trim()];}, //optionally used to filter input; should return an *array* of strings to check as the input text.

        /**
         * @type {number[]} index (of itemsList) for partially matching strings
        */
        bestMatches = $bindable(),
        otherMatches = $bindable(),
        tooltip=''

    } = $props();
    let filterInput;
    export function clear(){
        filterInput.clear();
        //console.debug("called FilterInput.clear()");
    }
</script>

<FilterInput transform={(input)=>{return GreekUtils.beta2Greek(input.trim())}}
    searchTerms={(input)=>{
        let ret = [input];
        if (input.includes('ς')) {   
            ret.push(input.replaceAll('ς','σ'));
        }
        return ret;
    }}
bind:this={filterInput} max={50} labelText={labelText} itemsList={itemsList} bind:bestMatches
bind:otherMatches {tooltip} bind:casesensitive={casesensitive}/>