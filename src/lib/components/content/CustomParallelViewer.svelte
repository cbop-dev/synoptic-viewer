<script>
import { onMount } from "svelte";
import LinkSvg from  '../ui/icons/link.svg';
import { SynopsisOptions, generateURL  } from "./SynopsisClasses.svelte.js";
import { ParallelText,Word, TextAndRef,VerseWords,ParallelTextGroup,parseSingleGroup } from "./parallelTexts.svelte.js";
import ParallelTextSection from "./ParallelTextSection.svelte";
import { N1904Server, lexemes} from "$lib/n1904/tfN1904";
import {SblGntServer} from '$lib/sblgnt/sblgnt.js';


import ParallelGospelSection from "./ParallelGospelSection.svelte";
import { mylog } from "$lib/env/env";
import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as mathUtils from '$lib/utils/math-utils.js';
//import Button from '../ui/Button.svelte';
import ButtonSelect from '../ui/ButtonSelect.svelte';
import {TfServer, default as TfUtils} from './TfUtils.js';

import Modal2 from '../ui/Modal2.svelte';
import ModalButton from '../ui/ModalButton.svelte';
import Button from '../ui/Button.svelte';
// import { untrack } from 'svelte';
import { ColorUtils } from '$lib/utils/color-utils';
import GreekFilterInput from '../ui/GreekFilterInput.svelte';
import FilterInput from '../ui/FilterInput.svelte';
import { GreekUtils } from '$lib/utils/greek-utils';
import ArrowUp from '../ui/icons/arrow-up.svelte';
import ArrowDown from '../ui/icons/arrow-down.svelte';
import ArrowTop from '../ui/icons/arrow-top-icon.svelte';
import BulletsIcons from '../ui/icons/bullets-outline.svelte';
import CopyText from '../ui/CopyText.svelte';
import { findNextAnchor,findPrevAnchor, getAnchors} from '$lib/utils/ui-utils';
import OptionButton from "../ui/SelectButtons/OptionButton.svelte";

let {
    live=false,
    /**
     * @type {SynopsisOptions} options
    */
    options=new SynopsisOptions(),
    /**
     * @type {TfServer}
    */
    tfServer,
    
} = $props();

let currentServer=$state(tfServer);
let myOptions=$state(SynopsisOptions.makeFrom(options))
function setServer(){
    currentServer=tfServer;
}



let fetching = $state(false);
let expecting = $state(0);
let numReady=$state(0);
let ready = $derived(numReady >= expecting);
let dataReady = $state(false);
let showViewOptions=$state(false);
let showUnique = $state(false);
let showIdentical=$state(false);
let uniqueStyle = "lex-uniques";
let showLexemeHighlights = $state(false);
let showLookupPanel = $state(true);
let landingPage=$state(true);
let showInfoModal=$state(false);
let maxLexesToShow=$state(30);
/**
 * @type {Object|null} response
 */
let response=$state(null);

const maxCols = 4;

const requestModes =[
    {name:"Single Group"},
    {name: "Batch"}
];

let selectedRequestModeIndex = $state( myOptions.mode < requestModes.length ? myOptions.mode : 0);

let theNote = $state({heading: '', note:'',footer:''});

/**
 * 
 * @param {heading} heading
 * * @param {heading} note
 */
function displayNote(heading,note) {
    
    theNote.heading=heading;
    theNote.note=note;
    theNote.footer=currentServer.getNoteFooter();
    viewStates.views.notes.state = true;
}


/**
 * @type {string[]} refAreaInputs
 */
let refAreaInputs = $state(myOptions.columns && myOptions.columns.length ? myOptions.columns : ['Matt 1:1', "Mark 1:1"]); 
let numCols = $derived(refAreaInputs.length);

let batchInput=$state(myOptions.batch && myOptions.batch.length ? myOptions.batch.join("\n") : 'Matt 1:1|Mark 1:1|John 1:1\nMatt 5:17|Eph 2:14-16');

/**
 * @type {ParallelTextGroup[]} texts
 */
let texts= $state([]);

/**
* @type {number[]} selectedLexes
*/
let selectedLexes=$state(myOptions.lexes);
mylog("initialized selected lexes: " + selectedLexes.join(','));

/**
* @type {string[]} selectedGreekStrings
*/
let selectedGreekStrings=$state([]);

let showLexOptionsInfo = $state(false);
    
