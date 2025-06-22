<script>
    import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
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
    import { untrack } from 'svelte';
    import { ColorUtils } from '$lib/utils/color-utils';
	import GreekFilterInput from '../ui/GreekFilterInput.svelte';
    import FilterInput from '../ui/FilterInput.svelte';
	import { GreekUtils } from '$lib/utils/greek-utils';
    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);
    let dataReady = $state(false);
     let showSectionLinks=$state(false);
   let showViewOptions=$state(false);
   let showUnique = $state(false);
   let uniqueStyle = "lex-uniques";
   let hideSolos = $state(false);
     let hideNonPrimarySolos = $state(false);
    let showLexemeHighlights = $state(false);
    let showLookupPanel = $state(true);
    let showSortModal = $state(false);
    let landingPage=$state(true);

    /**
    * @type {number[]} selectedLexes
    */
    let selectedLexes=$state([]);
    
   let sortOptionIndex =$state(0);
   const sortOptions =[
    {value: gospelParallels.gospels.NONE, name: "None", abbrev:""},
    {value: gospelParallels.gospels.MATTHEW, name: "Matthew", abbrev:"matt"},
    {value: gospelParallels.gospels.MARK, name:  "Mark", abbrev:"mark"},
    {value: gospelParallels.gospels.LUKE, name:  "Luke", abbrev:"luke"},
    {value: gospelParallels.gospels.JOHN, name: "John", abbrev: "john"}

   ];

   let hideNonPrimary = $state(true);
   //what is this for?
   let hideOthers = $state(false);
   let focusOn=$state(false);
   let focused=$derived.by(()=>{
        let retVal = gospelParallels.gospels.NONE;
        if (focusOn){
            retVal = sortOptions[sortOptionIndex].value;
        }
        return retVal;
   });
   let sort = $state(false);
   let filter=$state(false);
  // let sortFilter=$state(false);
    function sortFilterClick(){
      //  focus=gospelParallels.gospels.NONE;
        //sortOptionIndex=
        //buildAndFetchPericopes();
    }
    function focusClick(){
        //buildAndFetchPericopes();
        //focus=sortOptions[sortOptionIndex].value;
   }
    /**
     * @type {GospelPericopeGroup[]} perGroups
     */

    let perGroups = $state([]);
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

    function parsePericopeNums(){
        const refAreaRefs = refAreaText.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";");

        /**
         * @type {number[]} theNums
         */
        const theNums = [];
        bibleUtils.expandRefs(refAreaRefs).forEach((ref)=>{
            const pNum = gospelParallels.getAlandPericopeNumbers(ref.trim(),sortOptions[sortOptionIndex].value, true);
            for (const num of pNum){
                if(!theNums.includes(num))
                    theNums.push(num);
            }
            
        });
        
        alandPericopeNums = theNums.sort((a,b)=>a-b);   
    }

    function sortAndFilterPericopes(){
      //  alandPericopesNums=
    }
    function buildPericopeRefs(){
        mylog("sorting pericopes. Initial state = " + alandPericopeNums.join(","));
        //gospelParallels.sortAlandPericopes(alandPericopeNums,sortOptions[sortOptionIndex].value);
        //filteredPericopes = alandPericopeNums.filter((p)=>!hideNonPrimary || 
        //    (gospelParallels.alandSynopsis.isPrimaryPericope(p,sortOptions[sortOptionIndex].value)));
        mylog("sorting pericopes. Sorted state = " + alandPericopeNums.join(","));
        
        perGroups = TfUtils.getGroupsArray(filteredPericopes);
       // const theArrays = TfUtils.getRefsArrays(perGroups);
       // perGroupsIndices = theArrays.groupsIndices;
       // groupsRefsArray =theArrays.refsArray;
        mylog("ran geRefsArrays!")
 
    }

       /**
     * @type {number[]} alandPericopes
     */
    let alandPericopeNums = $state([]);
 
    let filteredPericopes=$derived.by(()=>{
        let sortedAland=alandPericopeNums ? alandPericopeNums : [];
        if (sort || filter || focusOn || hideSolos||hideNonPrimarySolos) {
            sortedAland = gospelParallels.filterSortAlandPericopes(sortedAland,
            (sort|| filter || focusOn ) ? 
                sortOptions[sortOptionIndex].value 
               : gospelParallels.gospels.NONE,
            filter || focusOn, //hideNonPrimary: only filter out non-primary texts if one of these is true
            hideSolos,
            (sort|| filter || focusOn) && hideNonPrimarySolos);//hideNonPrimarySolos parameter
        }
    
        return sortedAland;
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
      //      (gospelParallels.alandSynopsis.isPrimaryPericope(p,sortOptions[sortOptionIndex].value))))


  let selectedSection = $state([1]);
   function selectSection(){
    landingPage=false;
        resetViewOptions();
        alandPericopeNums=[...selectedSection];

        buildAndFetchPericopes();
   } 

/**
     * @type {Object<number,string>} lexClasses
     */
    
    let lexClasses=$derived.by(()=>{// id->css color (e.g., "#eee")
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
        showLookupPanel=false;
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
        mylog("building LexArrays...", true)
        lemmasByID ={};
        if (fetchedTextsResponse) {
            for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
                lemmasByID[lex.id]=lemma;
            }
        }
        else{
            mylog("Cannot build LexArrays!", true)
        }
        //unselectedLexes=Object.keys(lemmasByID).sort();
        //todo finish.
        
        
    }
    function populateGroupsText(words=false){
        mylog("v==================================v", true)
        mylog("populateGroupTexts()...",true)
        
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
            group.markUniqueWords();        
        }
        mylog("DONE! Populated the GroupTexts()!")
        mylog("^==================================^")
    }
    function resetViewOptions(){
        sortOptionIndex =0;
        sort = false;
        filter=false;
        focusOn=false;
        showUnique=false;
        hideSolos=false;
        hideNonPrimarySolos=false;
        
      //  focus=sortOptions[sortOptionIndex].value;
    }
    function lookupShowNtParallels(){
        resetViewOptions();
        parsePericopeNums();
        buildAndFetchPericopes();
        //fetching = false;
        //ready = true;
        

        
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
           // unselectedLexes.push(id);
           // unselectedLexes.sort((a,b)=>a-b);
        }
        else {
           // unselectedLexes.splice(unselectedLexes.indexOf(id),1);
            selectedLexes.push(id);
            //selectedLexes.sort((a,b)=>a-b);
        }
    }

    function highlightLexeme(id=0,color=null){
        let ret = ''
        ret += "bg-red-500";
        return ret;
    }

    
    //$inspect("perGroups", perGroups, "expecting" expecting, perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
   // $inspect("unselectedLexmes:", unselectedLexes, "selectedLexes", selectedLexes, "fetchedTextsResponse:", fetchedTextsResponse, "perGroups", perGroups, "perGroupsIndics", perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
   // $inspect("Twelve");
   // $inspect("lexClasses:", lexClasses)
   //$inspect("filteredPericopes:", filteredPericopes, "[sortFilter, focusOn]:",[sortFilter,focusOn])
   //$inspect("focusOn:", focusOn, "focused:", focused)
   //$inspect("hideSolos:", hideSolos,"filteredPericopes:", filteredPericopes)
  // $inspect("showLookuPanel", showLookupPanel)
  $inspect("lemmasByID", lemmasByID,"unselectedLexes:", unselectedLexes,"unselectedLexPlainArray:",unselectedLexPlainArray,"bestMatchedLexes",bestMatchedLexes)
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
        @apply -mt-24 pt-24;
    }



