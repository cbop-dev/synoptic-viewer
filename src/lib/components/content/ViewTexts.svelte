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
    import * as bibleUtils from "$lib/utils/bible-utils.js";
    import ArrowUp from "../ui/icons/arrow-up.svelte";
    import ArrowDown from "../ui/icons/arrow-down.svelte";
    import * as uiUtils from "$lib/utils/ui-utils.js";
    import * as bibleRefUtils from "$lib/utils/bibleRefUtils.js";
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
        mylog(`getText('${ref}')`);
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

    let chosenRefIdx=$state(-1);
   
    //console.debug("text.description = " + description);
    /**
     * @type {Object<number,boolean>}
     */
     let loadSectionTexts=$state({});

     
     /**
      * @type {Object<string,{book:string,chap:string,v:string}[]>} refsGroupedByBook
      */
     let refsGroupedByBook=$derived.by(()=>{
            
            let currentBook = '';
            
            /**
             * @type {Object<string,{book:string,chap:string,v:string}[]>} newRefs
             * @description key is book name/abbrev; value is book/chap/verse object array.
             */
            let newRefs={};

            refs.forEach((ref)=>{
                const bCv=bibleUtils.getBookChapVerseFromRef(ref);
                if (bCv.book){
                    currentBook =bibleRefUtils.getBookAbbrev(bCv.book);
                }
                else{
                    bCv.book=currentBook;
                }
                
                if (!Object.keys(newRefs).includes(bCv.book)){
                    newRefs[bCv.book]=[];
                }
                newRefs[bCv.book].push(bCv);

                
            });
            return newRefs;
     });
     let books=$derived(Object.keys(refsGroupedByBook));

     /**
      * 
      * @param bcv {{book:string, chap:string,v:string}}
      */
     function bCvToString(bcv, omitBook=false){

        let ret = bcv.chap + ":" +bcv.v;
        if (!omitBook){
            ret = (bcv.book ? bcv.book.replaceAll(" ","") + " ":'') + ret;
        }
//        mylog(`bCvToString(${JSON.stringify(bcv)},${omitBook}) --> ${ret}`,true);
        return ret;
     }

     
     /**
      * @type {Object<number,string>}
      * @description the biblical text of each reference, once fetched. Keyed by sectionIDs index.
      */
//     let textsFetched=$state({});


//SD$inspect(`ref2Show: '${ref2Show}'; fetching:${fetching}; textReady=${textReady}`)
</script>
<div class="text-center">
<div class="inline " id="refs-top"></div>
<h2>{title}</h2>

<div><span class="italic btn-accent">Click on a verse to see the text!</span>
Jump to book:<br/> {#each books as book}
    <Button 
    buttonType="btn-accent"
    buttonStyle="text-bold p-2 m-1" 
    buttonColors="hover:bg-blue-400 hover:text-white hover:"
    
    onclick={()=>uiUtils.jumpToDiv(book.replaceAll(" ","_"))}
    buttonText={book}
    />
    {/each}


</div>
<!---<div class="flex flex-wrap">-->

<div class="w-full text-center">
{#each Object.entries(refsGroupedByBook) as [book,bookRefs],i}
    
    {@const combinedRefs =bibleUtils.combineRefs(bookRefs.map((ref)=>bCvToString(ref)))}
    <!--<b>{combinedRefs}</b>-->
    <!-- sum up total entries of all previous books from 0...i-1 -->
    {@const indexOffset = Object.values(refsGroupedByBook).map((bookRefs)=>bookRefs.length).slice(0,i).reduce((a,b)=>a+b,0)}
    <span id={book.replaceAll(" ","_")} class="block bg-slate-700 text-white font-bold">{book}
            <a href="#refs-top" onclick={()=>uiUtils.jumpToDiv("refs-top")}><ArrowUp width={15} height={15}/></a>
            <CopyText copyText={combinedRefs}
                
                btnSizeCssClass="btn-xs  text-bold"
                btnCssClass="bg-white/60 hover:bg-white" 
                
                tooltip="Copy {book} references"
                width={15}
                height={15}
            />
        </span>        
    {#each bookRefs as ref,j}
   
    
    
        
        <Button buttonText={bCvToString(ref,true)} 
        buttonColors="btn-ghost" 
        buttonStyle="btn-sm p-0.5 m-0.5 hover:bg-slate-500 hover:text-white rounded"
        onclick={()=>{chosenRefIdx=indexOffset+j; getText(bCvToString(ref)); showModal=true;}}

        />
    {/each}
{/each}
</div>
</div>
<!--
<Modal2 bind:showModal={showModal} max={true}>
    
    {#if !textsFetched[chosenRefIdx]}
    Loading...<span class="loading loading-spinner loading-lg"></span>
    {:else}
        {@const theText=textsFetched[chosenRefIdx]}
        {@const theRef = refs[chosenRefIdx]}

        <div class="block" >
        <h2>{theRef}</h2>
        <p class="greek text-2xl">{theText}</p>
        
        <CopyText copyText={theRef+": " +theText} />
        
        </div>

    {/if}
</Modal2>
-->



<Modal2 bind:showModal={showModal}>
{#if ref2Show && !fetching}
{@const plainText=tfServer.lang=='greek' && tfServer.hasApparatus ? GreekUtils.removeApparatusMarks(texts[ref2Show]): texts[ref2Show]}
{@const theText=hideApparatus  && tfServer.hasApparatus ? plainText: texts[ref2Show] }
<h2 class="text-2xl bold">{ref2Show} {#if tfServer.hasApparatus && texts[ref2Show] != plainText}<ButtonSelect bind:selected={hideApparatus} buttonText="Apparatus marks" buttonStyle='btn btn-xs'/>{/if}</h2>

<div class="text-3xl bg-slate-200 shadow-2xl">
    {theText}
    <CopyText copyText={theText}/>
</div>

{:else if fetching}
<Loading title="Please wait while we load the text..." message={[]}/>

{/if}

</Modal2>
