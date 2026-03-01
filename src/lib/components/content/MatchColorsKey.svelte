<script>
import gospelParallels from "@cbop-dev/aland-gospel-synopsis";
import { LexPhraseAndLocations, ParallelColumnGroup} from "./parallelTexts.svelte";
let {
    numColumns=4,
    useGospels=true
} = $props();
const pallete = ParallelColumnGroup.getLexIdenticalPhrasePalette(numColumns);
const columnNames = useGospels? Object.values(gospelParallels.gospels.abbreviations) : Array.from({length: numColumns}).map((_,i)=>i+1);
</script>

<div class="items-center text-center m-auto">
<table class="table table-compact self-center w-auto m-auto">
        <thead>
            <tr class="text-black">

           
            {#each columnNames as name }
            <th class="p-2 font-bold font-black">{name}</th>
            {/each}
           
                
            </tr>
        </thead>
        <tbody>
        
    {#each pallete as color,index}
        {@const indexFlags=LexPhraseAndLocations.reverseCalcColumnMatchesFromMatchTypeIndex(index,numColumns)}
    <!-- index: {index}; flags: [{indexFlags?.join(',')}]-->
    
        {@const includedColumns=indexFlags ?
            columnNames.filter((name,i)=>indexFlags[i]) 
          : []
        }
        
        <tr>
        {#each columnNames as name,i}
                <td class="table-cell w-5 h-5 border-t-1" style="background-color:{indexFlags && indexFlags[i] ? color.bg: 'transparent'}; color: {indexFlags && indexFlags[i] ? color.font: 'transparent'}">
                </td>
        {/each}
        </tr>
    {/each}
    </tbody>
    </table>
</div>