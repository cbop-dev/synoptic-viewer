<script>
    import {gospelParallels} from '@cbop-dev/aland-gospel-synopsis'
    import { ParallelText, GospelPericopeGroup,Word, TextAndRef,VerseWords } from "./parallelTexts.svelte";
    import { tfServer, TfServer, lexemes} from "$lib/n1904/tfN1904";
	import ParallelTextSection from "./ParallelTextSection.svelte";
	import { mylog } from "$lib/env/env";
    import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
    import * as mathUtils from '$lib/utils/math-utils.js';
	//import Button from '../ui/Button.svelte';
    import ButtonSelect from '../ui/ButtonSelect.svelte';
    import {default as TfUtils} from './TfUtils.js';
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
    import { findNextAnchor,findPrevAnchor, getAnchors} from '$lib/utils/ui-utils';
	//import { generateHslColorGradient } from '../ui/chartUtils';
  
    let {
        allowEverything=false
    }=$props();
    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);
    let dataReady = $state(false);
    let showSectionLinks=$state(false);
   let showViewOptions=$state(false);
   let showUnique = $state(false);
   let showIdentical=$state(false);
   let uniqueStyle = "lex-uniques";
   let hideSolos = $state(false);
     let hideNonPrimarySolos = $state(false);
    let showLexemeHighlights = $state(false);
    let showLookupPanel = $state(true);
   // let showViewOptions = $state(false);
    let landingPage=$state(true);
    let showInfoModal=$state(false);

    /**
    * @type {number[]} selectedLexes
    */
    let selectedLexes=$state([]);
    

   let selectedGospelIndex =$state(0);
   const gospelOptions =[
    {value: '', name: "None", abbrev:""},
    {value: gospelParallels.gospels.names.MATTHEW, name: "Matthew", abbrev:"matt"},
    {value: gospelParallels.gospels.names.MARK, name:  "Mark", abbrev:"mark"},
    {value: gospelParallels.gospels.names.LUKE, name:  "Luke", abbrev:"luke"},
    {value: gospelParallels.gospels.names.JOHN, name: "John", abbrev: "john"}

   ];
    /**
     * @type {string} selectedGospel
     */
   let selectedGospel=$derived(gospelOptions[selectedGospelIndex].value);
   let hideNonPrimary = $state(true);
   //what is this for?
   let hideOthers = $state(false);
   let focusOn=$state(false);
   let focused=$derived.by(()=>{
        let retVal = '';
        if (focusOn){
            retVal = selectedGospel;
        }
        return retVal;
   });
   let sort = $state(false);
  
   let callSortFilter=$derived(hideSolos || (gospelParallels.gospels.isValid(selectedGospel)   &&
   ( sort ||hideNonPrimary || focusOn|| hideNonPrimarySolos)));

    /**
     * @description Array of pericopes groups, with refs for each gospel (matt,mark,luke,john,other),
     *  derived from 'filteredPericopes' and (maybe?? see next variable comment) retaining the same order.
     * @type {GospelPericopeGroup[]} perGroups
     */
    let perGroups = $state([]);

    //is the sorting here necessary???
    let filteredPerGroups=$derived(perGroups.filter((g)=>filteredPericopes.includes(g.id)).toSorted(
        (a,b)=>filteredPericopes.indexOf(a.id)-filteredPericopes.indexOf(b.id)
    ));
    /**
     * @type {{matt:number[], mark:number[], luke:number[], john:number[], other:number[]}[]} perGroupsIndices
     */
   // let perGroupsIndices = $state([]); //indices of groupsRefsArray
    let perGroupsIndices=$derived.by(()=>{
        let retVal = [];
        if (perGroups && perGroups.length){
            retVal = TfUtils.getRefsArrays(perGroups).groupsIndices;
        }
        return retVal;
    });
    /**
    * @type string[] groupsRefsArray
    */
    let groupsRefsArray=$derived.by(()=>{
        let retVal = [];
        if (perGroups && perGroups.length){
            retVal = TfUtils.getRefsArrays(perGroups).refsArray;
        }
        return retVal;
    });
 
    //let groupsRefsArray = $state([]);
    
    /**buildPericopeRefsect|null} fetchedTextsResponse
    */
    let fetchedTextsResponse = $state(null);
    let showLexOptionsInfo = $state(false);
    function parsePericopeNums(){
        const refAreaRefs = refAreaText.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";");

        /**
         * @type {number[]} theNums
         */
        const theNums = [];
        bibleUtils.expandRefs(refAreaRefs).forEach((ref)=>{
            const pNum = gospelParallels.getAlandPericopeNumbers(ref.trim(),selectedGospel, true);
            for (const num of pNum){
                if(!theNums.includes(num))
                    theNums.push(num);
            }
            
        });
        
        alandPericopeNums = theNums.sort((a,b)=>a-b);   
    }


    function buildPericopeRefs(){
       // mylog("sorting pericopes. Initial state = " + alandPericopeNums.join(","));
 
      //  mylog("sorting pericopes. Sorted state = " + alandPericopeNums.join(","));
        
        perGroups = TfUtils.getGroupsArray(filteredPericopes);
 
       // mylog("ran geRefsArrays!")
 
    }

       /**
     * @type {number[]} alandPericopes
     */
    let alandPericopeNums = $state([]);
 
    let filteredPericopes=$derived.by(()=>{
        let alands= (alandPericopeNums ? [...alandPericopeNums] : []); //copy of alands for sorting/filtering...
        if (callSortFilter) {
            if (sort && gospelParallels.gospels.isValid(selectedGospel)) {//sort!
               // mylog("before sorting Alands for "+ selectedGospel +": ["+alands.join(',')+"]",true);
                gospelParallels.sortAlandPericopes(alands,selectedGospel);
              // mylog("after sorting Alands: ["+alands.join(',')+"]",true);
            }
            if (hideSolos || hideNonPrimary || hideNonPrimarySolos||focusOn) {
                //we need to filter:
                alands = gospelParallels.filterAlandPericopes(alands,selectedGospel,focusOn || hideNonPrimary,hideSolos,
                focusOn||hideNonPrimarySolos);

            }
           
        }
        //mylog("after filtering alands: ["+ alands.join(",")+"]",true)
        return alands;
    })
    
   
    let lemmasByID=$derived.by(()=>{
        let dict={}
        if (fetchedTextsResponse && fetchedTextsResponse.lexemes) {
            for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
                dict[lex.id]=lemma;
            }
        }
        return dict;
    });

       let refAreaText = $state('Matt 6:10');
 

    /**
     * @type {number[]} filteredPericopes
     */
 //   let filteredPericopes = $state([]);
    //$derived(alandPericopeNums.filter((p)=>!hideNonPrimary || 
      //      (gospelParallels.alandSynopsis.isPrimaryPericope(p,selectedGospel[selectedGospelIndex].value))))


  let selectedSection = $state([1]);
   function selectSection(){
        landingPage=false;
        resetViewOptions(false);
        alandPericopeNums=[...selectedSection];

        buildAndFetchPericopes();
   } 

