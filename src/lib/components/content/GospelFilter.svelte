<script>
import { mylog } from "$lib/env/env";
import { onMount, tick, untrack } from "svelte";
import { GospelFilter } from "./SynopsisClasses.svelte";
import Button from "../ui/Button.svelte";
/**
 * @type {{gospelFilterVal:number,onchange:function}}
 */
let {
    gospelFilterVal=$bindable(0),
    onchange=()=>{}
} = $props();


let gospelFilter=$derived(GospelFilter.fromFilterVal(gospelFilterVal));

/*const gospels = $state([
    {name:"Matthew",hide:false,flag:1},
    {name:"Mark",hide:false,flag:2},
    {name:"Luke",hide:false,flag:4},
    {name:"John",hide:false, flag:8}
]);*/

/*$effect(()=>{
    if(gospels){
        reevaluateFilter();
    }
});*/

function reevaluateFilter(){
    /*
    const [matt,mark,luke,john] =gospels.map((g,i)=>g.hide)
    gospelFilter=gospels.reduce((sum,gospel)=>{
        const gospelVal = gospel.hide ? gospel.flag : 0;
        mylog(`Gospfilter.update(${gospel.name})->${gospelVal}`);
        return sum + gospelVal;
    },0);
    */
}

async function update(){
   /* await tick();
    gospelFilter=gospels.reduce((sum,gospel)=>{
        const gospelVal = gospel.hide ? gospel.flag : 0;
        mylog(`Gospfilter.update(${gospel.name})->${gospelVal}`);
        return sum + gospelVal;
    },0);
//    mylog("GospelFilter.update resulted in : "+gospelFilter,true);
    */
}

onMount(()=>{
    //gospelFilter.set(gospelFilterVal);
    /*mylog(`gospelFilter.onMount: start filter value=${gospelFilter}`)
    gospels.forEach((gospel,index)=>{
        const theflagresult=gospel.flag&gospelFilter;
//        mylog(`GospelFilter.onMount(${gospel.name}.flagresult=${theflagresult})`, true);
        if((theflagresult) > 0){
            
            gospel.hide=true;
        }
    })*/
});

function reset(){
    gospelFilter.set(0);
}

$effect(()=>{
    changed();
    if(gospelFilter.filter >=0 && gospelFilter.filter != gospelFilterVal){
        gospelFilterVal=gospelFilter.filter;
        
      
        
    }
});
let disabled=$state(false);
async function changed(){
    disabled=true;
    await tick();
    disabled=false;
}
//$inspect("HELLO");
//$inspect(`gospelFilter:${gospelFilter}`);
//$inspect(`gospels flags:${gospels.map((g)=>g.name+':'+g.hide).join('; ')}`);
//$inspect(`GospelFilterComp.gospelFilterVal=`,gospelFilterVal)
</script>

<div id="gospel-filter-container" >
    
<table>
    <thead>
        <tr>
            <th class="p-1 m-2">Gospel</th><th class="m-2 p-1">Hide?</th>
        </tr>
   </thead>
   <tbody>
{#each GospelFilter.gospels as gospel,index }
<tr>
    <td class="p-1 m-2"> <label class="tooltip table-auto" 
        data-tip="Show Lexeme Info on Click"    
            for="lexeme-info-click">{gospel.name}</label></td>
        <td class="p-1 m-2"><input  {disabled} class="toggle" id="gospel-filter-{index}" type="checkbox" onclick={changed} bind:checked={gospelFilter.hide[index]}/></td>

</tr>

   
{/each}
<Button buttonText="Reset" onclick={reset}/>
</tbody>
</table>
</div>
<style>
    @reference "tailwindcss";

    table {
      
        td{
           /* text-align: center;*/
           @apply text-left ml-3 mr-3;
        
        }
    }


    /*div {
        @apply:  bg-red-200 !important ;
    }*/

    div, #gospel-filter-container {
        @apply flex justify-center;
    }
</style>