let lemmasByID=$derived.by(()=>{
    let dict={}
    if (response && response.lexemes && response.lexemes) {
        for (const [lemma,lex] of Object.entries(response.lexemes)){
            dict[lex.id]=lemma;
        }
    }
    mylog("updated lemmasByID. Keys now:[" +Object.keys(dict).join(",")+"]");
    return dict;
});


/**
 * @type {Object<string,string>} lexClasses
 */
let customGreekClasses= $derived.by(()=>{// (greek expression)->css color (e.g., "#eee")
    
    /**
     * @type {Object<string,string>}
     */
    const ret = {}
    if(selectedLexes && selectedGreekStrings.length) {
        //mylog("building lexClasses...",true)
        for(const [relIndex,gk] of selectedGreekStrings.entries()) {
            const color = getColorOfGreek(gk);
            if (color) {
                const index = selectedLexes.length+relIndex
                let classes = "custom-greek-"+ relIndex;
                classes += " " + color;
                ret[gk] = classes;
            }

        }
    }
    return ret;
});

/**
 * @type {Object<number,string>} lexClasses
 */
let lexClasses= $derived.by(()=>{// id->css color (e.g., "#eee")
    
    /**
     * @type {Object<number,string>}
     */
    const ret = {}
    if(dataReady && response?.lexemes) {
        //mylog("building lexClasses...",true)
        for(const id of Object.values(response?.lexemes).map((o)=>o.id)) {
            
            let classes = "lex-"+id;
            if(selectedLexes.includes(id)){
                classes += " " + getColorOfLex(id)
            } 
            //  mylog("setting lex " + id + " to: " + classes,true);
            ret[id] = classes;
        }
    }
    return ret;
});

/**
 * @type {number[]} unselectedLexes
 */
let unselectedLexes =$derived.by(()=>{
    if (response && response.lexemes){
        return Object.values(response.lexemes).filter(
            (lex)=>!selectedLexes.includes(lex.id)).map((l)=>l.id).sort((a,b)=>a-b)}
    else
        return [];
});

//let unselectedLexBetaArray = $derived(unselectedLexes.map((lexID)=>texts.lexemes[lemmasByID[lexID]].beta));
let unselectedLexPlainArray = $derived(unselectedLexes.map((lexID)=>GreekUtils.removeDiacritics(lemmasByID[lexID])));

/**
 * @type {number[]} bestMatchedLexes
 */
let bestMatchedLexes=$state([]);

    
/**
 * @type {number[]} otherMatchedLexes
 */
let otherMatchedLexes=$state([]);


/**
 * 
 * @param {string[]} refsArray
 */
//async function fetchPostTextsBatch(refsArray){
//todo: refactor in another .svelte.js file, then test
    //texts = null;

    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvFetchArray
     */
 /*   const bcvFetchArray=currentServer.getBCVarrayFromRefs(refsArray);
    
    return await currentServer.getTexts(bcvFetchArray,true,true);
    //return texts;
}*/

/**
 * 
 * @param {string} theInput
 * @returns {ParallelTextGroup[]}
 */
function parseGroupsBatch(theInput){
    const lines = theInput.trim().replaceAll(/\n+/g,"\n").split("\n").filter((s)=>s.length);
    const parGroups=[]

    for (const line of lines){
        const group = new ParallelTextGroup();
        group.parallelTexts=parseSingleGroup(line.split("|").filter((l)=>l.trim().length));
        parGroups.push(group);
    }
    return parGroups;
}

async function buildAndFetchPericopes(reset=true){

     
    //viewStates.views.lookup.state=false;
    //const parRefsOb
    dataReady=false;
   // landingPage=false;
    if (reset) {
          
    // mylog("disabling sortFilter and focus...");
        resetViewOptions();
        emptySelectedLexemes();
        emptySelectedCustomGreek();
    }
    
    
    
    fetching = true;
    //fetchTexts();
    mylog(`buildAndFetchPericopes: selectedRequestModeIndex=${selectedRequestModeIndex}`)
    if (selectedRequestModeIndex==0) {
        texts = [new ParallelTextGroup()];
        texts[0].parallelTexts = parseSingleGroup(refAreaInputs);
    }
    else { //presuming batch mode!
        texts = parseGroupsBatch(batchInput);
    }
    
    
    //mylog("after parsing input, but texts.parTexts[0].ref: " + texts.parallelTexts[0].textRefs[0].reference)
    //const parRefsObj = TfUtils.getParallelRefsArrays(texts.parallelTexts);
    const parRefsObj = TfUtils.getParallelGroupsRefsArrays(texts);

    response = await currentServer.fetchPostTextsBatch(parRefsObj.refsArray);
    
    //buildLexArrays();
    for (const [i,textGroup] of texts.entries()) {
        TfUtils.populateTextGroup(textGroup,response,parRefsObj.groupsIndices[i]);
    }
    fetching=false;
    dataReady= true;
    
    //mylog("Got response with " + response.texts.length + " texts. Here's 1:" )
    //mylog(response.texts[0].text)
   // mylog("here texts.ptexts[0].textR[0].text: " + texts.parallelTexts[0].textRefs[0].text)
    
}