</style>

<div class="self-center text-center sticky top-0 ">

    {#if !landingPage}
    <div class="navbar bg-base-100 shadow-sm ">
  <div class="navbar-start text-left max-w-full w-full m-auto">
    <div class="dropdown md:hidden text-left">
       
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
      </div>
      
      <ul tabindex="0"
            
        class="menu  dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow text-left ">

      <li >
        <ButtonSelect bind:selected={showLookupPanel} buttonText="☰ Lookup" buttonStyle="btn"/>
      </li>

      {#if alandPericopeNums && alandPericopeNums.length}
      <li><ButtonSelect bind:selected={showSortModal} buttonText="☰ View Options"/></li>

     {#if dataReady}
     
       <li> <ButtonSelect buttonText="☰ Jump to    ↓" bind:selected={showSectionLinks}/></li>       
        <li><ButtonSelect bind:selected={showLexemeHighlights} buttonText="☰ Words" /></li>
            
        
         
     {/if}
      {/if}

      </ul>
    </div>
    <div class="text-left md:hidden">
       <h1 class="inline">NT&nbsp;Synopsis</h1>&nbsp;<ModalButton buttonText="ⓘ" buttonStyle="btn-ghost inline">
        <div class="text-left m-auto inline">
    <h2 >NT Gospel Synopsis Viewer</h2> <hr/>
            Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
            Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
        <hr/>
        Web application created by Fr. Christopher Brannan, O.P. For more information about the project and its data sources, visit the <a href="https://github.com/cbop-dev/synoptic-viewer" target="_blank">github project page</a>.
    </div>
    </ModalButton>
    </div>
  </div>
  <div class="hidden md:navbar-center ">
    <h1 class="block  text-center"> 
        <span class="hidden lg:inline">NT Gospel Synopsis Viewer</span>
        <span class="lg:hidden inline">NT Synopsis</span>
    </h1>
       <div class="inline-block"> 
    <ul class="bg-white menu menu-horizontal ">
        
      <li >
        <ButtonSelect bind:selected={showLookupPanel} buttonText="☰ Lookup" buttonStyle="btn"/>
      </li>

      {#if alandPericopeNums && alandPericopeNums.length}
      <li><ButtonSelect bind:selected={showSortModal} buttonText="☰ View Options"/></li>

     {#if dataReady}
     
       <li> <ButtonSelect buttonText="☰ Jump to    ↓" bind:selected={showSectionLinks}/></li>       
        <li><ButtonSelect bind:selected={showLexemeHighlights} buttonText="☰ Words" /></li>
            
        
         
     {/if}
      {/if}
    </ul>
    </div>
  </div>
  <div class="navbar-end">
   


  </div>
    </div>
    {/if}
    <!--==================================================================-->



</div>

{#if landingPage}
<div id="landing-panel text-center">
   <h1 class="block text-center ">NT Gospel Synopsis Viewer</h1>
    
        
        <div class="text-center m-auto">
    
            Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i>, using Nestle's 1904 edition of the <i>Greek New Testament.</i><br/>
            Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"
      </div>
</div>
    <hr/>

{/if}
{#if showLookupPanel}
<div id="search-panel" class="text-center">
     Choose One:
            <h2 class="cursor-default">Enter References</h2><div class="inline-block mb-1"><textarea id="refarea" class="inline-block align-middle" rows="1" bind:value={refAreaText}></textarea>
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
            <hr/>
            <option value={gospelParallels.alandSynopsis.pericopes.map((p)=>p.pericope)}>Everything!!</option>

        </select>
        <button onclick={selectSection} class="align-top btn btn-primary inline-block">Go!</button>
</div>
{/if}
<div class="text-center mt-3">
    
    {#if alandPericopeNums.length}
         <h1 class="text-center">Results:</h1>
          
     
   
  
      
   

    

    <div id="results">


        {#if dataReady && fetchedTextsResponse}

            {#each filteredPerGroups as group, index}
            <div class='anchor text-center' id="section-{group.id}">
                <h2 class="inline-block"><b><u>{group.title}</u></b></h2>
                  </div>
            <div class="float-right mr-2 break-after-all">
                   <a href="" class="" onclick={()=>{showSectionLinks=true}}>[Jump...]</a>
                {#if index > 0}
                <a href="#section-{filteredPerGroups[index-1].id}">[Prev]</a>{/if}
                <a href="#">[Top]</a>
                {#if index < filteredPerGroups.length-1}<a href="#section-{filteredPerGroups[index+1].id}" class="break-after-all">[Next]</a>{/if}
            </div>
                
    
          
            <br/>
            
                <ParallelTextSection parGroup={group} focus={focused}
                 wordClick={toggleLex} {showUnique} uniqueStyle={showUnique ? uniqueStyle : ''} classFunc={getLexClasses}/>
            <hr class="mb-2"/>
            {/each}
        {:else}
        <h3><i>Loading...</i></h3>
        <span class="loading loading-spinner loading-xl"></span>
        {/if}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here.</i></div>
    {/if}
</div>
<div id="footer-panel" class="text-center">
      <hr/>
      © Fr. Christopher Brannan, O.P., 2025.  For more information about the project and its data sources, visit the <a href="https://github.com/cbop-dev/synoptic-viewer" target="_blank" class="link">github project page</a>.
    
</div>

<Modal2 bind:showModal={showSectionLinks}>
            <div id="results-navigation"  class=" text-left">
            <h1>Search Results Navigation</h1>
                    <ul>
            {#each filteredPericopes as section, index}
            {@const pericope=gospelParallels.alandSynopsis.lookupPericope(section)}
            <li class="m-1 p-1 "><h3><a href="#section-{section}"><b>{section}. {pericope.title}</b> 
                <i>({gospelParallels.getAlandPericopeRefs(section).join("; ")})</i></a></h3></li>
            {/each}
                </ul>           
            </div>
</Modal2>

<Modal2 bind:showModal={showLexemeHighlights}>
    <div class="max-w-full block text-center">
                <h1>Unique Lexemes</h1>
            <ButtonSelect bind:selected={showUnique} buttonText="Outline"/>
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

<Modal2 bind:showModal={showSortModal}>
    <div class="text-center">
     <h2>Select Primary Gospel for Viewing:</h2>
                <select bind:value={sortOptionIndex}>
                {#each sortOptions as option, index}
                <option value={index}>{option.name}</option>
                {/each}
                </select>
           <hr/>
           <h2>Sort, Filter, or Focus:</h2>
           <i>(Based on selected primary Gospel.)</i><br/>
            <ButtonSelect bind:selected={sort} disable={sortOptionIndex==0||filter||focusOn} buttonText="Sort"/>
            <ButtonSelect bind:selected={filter} disable={sortOptionIndex==0||focusOn} buttonText="Filter"/>
            <ButtonSelect bind:selected={focusOn} disable={sortOptionIndex==0} buttonText="Focus!"/>
          
    
        <hr class="mt-1 mb-1"/>
            
           <h2>Non-parallels:</h2>
           <ButtonSelect bind:selected={hideSolos} buttonText="Hide All Solos" tooltip="Hide sections with only one gospel column."/>
           <ButtonSelect disable={!focusOn && !sort && !filter} bind:selected={hideNonPrimarySolos} 
           buttonText="Hide Non-Primary Solos" tooltip="Hide sections with only one gospel column."/>
</div>
        </Modal2>

