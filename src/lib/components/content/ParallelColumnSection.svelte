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
</style>
<script>
    import { mylog } from '$lib/env/env.js';
  
    import Button from '../ui/Button.svelte';
    import BibleTextBlock from './BibleTextBlock.svelte';
    import { ParallelColumnGroup } from './parallelTexts.svelte';
    import { SynopsisOptions3 } from './SynopsisClasses.svelte';
    
   
    
   
    
    /**
     * @type {{parTextGroup: ParallelColumnGroup,
     * wordClick:function(number):void,
     * cssClassDict:Object<number,string>,
     * cssCustomDict:Object,
     * options:SynopsisOptions3,
     * showNotes:boolean,
     * selectedLexesPallete:{bg:string,font:string,border:string}[],
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
        selectedLexesPallete=[],
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

    let numCols=$derived(parTextGroup.parallelColumns.length)
 
    
    let columnStyle = $derived('grid-cols-'+numCols);

   




//$inspect("ParTexts, focus:", focus)
//$inspect("numCols", numCols, "colData:", colData)
//$inspect("ParText, customClass", cssCustomDict);
//$inspect(`options.unique: ${options.viewOptions.unique}`);
$inspect(`ParalColSec.lexPalette:`, selectedLexesPallete);
</script>



    <div 
    class="grid  
    {numCols >=2 ? "sm:grid-cols-2" : ''}
    {
        numCols == 3 ? "md:!grid-cols-3 gap-1" : 
        numCols ==4 ? "lg:!grid-cols-4 gap-1" :
        numCols ==5 ? "lg:grid-cols-5 gap-1" :
        ""
    } grid-cols-1 text-2xl">
           
        {#each parTextGroup.parallelColumns as col, index}
            
        {#if col.textRefs && col.textRefs.length}
            <div class="rounded-box  m-1 p-2 column column-{index}">
            {#if col.textRefs.length}
            
                
                {#each col.textRefs as textRef, index2}
                
                {@const unique = (options.viewOptions.unique && numCols > 1)? col.unique : new Set()}
                
                
                    {#if index2 > 0}<br/>{/if}
                    <div class="text-left">
   
                    <BibleTextBlock {textRef}  parGroup={parTextGroup} {options} {numCols} copyButton={true} 
                    cssLexClassDict={cssClassDict} cssCustomStringDict={cssCustomDict} 
                    {showNotes} uniqueSet={unique} notesClick={showNotesFunction} {selectedLexesPallete}
                        {wordClick} 
                    />


                            
                           


                     <!--{@render showText(myOptions,cssClasses)}-->
                    </div>
                    <!--<hr class='border-accent-content'/> -->
                {/each}
                
            
            {/if}
            </div>
        
                
        {/if}
        {/each}


    </div>
    