function buildLexArrays(){
    //mylog("building LexArrays...", true)
    lemmasByID ={};
    if (texts) {
        for (const [lemma,lex] of Object.entries(response.lexemes)){
            lemmasByID[lex.id]=lemma;
        }
    }
    else{
        mylog("Cannot build LexArrays!")
    }

    
}

function resetViewOptions(lookup=false){
    
    
    viewStates.reset(lookup);
    
    showUnique=false;
    
    
    //  focus=selectedGospel[selectedGospelIndex].value;
}


    

    function toggleViewOptionsModal(){
        if (showViewOptions)
            showViewOptions=false;
        else
            showViewOptions=true;

      
    }

   /**
    * 
    * @param {string} greekString
    */
    function getColorOfGreek(greekString){
    
        let colorString = ''
        if (selectedGreekStrings.includes(greekString)){
            const selectedIndex = selectedLexes.length + selectedGreekStrings.indexOf(greekString)
            colorString += ' '+ ColorUtils.getCustomBgTextColorClasses(selectedIndex);
        }
        
        return colorString;
    }

    /**
     * 
     * @param {number} lexid
     */
    function getColorOfLex(lexid){
    
        let colorString = ''
        if (selectedLexes.includes(lexid)){
            const selectedIndex = selectedLexes.indexOf(lexid)
            colorString += ' '+ ColorUtils.getCustomBgTextColorClasses(selectedIndex);
        }
        
        return colorString;
    }

    function getLexClasses(id){
        /*let classString="lex-"+id;
        let highlight=highlightLexeme(id)
        return classString + (highlight ? " " + highlight : '');
        */
        //mylog("getting Lex class for " + id, true);
        return lexClasses[id];

    }

    function emptySelectedCustomGreek(){
        selectedGreekStrings.length = 0;
    }

    function emptySelectedLexemes(){
        selectedLexes.length = 0;
    }
    function toggleLex(id){
        mylog("toggleLex("+id+")");
        if(selectedLexes.includes(id)) {
            selectedLexes.splice(selectedLexes.indexOf(id),1);

        }
        else {
           
            selectedLexes.push(id);

        }
    }

    /**
     * 
     * @param {string} string
     */
    function toggleGreekString(string){
        if(selectedGreekStrings.includes(string)) {
            selectedGreekStrings.splice(selectedGreekStrings.indexOf(string),1);

        }
        else {
           
            selectedGreekStrings.push(string);

        }

    }

    function highlightLexeme(id=0,color=null){
        let ret = ''
        ret += "bg-red-500";
        return ret;
    }

    const viewStates=$state({
        views:{
            view: { description:  "View Options", hotkeys:['v'], state:false,modal:true},
            lookup: { description:  "Lookup passage(s) or select section", hotkeys:['l', 's'], state:true,modal:false},
            words: {description:  "Lexeme/Word Options", hotkeys:['w'], state:false,modal:true},
            highlightOnClick: { description:  "Enable/disable highlight on click.", hotkeys:['c'], state:myOptions.highlightOnClick,modal:false},
            info: { description:  "Website and project information.", hotkeys:['i'], state:false,modal:true},
            unique: { description:  "Toggle Unique Lexeme color outlining", hotkeys:['u'], state:myOptions.unique,modal:false},
            help: { description:  "Show help menu", hotkeys:['h', '?'], state:false,modal:true},
            identical: { description:  "Show (bold & underline) morphologically identical words shared by different gospels in a parallel group ",
             hotkeys:['m'], state:myOptions.identical,modal:false},
             notes:{description: "Notes on the text",state:false,modal:true}
              
        },

        
        /**
         * @param {string} modalName
         */
        toggle(modalName){
            if (this.views[modalName].state) {
                this.views[modalName].state=false
            }
            else{
                this.views[modalName].state = true;
            }
        },

        /**
         * 
         * @param {string} key
         * @returns {string}
         */
        getViewNameFromKey(key){
            let retVal = '';
            const matchingViews = Object.entries(this.views)
                .filter(([name,obj])=>obj.hotkeys?.includes(key))
                .map(([k,v])=>k);this
            if (matchingViews.length > 0){
                retVal = matchingViews[0]
            }
            
            return retVal;
        },
        reset(lookup=true){
            for (const view of Object.keys(this.views)){
                this.views[view].state = false;
            }
            if (lookup){
                this.views.lookup.state=lookup
            }
        },

        /**
         * 
         * @param {string} viewName
         * @returns {boolean}
         */
        isVisible(viewName){
            let retVal = false;
            const view = this.views[viewName];
            if(view){
                retVal = view.state;
            }
            return retVal;
        },
        /**
         * @returns {string[]}
        */
        getVisible(){
            return Object.entries(this.views).filter(([viewName,obj])=>obj.state).map(([k,v])=>k);
        }

    });

    const hotkeys=[
        /*
        {key: 'n', name:'Next Section',function: jumpToNextSection},
        {key:'p',name:'Previous Section',function: jumpToPrevSection},
        {key:'t',name:'Top/First Section',function: jumpToFirstSection},
        {key:'b',name:'Bottom/Last Section',function: jumpToLastSection},
        */
         
    ];

    let textAreaFocused=$state(false);

    function textAreaFocus(event){
        textAreaFocused=true;
    }
    function textAreaBlur(event){
        textAreaFocused=false;
    }
    function onkeydown(event){
        mylog("CustomPanel.keydown:" + event)
        if(live && !textAreaFocused ){
            const matchedView=viewStates.getViewNameFromKey(event.key);
            const modalVisibles=viewStates.getVisible().filter((name)=>(viewStates.views[name].modal)); 
            if (matchedView) {
                    
                if (!modalVisibles.length){
                    
                    if (matchedView){
                        viewStates.toggle(matchedView);
                    }
                }  
            }
            else if (!modalVisibles.length && hotkeys){
                const matchedHotkey=hotkeys.filter((o)=>o.key==event.key);
                if (matchedHotkey.length){
                    matchedHotkey[0].function();
                }
            }
             
        }
    }

    const wordTabs=['lexemes','custom'];
    let selectedWordTabIndex=$state(0);

    let customGreekInputText = $state('');
   $effect(()=>{customGreekInputText=GreekUtils.onlyPlainGreek(
        GreekUtils.beta2Greek(customGreekInputText),true,true).replaceAll('σ ','ς ');
    });
    

   

    /**
     *
     */
    function lookup(reset=true){
        
        setServer();
        buildAndFetchPericopes(reset);
    }
    //$inspect("Texts:", texts, "texts.lexemes:", [...texts.lexemes].join("; "))
    //$inspect("lemmasbyID.keys", Object.keys(lemmasByID), "selectedLexes:", selectedLexes, "response:", response, "texts:", texts);
    function addCol(){
        refAreaInputs.push('');
    }

    function removeCol(){
        refAreaInputs.pop();

    }