/**
     * @type {Object<number,string>} lexClasses
     */
    

   let lexClasses2={}
   
   /*$derived.by(()=>{
        const colors = generateHslColorGradient(selectedLexes.length);
        const classes={}
        for (const [index, id] of selectedLexes.entries()){
            classes[id]=colors[index];
        }
        return classes;
        
   });*/

    let lexClasses= $derived.by(()=>{// id->css color (e.g., "#eee")
        const ret = {}
        if(dataReady && fetchedTextsResponse.lexemes) {
            //mylog("building lexClasses...",true)
            for(const id of Object.values(fetchedTextsResponse.lexemes).map((o)=>o.id)) {
                
                let classes = "lex-"+id;
                if(selectedLexes.includes(id)){
                    classes += " " + getColorClasses(id)
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
        if (fetchedTextsResponse && fetchedTextsResponse.lexemes){
            return Object.values(fetchedTextsResponse.lexemes).filter(
                (lex)=>!selectedLexes.includes(lex.id)).map((l)=>l.id).sort((a,b)=>a-b)}
        else
            return [];
    });

    //let unselectedLexBetaArray = $derived(unselectedLexes.map((lexID)=>fetchedTextsResponse.lexemes[lemmasByID[lexID]].beta));
    let unselectedLexPlainArray = $derived(unselectedLexes.map((lexID)=>GreekUtils.removeDiacritics(lemmasByID[lexID])));
    
    /**
     * @type {number[]} bestMatchedLexes
     */
    let bestMatchedLexes=$state([]);

        
    /**
     * @type {number[]} otherMatchedLexes
     */
    let otherMatchedLexes=$state([]);

    
   async function fetchPostTextsBatch(){
    //todo: refactor in another .svelte.js file, then test
        fetchedTextsResponse = null;

        /**
         * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvFetchArray
         */
        const bcvFetchArray=TfUtils.getBCVarrayFromRefs(groupsRefsArray);
       
        fetchedTextsResponse = await tfServer.getTexts(bcvFetchArray,true,true);
        
    }
    async function buildAndFetchPericopes(){
        landingPage=false;
        viewStates.views.lookup.state=false;
        dataReady=false;
       // mylog("disabling sortFilter and focus...");
        resetViewOptions();
        buildPericopeRefs();
        fetching = true;
        //fetchTexts();
        emptySelectedLexemes();
        await fetchPostTextsBatch();
        //buildLexArrays();
        populateGroupsText(true);
        dataReady= true;
    }
    //let lemmasByID={}


    function buildLexArrays(){
        //mylog("building LexArrays...", true)
        lemmasByID ={};
        if (fetchedTextsResponse) {
            for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
                lemmasByID[lex.id]=lemma;
            }
        }
        else{
            mylog("Cannot build LexArrays!", true)
        }

        
    }
    function populateGroupsText(words=false){
       // mylog("v==================================v", true);
        //mylog("populateGroupTexts()...",true);
        
        for (const [index,group] of perGroups.entries()){
            mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index);
            for (const book of ['matt', 'mark', 'luke', 'john','other']){
                for (const [i,textRef] of group[book].textRefs.entries()){
                    mylog("checking ref: " + textRef.reference);
                    const queryIndex= perGroupsIndices[index][book][i];
                    if (fetchedTextsResponse && fetchedTextsResponse['texts'] && fetchedTextsResponse['texts'][queryIndex]){
                        textRef.text= fetchedTextsResponse['texts'][queryIndex].text;
                        if (words){
                            
                            textRef.words=fetchedTextsResponse['texts'][queryIndex].words;
                        }
                       // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                       // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                    }
                    
                }
            }
            group.markUniqueAndIdenticalWords();        
        }
        mylog("DONE! Populated the GroupTexts()!")
        mylog("^==================================^")
    }
    function resetViewOptions(lookup=false){
        selectedGospelIndex =0;
        sort = false;
        viewStates.reset(lookup);
        hideNonPrimary=false;
        focusOn=false;
        showUnique=false;
        hideSolos=false;
        hideNonPrimarySolos=false;
        
      //  focus=selectedGospel[selectedGospelIndex].value;
    }
    function lookupShowNtParallels(){
        resetViewOptions();
        parsePericopeNums();
        buildAndFetchPericopes();
        //fetching = false;
        //ready = true;
        

        
    }
 
    
    /**
     * 
     * @param {boolean} flag
     */
    function toggleViewOptionsModal(){
        if (showViewOptions)
            showViewOptions=false;
        else
            showViewOptions=true;

      
    }

   // let lexemes=$state(null);



  function getColorClasses(lexid){
    
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
    function emptySelectedLexemes(){
        selectedLexes.length = 0;
    }
    function toggleLex(id){
       // mylog("toggleLex("+id+")",true);
        if(selectedLexes.includes(id)) {
            selectedLexes.splice(selectedLexes.indexOf(id),1);

        }
        else {
           
            selectedLexes.push(id);

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
            info: { description:  "Website and project information.", hotkeys:['i'], state:false,modal:true},
            unique: { description:  "Toggle Unique Lexeme color outlining", hotkeys:['u'], state:false,modal:false},
            help: { description:  "Show help menu", hotkeys:['h', '?'], state:false,modal:true},
            sections: { description:  "Jump to a section", hotkeys:['j'], state:false,modal:true},
            identical: { description:  "Show (bold & underline) morphologically identical words shared by different gospels in a parallel group ",
             hotkeys:['m'], state:false,modal:false},  
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
                .filter(([name,obj])=>obj.hotkeys.includes(key))
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

    
    function jumpToPrevSection(){
        const nextId=findPrevAnchor()
        if (nextId){
            document.location=document.location.toString().split('#')[0]+'#'+nextId;
        }
    }


    function jumpToFirstSection(){
        const anchors = getAnchors();
        if (anchors && anchors.length) {
            document.location=document.location.toString().split('#')[0]+'#'+anchors[0].id;

        }     
        
    }

    function jumpToLastSection(){
        const anchors = getAnchors();
        if (anchors && anchors.length) {
            document.location=document.location.toString().split('#')[0]+'#'+anchors[anchors.length-1].id;

        }     
        
    }


    function jumpToNextSection(){
        const nextId=findNextAnchor()
        if (nextId){
            document.location=document.location.toString().split('#')[0]+'#'+nextId;
        }
    }
    const hotkeys=[
        {key: 'n', name:'Next Section',function: jumpToNextSection},
        {key:'p',name:'Previous Section',function: jumpToPrevSection},
        {key:'t',name:'Top/First Section',function: jumpToFirstSection},
        {key:'b',name:'Bottom/Last Section',function: jumpToLastSection},
         
    ];
    function onkeydown(event){
        if(!textAreaFocused ){
            const matchedView=viewStates.getViewNameFromKey(event.key);
            const modalVisibles=viewStates.getVisible().filter((name)=>(viewStates.views[name].modal)); 
            if (matchedView) {
                    
                if (!modalVisibles.length){
                    
                    if (matchedView){
                        viewStates.toggle(matchedView);
                    }
                }  
            }
            else if (!modalVisibles.length){
                const matchedHotkey=hotkeys.filter((o)=>o.key==event.key);
                if (matchedHotkey.length){
                    matchedHotkey[0].function();
                }
            }
             
        }
    }


    let textAreaFocused=$state(false);

    function textAreaFocus(event){
        textAreaFocused=true;
    }
    function textAreaBlur(event){
        textAreaFocused=false;
    }
    </script>
<style>
    @reference "tailwindcss";

    hr{
       @apply border-slate-400 m-2;
    }
   /* div :global(.lex-unique) {
        @apply outline-red-600 outline outline-3 pl-0.5 ml-0.5 mr-0.5 ;
    }*/
    a:link:hover {
        text-decoration: underline;
        
    }

    .anchor{
        @apply md:-mt-30 md:pt-30 -mt-20 pt-20;
    }


    select{
        @apply max-w-5/6  wrap-normal overflow-clip ;
       /* overflow: hidden  !important;*/
    }

    option{
        @apply max-w-11/12 wrap-normal overflow-clip;
        /*overflow: hidden  !important;*/
      
    }

</style>
<svelte:window {onkeydown}/>

<div class="self-center text-center sticky top-0 bg-white z-40">

    {#if !landingPage}

    <div class="navbar bg-base-100 text-center  shadow-sm ">
  <div class="navbar-start text-left max-w-full w-full m-auto md:hidden">
    <div class="dropdown  text-left">
       
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
      </div>
      
      <ul tabindex="0"
            
        class="menu  dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-left ">

      {#if alandPericopeNums && alandPericopeNums.length}
      <li><ButtonSelect bind:selected={viewStates.views.view.state} buttonText="☰ View Options"/></li>

     {#if dataReady}
     
       <li> <ButtonSelect buttonText="☰ Jump to    ↓" bind:selected={viewStates.views.sections.state}/></li>       
        <li><ButtonSelect bind:selected={viewStates.views.words.state} buttonText="☰ Words" /></li>
        
            
        
         
     {/if}
      {/if}

      </ul>
    </div>
    <div class="text-left ">
       <h1 class="inline">
        <a href="" data-sveltekit-reload><span class="hidden sm:inline">NT&nbsp;Synopsis</span>
        <span class="sm:hidden inline">Synopsis</span></a>
       </h1>    
     <ul class="bg-white menu menu-horizontal ">
        <li><ButtonSelect buttonText="i" 
       buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={viewStates.views.info.state}/></li>
       <li><ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0" bind:selected={viewStates.views.help.state}/>
        </li>
      <li >
        <ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="" 
        buttonStyle="btn btn-xs btn-circle btn-ghost p-0" >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
        </ButtonSelect>
      </li>
    </div>
  </div>
  <div class="hidden md:navbar-center self-center m-auto">


    <div class="text-center self-center border-0"> 
        <div id="title-panel">
        <h1 class="text-center inline"> 
        <a href="/" data-sveltekit-reload><span class="hidden lg:inline">NT Gospel Synopsis Viewer</span>
        <span class="lg:hidden inline">NT Synopsis</span></a>
    </h1>&nbsp;<ButtonSelect buttonText="i" 
       buttonStyle="btn btn-xs  btn-circle btn-ghost  p-0" bind:selected={viewStates.views.info.state}/>
       <ButtonSelect buttonText="?" buttonStyle="btn btn-xs btn-circle btn-ghost p-0" bind:selected={viewStates.views.help.state}/>
    </div> 
    <ul class="bg-white menu menu-horizontal ">
        
      <li >
        <ButtonSelect bind:selected={viewStates.views.lookup.state} buttonText="☰ Lookup" buttonStyle="btn"/>
      </li>

      {#if alandPericopeNums && alandPericopeNums.length}
      <li><ButtonSelect bind:selected={viewStates.views.view.state} buttonText="☰ View Options"/></li>

     {#if dataReady}
     
       <li> <ButtonSelect buttonText="☰ Jump to section ↓" bind:selected={viewStates.views.sections.state}/></li>       
        <li><ButtonSelect bind:selected={viewStates.views.words.state} buttonText="☰ Words" /></li>
            
        
         
     {/if}
      {/if}
    </ul>
    </div>
  </div>
  <div class="navbar-end hidden">
   


  </div>
    </div>
    {/if}
    <!--==================================================================-->





{#if landingPage}
<div id="landing-panel text-center">
   <h1 class="block text-center "><span class="hidden lg:inline">Greek NT Gospel Synopsis Viewer</span>
    <span class="hidden md:inline lg:hidden">NT Gospel Synopsis</span>
    <span class="md:hidden">NT Synopsis</span>
</h1>
    
        
        <div class="text-center m-auto">
    
            Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
            Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
      </div>
      <hr/>
</div>
    

{/if}
{#if viewStates.views.lookup.state}

<div id="search-panel" class="text-center ">
     Choose One:
            <h2 class="cursor-default">Enter References</h2><div class="inline-block mb-1">
                <textarea id="refarea" class="inline-block align-middle" 
                rows="1" bind:value={refAreaText}
                onfocus={textAreaFocus} onblur={textAreaBlur}
                ></textarea>
    <button onclick={lookupShowNtParallels} class="btn btn-primary inline-block ">Look up!</button></div>
             
                
               <br/> OR:
            <h2 class="cursor-default">Select a section:</h2> 
             <select bind:value={selectedSection} >
            
            {#each gospelParallels.alandSynopsis.sections as section}
            <option value={mathUtils.createNumArrayFromStringListRange(section.pericopes)}>{mathUtils.romanize(section.section)}: {section.title}</option>
            <hr/>
            {/each}
            {#each gospelParallels.alandSynopsis.pericopes as per }
            {#if per.pericope == 1 }
            <option value={[per.pericope]} selected="selected">{per.pericope}: {per.title}</option>
            {:else}
             <option value={[per.pericope]} >{per.pericope}: {per.title}</option>
            {/if}
            {/each}
            
            {#if allowEverything}
            <hr/>
            <option value={gospelParallels.alandSynopsis.pericopes.map((p)=>p.pericope)}>Everything!!</option>
            {/if}
        </select>
        <button onclick={selectSection} class="align-top btn btn-primary inline-block m-1">Go!</button>
</div>
<hr class="!border-slate-300 m-6"/>
{/if}
</div>
<div class="text-center mt-3">
   
    {#if alandPericopeNums.length}
         <h1 class="text-center">Results:</h1>
        

    <div id="results">


        {#if dataReady && fetchedTextsResponse}
            {#if filteredPerGroups.length}
                {#each filteredPerGroups as group, index }
                <div class='anchor text-center' id="section-{group.id}">
                    <h2 class="inline-block"><b><u>{group.title}</u></b></h2>
                    </div>
                <div class="float-right mr-2 break-after-all">
                    <a href="" class="" title="Jump to section"
                    onclick={()=>{viewStates.views.sections.state=true}}><BulletsIcons height={20} width={20}/></a>
                    {#if index > 0}
                    <a href="#section-{filteredPerGroups[index-1].id}"
                    title="Previous"><ArrowUp height={20} width={20}/></a>{/if}
                    {#if index < filteredPerGroups.length-1}
                    <a href="#section-{filteredPerGroups[index+1].id}" 
                    class="break-after-all" title="Next"><ArrowDown height={20} width={20}/></a>{/if}
                    <a href="#"  class="inline" title="Top"><ArrowTop height={20} width={20}/></a>
                </div>
                    
        
            
                <br class="break-all"/>
                <div>
                    <ParallelTextSection parGroup={group} focus={focused}
                    wordClick={toggleLex} showUnique={viewStates.views.unique.state} 
                    cssClassDict={lexClasses}
                    showIdentical={viewStates.views.identical.state}
                    />
                </div>
                    <hr class="mb-2"/>
                {/each}
            {:else}
                (No results. Try <a href="" data-sveltekit-reload>another search</a>{#if hideNonPrimary || focusOn || hideSolos }, 
                or change the <a href="" onclick={()=>{viewStates.toggle('view')}}>View Options</a>{/if}.)
            {/if}
        {:else}
        <h3><i>Loading...</i></h3>
        <span class="loading loading-spinner loading-xl"></span>
        {/if}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here. 
            {#if viewStates.views.lookup.state ==false}<a class="link hover:text-blue-700" 
            href="#" onclick={()=>{viewStates.views.lookup.state=true}}>Search for a text or select a section.</a>
            {:else}
                Search for a text or select a section above.
            {/if}
        </i></div>
    {/if}
</div>
<div id="footer-panel" class="text-center">
      <hr/>
      © Fr. Christopher Brannan, O.P., 2025.  For more information about the project and its data sources, visit the <a href="https://github.com/cbop-dev/synoptic-viewer" target="_blank" class="link">github project page</a>.
    
</div>
{#if dataReady}
<Modal2 bind:showModal={viewStates.views.sections.state}>
            <div id="results-navigation"  class=" text-left">
            <h1>Search Results Navigation</h1>
                    <ul>
            {#each filteredPericopes as section, index}
            {@const pericope=gospelParallels.alandSynopsis.lookupPericope(section)}
            <li class="m-1 p-1 "><h3><a href="#section-{section}" 
                onclick={()=>{viewStates.views.sections.state=false}}><b>{section}. {pericope.title}</b> 
                <i>({gospelParallels.getAlandPericopeRefs(section).join("; ")})</i></a></h3></li>
            {/each}
                </ul>           
            </div>
</Modal2>
{/if}

<Modal2 bind:showModal={viewStates.views.words.state}>
    
    <div class="max-w-full block text-center">
                <h1>Unique or Identical Words:</h1>
            <ButtonSelect bind:selected={viewStates.views.unique.state} buttonText="Outline Unique Lexemes"/>
            
            <ButtonSelect bind:selected={viewStates.views.identical.state} tooltip="Toggle Bold/underline setting for morphologically identical words." buttonText="Identical words."/>


  <ButtonSelect buttonStyle="btn btn-neutral btn-outline btn-circle btn-xs p-0 m-0"
            buttonText="?"
            bind:selected={showLexOptionsInfo}/>
            {#if showLexOptionsInfo}
            <div class="md:max-w-3/4  self-center m-auto">
                <h2 class="underline">Unique and Identical Words Options:</h2>
                                        <div class="inline-block text-left">
                <ul class="list-disc">
                    <li>Enabling <b>"Outline Unique Lexemes"</b> will draw <span class="outline outline-blue-400">an outline</span> (one color per gospel) around each lexeme that is unique to a specific gospel, i.e., that shows up in only one column of a single parallel group.</li>
                    <li>Enabling <b>"Identical words"</b> will <span class="font-bold underline">bold and underline</span> all morphologically identical words shared by at least two gospels in the same parallel group </li>
                </ul>
                </div>
            </div>
            {/if}


 

            
           
            <hr/>
            <h1>Highlighted Lexemes</h1>
            {#if selectedLexes.length}
            
            <h2>Selected Lexemes:</h2>
            <i>Click on a lexeme to remove it.</i>
            <br/>
            {#each selectedLexes as lex}
               <Button onclick={()=>toggleLex(lex)} buttonText={lemmasByID[lex]} buttonColors={getColorClasses(lex)} buttonType=''/> 
            {/each}<br/>
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
              {#if bestMatchedLexes.length == 0}
                 {#each unselectedLexes as id}
                 <Button onclick={()=>toggleLex(id)} 
                    buttonText={lemmasByID[id]} 
                    buttonType="btn-accent" style="hover:text-white"/> 
                {/each}
                {:else}
                 <h1>Trying to filter!</h1>
                 <h3>Best matches:</h3>
                    {#each bestMatchedLexes as lexIndex}
                    {@const lexId = unselectedLexes[Number(lexIndex)]}
                    {@const lemma=lemmasByID[lexId]}
                    <!--  bestMatched.lexIndex = {lexIndex}, LexID={lexId}, Lemma='{lemma}'-->
                
                    <Button onclick={()=>toggleLex(lexId)} 
                    buttonText={lemma} 
                    buttonType="btn-accent" style="hover:text-white"/> 
                    {/each}
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
</Modal2>

<Modal2 bind:showModal={viewStates.views.view.state}>
    <div class="text-center">
     <h2>Select Primary Gospel for Viewing:</h2>
                <select bind:value={selectedGospelIndex}>
                {#each gospelOptions as option, index}
                <option value={index}>{option.name}</option>
                {/each}
                </select>
           <hr/>
           <h2>Sort, Filter, and/or Focus:</h2>
           <i>(Based on selected primary Gospel.)</i><br/>
            <ButtonSelect bind:selected={sort} disable={!gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Sort" tooltip="Sort according to the selected gospel's order."/> 
            <ButtonSelect bind:selected={hideNonPrimary} 
            disable={focusOn || !gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Isolate" tooltip="Hide all Aland's sections which do not include the selected gospel or which contain seconary duplicates of it."/>
            <ButtonSelect bind:selected={focusOn} disable={!gospelParallels.gospels.isValid(selectedGospel)} 
            buttonText="Focus!" tooltip="Focus on the selected gospel, making it more visibled, and removing any sections which do not contain it or contain secondary duplicates."/>
            <ButtonSelect 
            disable={!gospelParallels.gospels.isValid(selectedGospel) || (focusOn||hideNonPrimary)} 
            bind:selected={hideNonPrimarySolos} 
           buttonText="Hide Non-Primary Solos" 
           tooltip="Hide all sections that have only one column but which is not the selected gospel."/>
    <br/>
            <ButtonSelect bind:selected={hideSolos} buttonText="Hide All Solos" 
            tooltip="Hide ALL sections that have only one gospel column."/>
           

        <hr class="mt-1 mb-1"/>
        <Button onclick={resetViewOptions} buttonText="Reset All"/>
</div>
        </Modal2>

<Modal2 bind:showModal={viewStates.views.info.state}>
    <div class="text-left m-auto inline">
    <h2 >NT Gospel Synopsis Viewer</h2> <hr/>
            Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
            Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
        <hr/>
        Web application created by Fr. Christopher Brannan, O.P. For more information about the project and its data sources, visit the <a href="https://github.com/cbop-dev/synoptic-viewer" target="_blank">github project page</a>.
    </div>
    <div class="btn-sm"></div>
</Modal2>
<Modal2 bind:showModal={viewStates.views.help.state} title="Help">
    
    <div class="m-auto  items-center text-center ">
        
    <h2 class="inline text-center ">Hotkeys: <i>The keyboard is your friend!</i></h2>
    
    <table class="table-auto self-center m-auto text-left "><tbody>
        <tr class="border-0  border-b border-collapse border-gray-200" ><th>Key</th><th>Function</th></tr>
{#each Object.entries(viewStates.views) as [theViewName,theViewObj]}
    
    <tr>
        <td class="p-2">{theViewObj.hotkeys.map((k)=>"["+k+"]").join(",")} </td>
        <td class="p-2">{theViewObj.description}</td>
    </tr>
{/each}
{#each hotkeys as hk}
    <tr>
        <td class="p-2">[{hk.key}] </td>
        <td class="p-2">{hk.name}</td>
    </tr>
{/each}
</tbody>
    </table>
    </div>

</Modal2>