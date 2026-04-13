<script>
import gospelParallels from "@cbop-dev/aland-gospel-synopsis";
import { LexPhraseAndLocations, ParallelColumnGroup} from "./parallelTexts.svelte";
let {
    numColumns=4,
    useGospels=true,
    otherColumn=true,
} = $props();
//let additionalColumns = $derived((useGospels || otherColumn) ? 1: 0);
const palette = $derived(ParallelColumnGroup.getLexIdenticalPhrasePalette(numColumns, otherColumn));
const columnNames = $derived(useGospels? Object.values(gospelParallels.gospels.abbreviations) : Array.from({length: numColumns}).map((_,i)=>i+1));

</script>

<div class="items-center text-center m-auto">
<!--<h1>Num colors: {palette.length}</h1>-->
<table class="table table-compact self-center w-auto m-auto">
        <thead>
            <tr class="text-black">

           
            {#each columnNames as name }
            <th class="p-2 font-bold font-black">{name}</th>
            {/each}
           
                
            </tr>
        </thead>
        <tbody>
    
    {#each palette as color,index}
        {@const indexFlags=LexPhraseAndLocations.reverseCalcColumnMatchesFromMatchTypeIndex(index,numColumns)}
    <!-- index: {index}; flags: [{indexFlags?.join(',')}]-->
    
        {@const includedColumns=indexFlags ?
            columnNames.filter((name,i)=>indexFlags[i]) 
          : []
        }
        
        <tr>
        {#if otherColumn && index == palette.length-1}
             <td class="table-cell h-5 p-1 border-t-1 italic bold text-center items-center " colspan="{numColumns}" 
                    style="background-color:{color.bg}; 
                    color: {color.font}">Other{useGospels? " NT Books" : ""}
                    </td>
            
        {:else}

            {#each columnNames as name,i}
                    <td class="table-cell w-5 h-5 border-t-1" 
                    style="background-color:{indexFlags && indexFlags[i] ? color.bg: 'transparent'}; 
                    color: {indexFlags && indexFlags[i] ? color.font: 'transparent'}">
                    </td>
            {/each}
        {/if}
        </tr>
    {/each}
    </tbody>
    </table>
</div>