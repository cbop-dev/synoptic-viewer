<style>
    @reference "tailwindcss";
   /*
    .column-1 {
        @apply bg-red-50 border-red-900 border-4; 
    }

    .column-2 {
        @apply bg-lime-50 border-lime-900 border-4;
    }

    .column-3{
        @apply bg-sky-50 border-sky-900 border-4;
    }

    .column-4{
        @apply bg-violet-50 border-violet-900 border-4;
    }
    
    
    
    .lex-unique{
        @apply outline-4 pl-0.5 mr-0.5 ;
    }

    .column-0 span.lex-unique
   {
            @apply outline-red-600   ;
        
    }
    .column-1 span.lex-unique {
            @apply outline-green-600   ;
        
    }
    .column-2 span.lex-unique
    {
            @apply outline-blue-600   ;
        
    }
    .column-3 span.lex-unique {
            @apply outline-fuchsia-600   ;
        
    }
    */

    .column.solo{
        text-align: center;
        @apply flex flex-wrap;

    }
</style>
<script>
    import { mylog } from '$lib/env/env.js';
  
    import Button from '../ui/Button.svelte';
    import BibleTextBlock from './BibleTextBlock.svelte';
    import { ParallelColumnGroup } from './parallelTexts.svelte';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte';
    
   
    const uniqueColors=[
        'red','green','blue','purple','black'

    ]
   
    
    /**
     * @type {{parTextGroup: ParallelColumnGroup,
     * wordClick:function(number):void,
     * cssClassDict:Object<number,string>,
     * cssCustomDict:Object,
     * options:SynopsisOptions3,
     * showNotes:boolean,
     * selectedGreekPalette:{bg:string,font:string,border:string}[],
     * showBlankColumns:boolean,
     * showNotesFunction(heading:string,note:string):void
     * }}
     */
    let {
        parTextGroup = new ParallelColumnGroup(),
        options=new SynopsisOptions3(),
        //showUnique=false,
        //options.viewOptions.showIdentical=true,
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={},
        //options.viewOptions.highlightOnClick=true,
        showNotes=true,
        //hideApp=false,
        selectedGreekPalette=[],
        showBlankColumns=false,
        showNotesFunction=(heading,note)=>{alert(heading+"\n"+note)}
        
    } = $props();

  let showSimilarPhrases=$state(true);

   /**
 * * @param {string} heading 
 * @param {string} note 
*/
function notesClick(heading,note){
    showNotesFunction(heading,note);
}

    let numCols=$derived(parTextGroup.parallelColumns.filter((pc)=>pc.textRefs.length).length);
    
    
    let columnStyle = $derived('grid-cols-'+numCols);
    /**
     * @type {number[]} highlightedExactIndices
     */
    let highlightedExactIndices = $state([]);

    /**
     * @type {number[]} highlightedLexicalIndices
     */
    let highlightedLexicalIndices = $state([]);
   



//$inspect("ParTexts, focus:", focus)
//$inspect("numCols", numCols, "colData:", colData)
//$inspect("ParText, customClass", cssCustomDict);
//$inspect(`options.unique: ${options.viewOptions.unique}`);
//$inspect(`ParalColSec.lexPalette:`, selectedGreekPalette);
</script>

    <!--<h2 class="text-center">showing blanks: {showBlankColumns}</h2>-->


    <div 
    class=" 
    {numCols==1 ? "flex flex-1 flex-wrap ":'' }
    {numCols >=2 ? "grid sm:grid-cols-2" : 'grid grid-cols-1'}
    {
        numCols == 3 ? " grid  md:!grid-cols-3 gap-1" : 
        numCols ==4 ? " grid lg:!grid-cols-4 gap-1" :
        numCols ==5 ? " grid lg:grid-cols-5 gap-1" :
        ""
    }  text-2xl">
       
        {#each parTextGroup.parallelColumns as col, index}
        
        {#if showBlankColumns || (col.textRefs && col.textRefs.length)}
            
            <div class="rounded-box  m-1 p-2 column {numCols==1 ? 'solo' : ''} column-{index}  ">
            {#if  showBlankColumns || col.textRefs.length}                            
                {#each col.textRefs as textRef, index2}
                
                {@const unique = (options.viewOptions.unique && numCols > 1)? col.unique : new Set()}
                             
                    <!--{#if numCols>1 && index2 > 0} {/if}-->
                    <div class="text-left align-top {numCols == 1 ? 'inline-block mt-1 mb-1 md:max-w-1/2 lg:max-w-1/3 ' :''}">
   
                    <BibleTextBlock {textRef}  parGroup={parTextGroup} {options} {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes} uniqueSet={unique} notesClick={showNotesFunction} {selectedGreekPalette} --cssUniqueColor={uniqueColors[index]}
                    bind:highlightedExactIndices={highlightedExactIndices}
            bind:highlightedLexicalIndices={highlightedLexicalIndices}
                        {wordClick} 
                    />
                    </div>
                    <!--<hr class='border-accent-content'/> -->
                {/each}
                        
            {/if}
            </div>                
        {/if}
        {/each}
    </div>
    