function makeURL(){
    let opt = new SynopsisOptions(viewStates.views.unique.state,viewStates.views.identical.state,
        viewStates.views.highlightOnClick.state,selectedLexes);
    
    opt.greekStrings=myOptions.greekStrings;
    if(selectedRequestModeIndex==0){
        opt.columns=refAreaInputs;
    }
    else{
        opt.batch=batchInput.split("\n");
        opt.mode=1;
    }
    
    opt.tab=1;
    
    
    
    let url = generateURL(opt);
    return url;
}

function loadRequestOptions(){
    mylog("loadRequestOptions...")
  /*  if(Object.hasOwn(request,"hideSolos")) {mylog("hideSolos =request.hideSolos;"); hideSolos =request.hideSolos;}
    if(Object.hasOwn(request,"sort")) {mylog("sort =request.sort;"); sort =request.sort;}
    if(Object.hasOwn(request,"hideNonPrimary")) {mylog("hideNonPrimary=request.hideNonPrimary;"); hideNonPrimary=request.hideNonPrimary;}
    if(Object.hasOwn(request,"focusOn")) {mylog("focusOn=request.focusOn;"); focusOn=request.focusOn;}
    if(Object.hasOwn(request,"hideNonPrimarySolos")) {mylog("hideNonPrimarySolos=request.hideNonPrimarySolos;"); hideNonPrimarySolos=request.hideNonPrimarySolos;}
    if(Object.hasOwn(request,"unique")) {mylog("viewStates.views.unique.state=request.unique;"); viewStates.views.unique.state=request.unique;}
    if(Object.hasOwn(request,"identical")) {mylog("viewStates.views.identical=request.identical;"); viewStates.views.identical.state=request.identical;}
    if(Object.hasOwn(request,"selectedGospelIndex")) {mylog("selectedGospelIndex=request.selectedGospelIndex;"); selectedGospelIndex=request.selectedGospelIndex;}
    if(Object.hasOwn(request,"lexes")) {mylog("got lexes param!"); selectedLexes=request.lexes}
    if(Object.hasOwn(request,"greekStrings")) {mylog("got greekSrings!"); selectedGreekStrings=request.greekStrings}
    */

}

