<script>
    import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
    import { ParallelText, GospelPericopeGroup } from "./parallelTexts.svelte";
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
	
    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);
    let dataReady = $state(false);
    
    
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
   let sortFilter=$state(false);
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
        if (sortFilter) {
            sortedAland = gospelParallels.filterSortAlandPericopes(sortedAland,sortOptions[sortOptionIndex].value)
        }
    
        return sortedAland;
    })
    
   

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
        dataReady=false;
        mylog("disabling sortFilter and focus...", true);
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
    let lemmasByID=$derived.by(()=>{
        let dict={}
        if (fetchedTextsResponse && fetchedTextsResponse.lexemes) {
            for (const [lemma,lex] of Object.entries(fetchedTextsResponse.lexemes)){
                dict[lex.id]=lemma;
            }
        }
        return dict;
    })

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
        mylog("populateGroupTexts()...")
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
            }   /**
     * @type {number[]} alandPericopes
     */
    let alandPericopeNums = $state([]);
            
        }
    }
    function resetViewOptions(){
        sortOptionIndex =0;
        sortFilter=false;
        focusOn=false;
      //  focus=sortOptions[sortOptionIndex].value;
    }
    function lookupShowNtParallels(){
        resetViewOptions();
        parsePericopeNums();
        buildAndFetchPericopes();
        //fetching = false;
        //ready = true;
        

        
    }
    let refAreaText = $state('Matt 6:10');
 

    /**
     * @type {number[]} filteredPericopes
     */
 //   let filteredPericopes = $state([]);
    //$derived(alandPericopeNums.filter((p)=>!hideNonPrimary || 
      //      (gospelParallels.alandSynopsis.isPrimaryPericope(p,sortOptions[sortOptionIndex].value))))


  let selectedSection = $state();
   function selectSection(){
        resetViewOptions();
        alandPericopeNums=[...selectedSection];
        buildAndFetchPericopes();
   } 




   // let lexemes=$state(null);



  function getColorClasses(lexid){
        let colorClassString = '';
        const redGradient =[
    " bg-red-600 text-black",
    " bg-red-200 text-black",
    " bg-red-800 text-white",
    " bg-red-400 text-black",
    " bg-red-100 text-black",
    " bg-red-700 text-white",
    " bg-red-650 text-white",
    " bg-red-150 text-white",
    " bg-red-550 text-white",
    " bg-red-350 text-black",
    " bg-red-850 text-white",
    " bg-red-350 text-black"
    ];
    const orangeGradient =[
    " bg-orange-600 text-black",
    " bg-orange-200 text-black",
    " bg-orange-800 text-white",
    " bg-orange-400 text-black",
    " bg-orange-100 text-black",
    " bg-orange-700 text-white",
    " bg-orange-650 text-white",
    " bg-orange-150 text-white",
    " bg-orange-550 text-white",
    " bg-orange-350 text-black",
    " bg-orange-850 text-white",
    " bg-orange-350 text-black"
    ];
    const amberGradient =[
    " bg-amber-600 text-black",
    " bg-amber-200 text-black",
    " bg-amber-800 text-white",
    " bg-amber-400 text-black",
    " bg-amber-100 text-black",
    " bg-amber-700 text-white",
    " bg-amber-650 text-white",
    " bg-amber-150 text-white",
    " bg-amber-550 text-white",
    " bg-amber-350 text-black",
    " bg-amber-850 text-white",
    " bg-amber-350 text-black"
    ];
    const yellowGradient =[
   " bg-yellow-600 text-black",
    " bg-yellow-200 text-black",
    " bg-yellow-800 text-white",
    " bg-yellow-400 text-black",
    " bg-yellow-100 text-black",
    " bg-yellow-700 text-white",
    " bg-yellow-650 text-white",
    " bg-yellow-150 text-white",
    " bg-yellow-550 text-white",
    " bg-yellow-350 text-black",
    " bg-yellow-850 text-white",
    " bg-yellow-350 text-black"
    ];
    const limeGradient =[
   " bg-lime-600 text-white ",
    " bg-lime-200 text-black",
    " bg-lime-800 text-white",
    " bg-lime-400 text-black",
    " bg-lime-100 text-black",
    " bg-lime-700 text-white",
    " bg-lime-650 text-white",
    " bg-lime-150 text-white",
    " bg-lime-550 text-white",
    " bg-lime-350 text-black",
    " bg-lime-850 text-white",
    " bg-lime-350 text-black"
    ];
    const greenGradient =[
       " bg-green-600 text-white",
    " bg-green-200 text-black",
    " bg-green-800 text-white",
    " bg-green-400 text-black",
    " bg-green-100 text-black",
    " bg-green-700 text-white",
    " bg-green-650 text-white",
    " bg-green-150 text-white",
    " bg-green-550 text-white",
    " bg-green-350 text-black",
    " bg-green-850 text-white",
    " bg-green-350 text-black"
    ];
    const emeraldGradient =[
   " bg-emerald-600 text-white",
    " bg-emerald-200 text-black",
    " bg-emerald-800 text-white",
    " bg-emerald-400 text-black",
    " bg-emerald-100 text-black",
    " bg-emerald-700 text-white",
    " bg-emerald-650 text-white",
    " bg-emerald-150 text-white",
    " bg-emerald-550 text-white",
    " bg-emerald-350 text-black",
    " bg-emerald-850 text-white",
    " bg-emerald-350 text-black"
    ];
    const tealGradient =[
    " bg-teal-600 text-white",
    " bg-teal-200 text-black",
    " bg-teal-800 text-white",
    " bg-teal-400 text-black",
    " bg-teal-100 text-black",
    " bg-teal-700 text-white",
    " bg-teal-650 text-white",
    " bg-teal-150 text-white",
    " bg-teal-550 text-white",
    " bg-teal-350 text-black",
    " bg-teal-850 text-white",
    " bg-teal-350 text-black"
    ];
    const cyanGradient =[
     " bg-cyan-600 text-white",
    " bg-cyan-200 text-black",
    " bg-cyan-800 text-white",
    " bg-cyan-400 text-black",
    " bg-cyan-100 text-black",
    " bg-cyan-700 text-white",
    " bg-cyan-650 text-white",
    " bg-cyan-150 text-white",
    " bg-cyan-550 text-white",
    " bg-cyan-350 text-black",
    " bg-cyan-850 text-white",
    " bg-cyan-350 text-black"
    ];
    const skyGradient =[
     " bg-sky-600 text-white",
    " bg-sky-200 text-black",
    " bg-sky-800 text-white",
    " bg-sky-400 text-black",
    " bg-sky-100 text-black",
    " bg-sky-700 text-white",
    " bg-sky-650 text-white",
    " bg-sky-150 text-white",
    " bg-sky-550 text-white",
    " bg-sky-350 text-black",
    " bg-sky-850 text-white",
    " bg-sky-350 text-black"
    ];
    const blueGradient =[
     " bg-blue-600 text-white",
    " bg-blue-200 text-black",
    " bg-blue-800 text-white",
    " bg-blue-400 text-black",
    " bg-blue-100 text-black",
    " bg-blue-700 text-white",
    " bg-blue-650 text-white",
    " bg-blue-150 text-white",
    " bg-blue-550 text-white",
    " bg-blue-350 text-black",
    " bg-blue-850 text-white",
    " bg-blue-350 text-black"
    ];
    const indigoGradient =[
        " bg-indigo-600 text-white",
    " bg-indigo-700 text-white",
    "  bg-indigo-500 text-white",
    " bg-indigo-600 text-white",
    " bg-indigo-800 text-white",
    " bg-indigo-400 text-black",
    " bg-indigo-650 text-white",
    " bg-indigo-750 text-white",
    " bg-indigo-550 text-white",
    " bg-indigo-650 text-white",
    " bg-indigo-850 text-white",
    " bg-indigo-450 text-black"
    ];
    const violetGradient =[
        " bg-violet-600 text-white",
    " bg-violet-700 text-white",
    "  bg-violet-500 text-white",
    " bg-violet-600 text-white",
    " bg-violet-800 text-white",
    " bg-violet-400 text-black",
    " bg-violet-200 text-black",
    " bg-violet-750 text-white",
    " bg-violet-550 text-white",
    " bg-violet-650 text-white",
    " bg-violet-850 text-white",
    " bg-violet-450 text-black"
    ];
    const purpleGradient =[
     " bg-purple-600 text-black",
    " bg-purple-200 text-black",
    " bg-purple-800 text-white",
    " bg-purple-400 text-black",
    " bg-purple-100 text-black",
    " bg-purple-700 text-white",
    " bg-purple-650 text-white",
    " bg-purple-150 text-white",
    " bg-purple-550 text-white",
    " bg-purple-750 text-black",
    " bg-purple-850 text-white",
    " bg-purple-350 text-black"
    ];
    const fuchsiaGradient =[
      " bg-fuchsia-600 text-black",
    " bg-fuchsia-200 text-black",
    " bg-fuchsia-800 text-white",
    " bg-fuchsia-400 text-black",
    " bg-fuchsia-100 text-black",
    " bg-fuchsia-700 text-white",
    " bg-fuchsia-500 text-white",
    " bg-fuchsia-150 text-white",
    " bg-fuchsia-550 text-white",
    " bg-fuchsia-750 text-black",
    " bg-fuchsia-850 text-white",
    " bg-fuchsia-350 text-black"
    ];
    const pinkGradient =[
        " bg-pink-600 text-white",
    " bg-pink-700 text-white",
    "  bg-pink-500 text-white",
    " bg-pink-600 text-white",
    " bg-pink-800 text-white",
    " bg-pink-400 text-black",
    " bg-pink-650 text-white",
    " bg-pink-750 text-white",
    " bg-pink-550 text-white",
    " bg-pink-650 text-white",
    " bg-pink-850 text-white",
    " bg-pink-450 text-black"
    ];
    const roseGradient =[
        " bg-rose-600 text-white",
    " bg-rose-700 text-white",
    "  bg-rose-500 text-white",
    " bg-rose-600 text-white",
    " bg-rose-800 text-white",
    " bg-rose-400 text-black",
    " bg-rose-650 text-white",
    " bg-rose-750 text-white",
    " bg-rose-550 text-white",
    " bg-rose-650 text-white",
    " bg-rose-850 text-white",
    " bg-rose-450 text-black"
    ];
   const slateGradient=[
    " bg-slate-600 text-white",
    " bg-slate-200 text-black",
    " bg-slate-800 text-white",
    " bg-slate-400 text-white",
    " bg-slate-100 text-black",
    " bg-slate-700 text-white",
    " bg-slate-650 text-white",
    " bg-slate-150 text-white",
    " bg-slate-550 text-white",
    " bg-slate-350 text-black",
    " bg-slate-850 text-white",
    " bg-slate-350 text-black"
    ];
    const stoneGradient=[
    " bg-stone-600 text-white",
    " bg-stone-200 text-black",
    " bg-stone-800 text-white",
    " bg-stone-400 text-white",
    " bg-stone-100 text-black",
    " bg-stone-700 text-white",
    " bg-stone-650 text-white",
    " bg-stone-150 text-white",
    " bg-stone-550 text-white",
    " bg-stone-350 text-black",
    " bg-stone-850 text-white",
    " bg-stone-350 text-black"
    ]
        const colorArrays=[redGradient, purpleGradient, emeraldGradient, stoneGradient,blueGradient,yellowGradient,
         limeGradient, cyanGradient,indigoGradient,amberGradient,  greenGradient,  orangeGradient, roseGradient, tealGradient, slateGradient, violetGradient, skyGradient, fuchsiaGradient, pinkGradient ]

        
        if (selectedLexes.includes(lexid)){
            const selectedIndex = selectedLexes.indexOf(lexid)
            const gradientIndex = ( selectedIndex % colorArrays.length);
            const colorIndex = Math.floor(selectedIndex / colorArrays.length)%colorArrays[0].length;
            colorClassString += ' ' + colorArrays[gradientIndex][colorIndex];
          //  mylog(`getColorClasses(${lexid}): selectedIndex = ${selectedIndex}, gradIndex=${gradientIndex}, colorIndex=${colorIndex} colorClassString='${colorClassString}'`,true )
            
        }
        
        return colorClassString;

        
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

   let showSectionLinks=$state(false);
   let showViewOptions=$state(false);
    //$inspect("perGroups", perGroups, "expecting" expecting, perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
   // $inspect("unselectedLexmes:", unselectedLexes, "selectedLexes", selectedLexes, "fetchedTextsResponse:", fetchedTextsResponse, "perGroups", perGroups, "perGroupsIndics", perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
   // $inspect("Twelve");
   // $inspect("lexClasses:", lexClasses)
   $inspect("filteredPericopes:", filteredPericopes, "[sortFilter, focusOn]:",[sortFilter,focusOn])
</script>
<style>
    @reference "tailwindcss";

    

    a:link:hover {
        text-decoration: underline;
    }


</style>
<div class="self-center text-center">
<h1 class="block text-center">NT Gospel Synopsis Viewer</h1>
Based on Kurt Aland's <i>Synopsis Quattuor Evangeliorum</i><br/>
Enter NT reference to view parallel texts and click "Look up!", or select a section and press "Go!"<hr class="m-2"/>
<div class="inline-block mb-1"><textarea id="refarea" class="inline-block align-middle" rows="1" bind:value={refAreaText}></textarea>
    <button onclick={lookupShowNtParallels} class="btn btn-primary inline-block align-middle">Look up!</button></div>
<br/>

<div class='mb-2'>
<select bind:value={selectedSection} >
    
    {#each gospelParallels.alandSynopsis.sections as section}
    <option value={mathUtils.createNumArrayFromStringListRange(section.pericopes)}>{mathUtils.romanize(section.section)}: {section.title}</option>
    <hr/>
    {/each}
    {#each gospelParallels.alandSynopsis.pericopes as per }
    
    <option value={[per.pericope]}>{per.pericope}: {per.title}</option>
    {/each}
    <hr/>
    <option value={gospelParallels.alandSynopsis.pericopes.map((p)=>p.pericope)}>Everything!!</option>

</select>
<button onclick={selectSection} class="btn btn-primary">Go!</button>
</div>
</div>
<hr/>
<div class="text-center">
    
    {#if alandPericopeNums.length}
         <h1 class="text-center">Results:</h1>
          <ButtonSelect buttonText="☰ View Options" bind:selected={showViewOptions}/>
         
         
    {#if showViewOptions}
    <div id="sort-options" class="text-center inline-block">Sort/Focus:
        <select bind:value={sortOptionIndex}>
            {#each sortOptions as option, index}
            <option value={index}>{option.name}</option>
            {/each}
        </select>
        <ButtonSelect bind:selected={sortFilter} buttonText="Sort/Filter"/>
        <ButtonSelect bind:selected={focusOn} buttonText="Focus!"/>

        <!--<label>
	    <input type="checkbox" bind:checked={hideNonPrimary} />
        Hide non-primary sections.
</label>-->
    </div>
    {/if}
        <div class="text-center inline-block p-1" >
    {#key sortOptionIndex && alandPericopeNums && perGroups}
    <ButtonSelect buttonText="☰ Sections" bind:selected={showSectionLinks}/>
{#if showSectionLinks}
    <div class="inline-block">
        {#each filteredPericopes as section, index}
        {index > 0 ? ', ': ''}<a href="#section-{section}">{section}</a>
        {/each}

    </div>
    {/if}
    {/key}
    </div>
    <div id="lexeme-highlights-options text-center inline-block">
         {#if dataReady}
          <ModalButton buttonText="☰ Lexemes" title="Lexeme Highlights ">
            
            
            {#if selectedLexes.length}
            <h2>Selected Lexmes:</h2>
            <i>Click on a lexeme to remove it.</i>
            <br/>
            {#each selectedLexes as lex}
               <Button onclick={()=>toggleLex(lex)} buttonText={lemmasByID[lex]} buttonColors={getColorClasses(lex)} buttonType=''/> 
            {/each}<br/>
            <Button onclick={emptySelectedLexemes}  buttonText="Clear All"/>
            {:else}<br/>
            <i>None selected. Click on a word in the text, or select a lexeme below.</i>
            {/if}
            <hr/>
            <h2>Other Lexemes</h2>
            <i>Click to add/highlight.</i>
            <br>
              {#each unselectedLexes as id}
                <Button onclick={()=>toggleLex(id)} 
                    buttonText={lemmasByID[id]} 
                    buttonType="btn-accent" style="hover:text-white"/> 
            {/each}
            
         </ModalButton>
         {/if}

    </div>
    <div id="results">


        {#if dataReady && fetchedTextsResponse}

            {#each filteredPerGroups as group, index}
            <div class='text-center' id="section-{group.id}">
                <h2 class="inline-block"><b><u>{group.title}</u></b></h2>
            <div class="float-right mr-2 break-after-all">
                {#if index > 0}<a href="#section-{filteredPerGroups[index-1].id}">[Prev]</a>{/if}
                <a href="#">[Top]</a>
                {#if index < filteredPerGroups.length-1}<a href="#section-{filteredPerGroups[index+1].id}" class="break-after-all">[Next]</a>{/if}
                </div>
                
    
                </div>
            <br/>
            
                <ParallelTextSection parGroup={group} focus={focused}
                 wordClick={toggleLex} classFunc={getLexClasses}/>
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

