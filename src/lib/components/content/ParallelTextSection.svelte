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
    import { ParallelTextGroup } from './parallelTexts.svelte';
    
   
    
   
    
    /**
     * @type {{parTextGroup: ParallelTextGroup,
     * wordClick:function(number):void,
     * showIdentical:boolean,
     * cssClassDict:Object<number,string>,
     * cssCustomDict:Object,
     * showUnique:boolean,
     * highlightOnClick:boolean,
     * showNotes:boolean,
     * showNotesFunction(heading:string,note:string):void
     * }}
     */
    let {
        parTextGroup = new ParallelTextGroup(),
        showUnique=false,
        showIdentical=true,
        wordClick=(id)=>{},
        cssClassDict={},
        cssCustomDict={},
        highlightOnClick=true,
        showNotes=true,
        showNotesFunction=(heading,note)=>{alert(heading+"\n"+note)}
        
    } = $props();

  
   /**
 * * @param {string} heading 
 * @param {string} note 
*/
function notesClick(heading,note){
    showNotesFunction(heading,note);
}

    let numCols=$derived(parTextGroup.parallelTexts.length)
 
    
    let columnStyle = $derived('grid-cols-'+numCols);

   




//$inspect("ParTexts, focus:", focus)
//$inspect("numCols", numCols, "colData:", colData)
//$inspect("ParText, customClass", cssCustomDict);
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
    
        {#each parTextGroup.parallelTexts as col, index}
            
        {#if col.textRefs && col.textRefs.length}
            <div class="rounded-box  m-1 p-2 column column-{index}">
            {#if col.textRefs.length}
            
                
                {#each col.textRefs as textRef, index2}
                
                {@const unique = (showUnique && numCols > 1)? col.unique : new Set()}
               
               
                    {#if index2 > 0}<br/>{/if}
                    <div class="text-left">
                     
                    <BibleTextBlock {textRef}  parGroup={parTextGroup} {showUnique} {numCols} copyButton={true} {showIdentical}
                    cssWordClassDict={cssClassDict} cssWordCustomDict={cssCustomDict} 
                    {showNotes} uniqueSet={unique} bind:highlightOnClick={highlightOnClick} notesClick={showNotesFunction} 
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
    
