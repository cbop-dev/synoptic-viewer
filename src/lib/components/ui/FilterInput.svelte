<script>
import Button from "./Button.svelte";
import ModalButton from "./ModalButton.svelte";

let {
        /**
        * @type {string[]} itemsList
        */
        itemsList,
        max=10,
        labelText="",
        casesensitive=$bindable(false),

        transform=(input)=>{return input.trim()},
        /**
         * @param {string} input
        */
        searchTerms=(input)=>{return [input];}, //optionally used to filter input; should return an *array* of strings to check as the input text.

        /**
         * @type {number[]} index (of itemsList) for partially matching strings
        */
        bestMatches = $bindable(),
        otherMatches = $bindable(),
        enableCaseSensitiveCheck=true,
        tooltip='',
        minLength=1

    } = $props();
   let inputText = $state('');
   $effect(()=>{inputText=transform(inputText)});

   let caseinsensitive=$derived(!casesensitive);
   $effect(()=>{filterItems(inputText)}) ;
   
    
    /**
    * 
    * @param {string} input
    */
   function filterItems(input=inputText){
        
        
        /**
         * @type {number[]} middleMatches
         */
        let middleMatches=[];

        /**
         * @type {number[]} beginMatches
         */
        let beginMatches=[];
        if (input.length >= minLength) {
            
            
            const inputsToCheck = searchTerms(input);
//            console.debug("search terms:" + inputsToCheck.join(','));
           // let theMatches = [];
            //console.debug("Resetting matches...")
            for (const inputToCheck of inputsToCheck) {
                if (inputToCheck.length >= minLength) {
                    //const max = 50;
                    let count = 0;
                    let bestCount = 0;
                    let otherCount = 0;

                    for (const k of itemsList.keys()){
                        if ( (caseinsensitive && itemsList[k].toLowerCase().match(new RegExp("^" + inputToCheck.toLowerCase())) 
                              && !beginMatches.includes(k) && ! middleMatches.includes(k))
                             || ((! caseinsensitive) &&itemsList[k].match(new RegExp("^" + inputToCheck)) 
                             && !beginMatches.includes(k) && ! middleMatches.includes(k))
                              
                            ) 
                        {
                            if (bestCount <= max) {
                                beginMatches.push(k);
                                bestCount += 1;
                                count+=1;
                            }
                            
                            
                            //console.debug("Found begin match");
                        }
                        else if ( (caseinsensitive && itemsList[k].toLowerCase().includes(inputToCheck.toLowerCase())
                                && !beginMatches.includes(k) && ! middleMatches.includes(k))
                            || ( ((!caseinsensitive) && itemsList[k].includes(inputToCheck)
                                && !beginMatches.includes(k) && ! middleMatches.includes(k))))
                         {
                            if (otherCount <= max) {
                                middleMatches.push(k);
                                otherCount += 1;
                                count+=1;
                            }
                            //console.debug("count = " + count)
                            
                        }

                        if (max > 0 && (bestCount > max && otherCount > max))
                            break;
                    }
                }
            
            }
        }
        ////console.debug("found matches: " + theMatches.join(','));
        //return theMatches;
        //bestMatches = beginMatches.sort()
        bestMatches = beginMatches.sort((x,y)=>itemsList[x].localeCompare(itemsList[y]));
        otherMatches = middleMatches.sort((x,y)=>itemsList[x].localeCompare(itemsList[y]));
       
    }

    export function clear(){
        inputText=''; 
       //console.debug("cleared text input...")
    }


</script>
<div class=''>
    {#if labelText}
<label for="inputfilter">{labelText}</label>
{/if}

<br/>
<input  type="search" size="15" bind:value={inputText} placeholder="Type here" class="input input-bordered w-full max-w-xs" />
<ModalButton title="Text Filter Help" buttonText="(?)" 
buttonStyle='p-0 m-0 pb-1 btn btn-sm btn-ghost '> 
    <div class="block text-left">
    Enter Latin characters, which will convert automatically to Greek!
</div>
</ModalButton>
<Button buttonStyle="btn btn-ghost btn-md" 
onclick={()=>{inputText=''}} buttonText="Clear" />
    {#if enableCaseSensitiveCheck}
    <label class="label cursor-pointer inline">
        <span class="label-text">Case&nbsp;sensitive</span>
        <input type="checkbox" bind:checked={casesensitive} class="checkbox" />
      </label>
      {/if}

</div>