let gotRequest = ((myOptions.columns && myOptions.columns.length) || (myOptions.batch && myOptions.batch.length));
let mounted=$state(false);

onMount(() => {
    if (gotRequest){
        //landingPage=false;
        
        loadRequestOptions();
        viewStates.views.lookup.state=false;
        lookup(false);

    }
    else{
        viewStates.reset();
    }
    mounted = true;
});
$inspect(myOptions.hideApp)
</script>

<div class="self-center text-center sticky top-0 bg-white z-40" >

  
<h1 class="text-3xl bold underline">Custom NT Synopsis!</h1>
<h3 class="italic">Choose your <span class="line-through">weapons</span> NT Bible passages:<ButtonSelect buttonStyle="btn btn-neutral btn-outline btn-circle btn-xs p-0 m-0"
            buttonText="?"
            bind:selected={viewStates.views.help.state}/></h3>
<label for="request-mode">Mode:</label>
<select name="request-mode" bind:value={selectedRequestModeIndex}>
    {#each requestModes as rMode,i}
        <option value={i}>{rMode.name}</option>
    {/each}

</select><br/>

{#if selectedRequestModeIndex == 0}
    {#each refAreaInputs as areaInput, index}
    <div class="inline-block m-3">
        <label for="refarea{index}"class="label cursor-pointer inline ">
            <span class="label-text">Column {index+1}:</span></label>  
        <textarea id="refarea{index}" class="align-middle resize" rows="1"
                    bind:value={refAreaInputs[index]}
                
                    ></textarea>
    </div>         
        

    {/each}
    <div class="inline-block">
    {#if numCols <= maxCols}<Button buttonStyle="btn btn-sm btn-ghost" onclick={addCol} buttonText="+" tooltip="Add Column"/>{/if}
    {#if numCols >1 }<Button onclick={removeCol} buttonStyle="btn btn-sm btn-ghost"  buttonText="-" tooltip="Remove Last Column"/>{/if}
    </div>
{:else}
    <br/>
    <textarea bind:value={batchInput} cols="20" rows="10"/><br/>
{/if}

<Button onclick={lookup} buttonText="Lookup!" ready={!fetching}/>
<div id="texts1" class="block">
{#if mounted && dataReady}
<hr/>

<ButtonSelect bind:selected={viewStates.views.unique.state} buttonText="Outline Unique Lexemes"/>
<ButtonSelect bind:selected={viewStates.views.identical.state} tooltip="Toggle Bold/underline setting for morphologically identical words." 
           buttonText="Identical words"/>
<ButtonSelect buttonText="Highlight on Click" bind:selected={viewStates.views.highlightOnClick.state}/>
<ButtonSelect buttonText="Word Options" bind:selected={viewStates.views.words.state}/>  
{#if myOptions.nt==SblGntServer.abbrev}<label for="hide-app-check">Hide appart?</label>
<input name="hide-app-check" type="checkbox" bind:checked={myOptions.hideApp}/>
    {/if}       
<br/>
<hr/>
<h2>Parallel NT Texts from {currentServer.name}:
    <CopyText icon={LinkSvg} 
            copyText={makeURL()} 
            tooltip='Copy URL'
            
            />

</h2>
{#each texts as textGroup,i}
<hr class=" m-1 p-1"/>
{#if texts.length > 1}<h3 class="font-bold underline">Group #{i+1}</h3>{/if}
<ParallelTextSection parTextGroup={textGroup} showUnique={viewStates.views.unique.state} wordClick={toggleLex} 
                    cssClassDict={lexClasses}
                    cssCustomDict={customGreekClasses}
                    showIdentical={viewStates.views.identical.state}
                    highlightOnClick={viewStates.views.highlightOnClick.state}
                    showNotes={true} hideApp={myOptions.hideApp}
                    showNotesFunction={displayNote}
                    />
{/each}
{:else}

<span class="italic mt-3 pt-5"> Enter some valid NT references and click "Lookup!"</span>
{/if}
</div>
</div>


<Modal2 bind:showModal={viewStates.views.words.state}>

    <div class="max-w-full block text-center">
                

        <div role="tablist" class="tabs tabs-lifted">
            <a role="tab" class="tab {selectedWordTabIndex==0 ? 'tab-active' : ''} " tabindex=0 onclick={()=>{selectedWordTabIndex=0}} >Lexemes</a>
            <a role="tab" class="tab {selectedWordTabIndex==1 ? 'tab-active' : ''} " tabindex=1 onclick={()=>{selectedWordTabIndex=1}}>Custom</a>
        </div>
        
            <div class="{selectedWordTabIndex== 0 ? 'block' : 'hidden'}">
             <h1>Highlighted Lexemes</h1>
            {#if selectedLexes.length}
            
            <h2>Selected Lexemes:</h2>
            <i>Click on a lexeme to remove it.</i>
            <br/>
            {#each selectedLexes as lex, index}
                 <Button onclick={()=>toggleLex(lex)} buttonText={lemmasByID[lex]} buttonColors={getColorOfLex(lex)} buttonType=''/> 
               
             {/each}
                
              

                <br/>
            <Button onclick={emptySelectedLexemes}  buttonText="Clear All"/>
            {:else}<br/>
            <i>None selected. Click on a word in the text, or select a lexeme below. Use the search box to find a specific word (type in Latin characters, which will automatically convert to Greek)</i>

            
            {/if}
            <hr class="!border-slate-200"/>
            <h2>Unselected Lexemes</h2>
            <i>Click to add/highlight. Type in search box to find words.</i>
            <GreekFilterInput itemsList={unselectedLexPlainArray}
            labelText=""
            bind:bestMatches={bestMatchedLexes}
            bind:otherMatches={otherMatchedLexes} tooltip="Type latin characters to search for Greek words"/>
            <br>
              {#if bestMatchedLexes.length == 0 && otherMatchedLexes.length == 0}
                <i>None found. Showing all lexemes:</i><br/>
                        {#if unselectedLexes.length > 30 && maxLexesToShow == 0}
                                
                        <Button buttonText='Show less...' onclick={()=>{maxLexesToShow=30}}/>
                            <br/>
                        {/if}
                    {#each unselectedLexes as id,index}
                        
                        {#if (maxLexesToShow == 0 || maxLexesToShow >= unselectedLexes.length)  || ((unselectedLexes.length > maxLexesToShow) && index < maxLexesToShow )}
                            
                        <Button onclick={()=>toggleLex(id)} 
                            buttonText={lemmasByID[id]} 
                            buttonType="btn-accent" style="hover:text-white"/> 
                        
                        {/if}

                    {/each}
                        {#if unselectedLexes.length > maxLexesToShow}
                                <br/>
                        <Button buttonText='Show more...' onclick={()=>{maxLexesToShow=0}}/>
                        {/if}
              {:else}
                 <h1>Trying to filter!</h1>
                 <h3>Best matches:</h3>
                 {#if bestMatchedLexes.length}
                    {#each bestMatchedLexes as lexIndex}
                    {@const lexId = unselectedLexes[Number(lexIndex)]}
                    {@const lemma=lemmasByID[lexId]}
                    <!--  bestMatched.lexIndex = {lexIndex}, LexID={lexId}, Lemma='{lemma}'-->
                
                    <Button onclick={()=>toggleLex(lexId)} 
                    buttonText={lemma} 
                    buttonType="btn-accent" style="hover:text-white"/> 
                    {/each}
                    {:else}
                     <i>None found.</i>
                    {/if}
                    {#if otherMatchedLexes.length}
                        <h3>Other Matches:</h3>
                            {#each otherMatchedLexes as lexIndex}
                        {@const lexId = unselectedLexes[Number(lexIndex)]}
                        {@const lemma=lemmasByID[lexId]}
                        <!--  bestMatched.lexIndex = {lexIndex}, LexID={lexId}, Lemma='{lemma}'-->
                    
                        <Button onclick={()=>toggleLex(lexId)} 
                        buttonText={lemma} 
                        buttonType="btn-accent" style="hover:text-white"/> 
                        {/each}
                    {/if}
                {/if}

            </div>
                
           
           <!-- custom greek: -->
             <div class="{selectedWordTabIndex== 1 ? 'block' : 'hidden'}">
             <h1>Custom Greek Highlights</h1>

             <i>Enter some text in the text box below, then press enter. Type in Latin characters, which will automatically convert to Greek.</i><br/>
             <input type="text" size="15" 
                bind:value={customGreekInputText} placeholder="Type here" 
                class="input input-bordered w-full max-w-xs" 
                onkeydown={(e)=>{if (e.key == 'Enter') toggleGreekString(customGreekInputText);}}/>
                <Button onclick={()=>toggleGreekString(customGreekInputText)} buttonText='Toggle'/>
                <Button onclick={()=>{customGreekInputText=''}} buttonText="Clear Input" buttonStyle='btn btn-ghost btn-md'/>
            
            {#if selectedGreekStrings.length}
            
                <h2>Selected Custom Greek Word Forms:</h2>
                <i>Click on any word-form to remove it.</i>
                <br/>
                {#each selectedGreekStrings as gk}
                <Button onclick={()=>toggleGreekString(gk)} buttonText={gk} buttonColors={getColorOfGreek(gk)} buttonType=''/> 
                {/each}<br/>
                <Button onclick={emptySelectedCustomGreek}  buttonText="Clear All"/>
            {:else}<br/>
                
                <i>None selected.</i>
 
            {/if}
           
            </div>

    </div>
</Modal2>

<Modal2 bind:showModal={viewStates.views.notes.state} title="Notes" onclose={()=>{theNote.heading=''; theNote.note=''}}>
    <h2>{theNote.heading}</h2>
    <ul>

    {#each theNote.note.split("\n") as line}
    <li>{line}</li>
    {/each}

    </ul>

    <hr/>
    <span class="italic text-xs/0">{theNote.footer}</span>
</Modal2>

<Modal2 bind:showModal={viewStates.views.help.state} title="Help: Custom Synopsis Viewer">
    
    <div class="m-auto  items-center text-center ">
    <div class="inline-block text-left"> 
    Enter several columns of NT references to see them in parallel columns. There are two options:
    <ol class="list-decimal ml-9">
        <li><span class="bold">Single group mode:</span> Enter a group of texts in each column (add/subtract columns by clicking the +/- buttons). Seperate references within a column with a colon or newline.</li>
        <li><span class="bold">Batch mode (aka "Awesome Sauce"):</span>Enter several groups of rows, one group per row. Separate columns with a "pipe" (|) symbol. Separate references within a single column by a colon.</li>
    </ol>
    Press "Lookup!" when you're ready. Then hold on to your exegetical seatbelts and enjoy the NT synopsis ride...
    </div>
    <hr class="m-5"/>

    <h2 class="underline">Results Options: Unique and Identical Words</h2>
             <div class=" m-auto inline-block text-left">
                <ul class="list-disc ml-9">
                    <li>Enabling <b>"Outline Unique Lexemes"</b> will draw <span class="outline outline-blue-400">an outline</span> (one color per gospel) around each lexeme that is unique to a specific gospel, i.e., that shows up in only one column of a single parallel group.</li>
                    <li>Enabling <b>"Identical words"</b> will <span class="font-bold underline">bold and underline</span> all morphologically identical words shared by at least two gospels in the same parallel group </li>
                    <li>Enabling <b>"Highlight Lexeme on Click"</b> will toggle <span class="bg-cyan-500 text-white">highlighting</span> of all instances of the lexeme.</li>
                </ul>
    
            </div>
   
    </div>

</Modal2>