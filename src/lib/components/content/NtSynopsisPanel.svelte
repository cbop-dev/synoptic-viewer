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
    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);
    let dataReady = $state(false);
    /**
     * @type {GospelPericopeGroup[]} perGroups
     */
    let perGroups = $state([]);

    /**
    * @type string[] groupsRefsArray
    */
    let groupsRefsArray = $state([]);
    
    /**
    * @type {Object|null} fetchedTextsResponse
    */
    let fetchedTextsResponse = $state(null);
    /**
     * @type {{matt:number[], mark:number[], luke:number[], john:number[], other:number[]}[]} perGroupsIndices
     */
    let perGroupsIndices = $state([]); //indices of groupsRefsArray

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

    function buildPericopeRefs(){
        mylog("sorting pericopes. Initial state = " + alandPericopeNums.join(","));
        gospelParallels.sortAlandPericopes(alandPericopeNums,sortOptions[sortOptionIndex].value);
        filteredPericopes = alandPericopeNums.filter((p)=>!hideNonPrimary || 
            (gospelParallels.alandSynopsis.isPrimaryPericope(p,sortOptions[sortOptionIndex].value)));
        mylog("sorting pericopes. Sorted state = " + alandPericopeNums.join(","));
        

        perGroups = TfUtils.getGroupsArray(filteredPericopes);
        const theArrays = TfUtils.getRefsArrays(perGroups);
        perGroupsIndices = theArrays.groupsIndices;
        groupsRefsArray =theArrays.refsArray;
        mylog("ran geRefsArrays!")
 
    }


    /**
     * 
     * @param {GospelPericopeGroup} group
     */
    async function fetchGroupText(group) {
        mylog("gonna fetch group...")
        const filteredGoupArray = [group.matt, group.mark,group.luke,group.john, group.other].filter((o)=>o.textRefs.length);
        mylog("filteredGroupArray.length: " + filteredGoupArray.length)
        expecting += filteredGoupArray.length;

        for (const col of filteredGoupArray){

            for (const tRef of col.textRefs){
                const bookCv=bibleUtils.getBookChapVerseFromRef(tRef.reference);
                bookCv.chap = bookCv.chap ? bookCv.chap.replaceAll(/[a-zA-Z]/g,'') : ''
                bookCv.v = bookCv.v ? bookCv.v.replaceAll(/[a-zA-Z]/g,'') : ''
                const bookName = TfServer.getBookNameBySyn(bookCv.book);
                mylog('fetchGroupText got bookname ' + bookName + " for: " + bookCv.book);
                if(bookCv.v && bookCv.v.includes('-')){//gotta range!, but in same chapter

                    const [start, end] = bookCv.v.split("-");
                    tfServer.tfGetTextFromRange(bookName,bookCv.chap,start,end).then((response)=>{
                        tRef.text = response.text ? response.text : '';
                        numReady+=1;
                    });

                    
                    numReady+=1;
                }
                
                else{//not a range!

                    tfServer.fetchVerseTextByRef(bookName,bookCv.chap,bookCv.v).then((verseText)=>{
                        tRef.text=verseText;
                        numReady+=1;
                    })

                }
                
            }

            
        }
    }
    function fetchTexts(){
        for (const group of perGroups){
            fetchGroupText(group);
        }
    
    }

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
        buildPericopeRefs();
        fetching = true;
        //fetchTexts();
        await fetchPostTextsBatch();
        populateGroupsText(true);
        dataReady= true;
    }

    function populateGroupsText(words=false){
        mylog("populateGroupTexts()...", true)
        for (const [index,group] of perGroups.entries()){
            mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index, true);
            for (const book of ['matt', 'mark', 'luke', 'john','other']){
                for (const [i,textRef] of group[book].textRefs.entries()){
                    mylog("checking ref: " + textRef.reference, true);
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
            
        }
    }
    function resetViewOptions(){
        sortOptionIndex =0;
        focus=sortOptions[sortOptionIndex].value;
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
     * @type {number[]} alandPericopes
     */
    let alandPericopeNums = $state([]);

    /**
     * @type {number[]} filteredPericopes
     */
    let filteredPericopes = $state([]);
    //$derived(alandPericopeNums.filter((p)=>!hideNonPrimary || 
      //      (gospelParallels.alandSynopsis.isPrimaryPericope(p,sortOptions[sortOptionIndex].value))))


  let selectedSection = $state();
   function selectSection(){
        alandPericopeNums=[...selectedSection];
        buildAndFetchPericopes();
   } 



   
   let sortOptionIndex =$state(0);
   const sortOptions =[
    {value: gospelParallels.gospels.NONE, name: "None"},
    {value: gospelParallels.gospels.MATTHEW, name: "Matthew"},
    {value: gospelParallels.gospels.MARK, name:  "Mark"},
    {value: gospelParallels.gospels.LUKE, name:  "Luke"},
    {value: gospelParallels.gospels.JOHN, name: "John"}

   ];

   let hideNonPrimary = $state(true);
   //what is this for?
   let hideOthers = $state(false);
   let focus=$state(gospelParallels.gospels.NONE);

    function sortFilterClick(){
        focus=gospelParallels.gospels.NONE;
        buildAndFetchPericopes();
    }
    function focusClick(){
        buildAndFetchPericopes();
        focus=sortOptions[sortOptionIndex].value;
   }

    /**
    * @type {number[]} selectedLexes
    */
    let selectedLexes=$state([]);
   // let lexemes=$state(null);

    function getColorClasses(lexid){
        let colorString = '';
        const redGradient =[
    " bg-red-600 text-white",
    " bg-red-700 text-white",
    "  bg-red-500 text-white",
    " bg-red-600 text-white",
    " bg-red-800 text-white",
    " bg-red-400 text-black",
    " bg-red-650 text-white",
    " bg-red-750 text-white",
    " bg-red-550 text-white",
    " bg-red-650 text-white",
    " bg-red-850 text-white",
    " bg-red-450 text-black"
    ];
    const orangeGradient =[
        " bg-orange-600 text-white",
    " bg-orange-700 text-white",
    "  bg-orange-500 text-white",
    " bg-orange-600 text-white",
    " bg-orange-800 text-white",
    " bg-orange-400 text-black",
    " bg-orange-650 text-white",
    " bg-orange-750 text-white",
    " bg-orange-550 text-white",
    " bg-orange-650 text-white",
    " bg-orange-850 text-white",
    " bg-orange-450 text-black"
    ];
    const amberGradient =[
        " bg-amber-600 text-white",
    " bg-amber-700 text-white",
    "  bg-amber-500 text-white",
    " bg-amber-600 text-white",
    " bg-amber-800 text-white",
    " bg-amber-400 text-black",
    " bg-amber-650 text-white",
    " bg-amber-750 text-white",
    " bg-amber-550 text-white",
    " bg-amber-650 text-white",
    " bg-amber-850 text-white",
    " bg-amber-450 text-black"
    ];
    const yellowGradient =[
        " bg-yellow-600 text-white",
    " bg-yellow-700 text-white",
    "  bg-yellow-500 text-white",
    " bg-yellow-600 text-white",
    " bg-yellow-800 text-white",
    " bg-yellow-400 text-black",
    " bg-yellow-650 text-white",
    " bg-yellow-750 text-white",
    " bg-yellow-550 text-white",
    " bg-yellow-650 text-white",
    " bg-yellow-850 text-white",
    " bg-yellow-450 text-black"
    ];
    const limeGradient =[
        " bg-lime-600 text-white",
    " bg-lime-700 text-white",
    "  bg-lime-500 text-white",
    " bg-lime-600 text-white",
    " bg-lime-800 text-white",
    " bg-lime-400 text-black",
    " bg-lime-650 text-white",
    " bg-lime-750 text-white",
    " bg-lime-550 text-white",
    " bg-lime-650 text-white",
    " bg-lime-850 text-white",
    " bg-lime-450 text-black"
    ];
    const greenGradient =[
        " bg-green-600 text-white",
    " bg-green-700 text-white",
    "  bg-green-500 text-white",
    " bg-green-600 text-white",
    " bg-green-800 text-white",
    " bg-green-400 text-black",
    " bg-green-650 text-white",
    " bg-green-750 text-white",
    " bg-green-550 text-white",
    " bg-green-650 text-white",
    " bg-green-850 text-white",
    " bg-green-450 text-black"
    ];
    const emeraldGradient =[
        " bg-emerald-600 text-white",
    " bg-emerald-700 text-white",
    "  bg-emerald-500 text-white",
    " bg-emerald-600 text-white",
    " bg-emerald-800 text-white",
    " bg-emerald-400 text-black",
    " bg-emerald-650 text-white",
    " bg-emerald-750 text-white",
    " bg-emerald-550 text-white",
    " bg-emerald-650 text-white",
    " bg-emerald-850 text-white",
    " bg-emerald-450 text-black"
    ];
    const tealGradient =[
        " bg-teal-600 text-white",
    " bg-teal-700 text-white",
    "  bg-teal-500 text-white",
    " bg-teal-600 text-white",
    " bg-teal-800 text-white",
    " bg-teal-400 text-black",
    " bg-teal-650 text-white",
    " bg-teal-750 text-white",
    " bg-teal-550 text-white",
    " bg-teal-650 text-white",
    " bg-teal-850 text-white",
    " bg-teal-450 text-black"
    ];
    const cyanGradient =[
        " bg-cyan-600 text-white",
    " bg-cyan-700 text-white",
    "  bg-cyan-500 text-white",
    " bg-cyan-600 text-white",
    " bg-cyan-800 text-white",
    " bg-cyan-400 text-black",
    " bg-cyan-650 text-white",
    " bg-cyan-750 text-white",
    " bg-cyan-550 text-white",
    " bg-cyan-650 text-white",
    " bg-cyan-850 text-white",
    " bg-cyan-450 text-black"
    ];
    const skyGradient =[
        " bg-sky-600 text-white",
    " bg-sky-700 text-white",
    "  bg-sky-500 text-white",
    " bg-sky-600 text-white",
    " bg-sky-800 text-white",
    " bg-sky-400 text-black",
    " bg-sky-650 text-white",
    " bg-sky-750 text-white",
    " bg-sky-550 text-white",
    " bg-sky-650 text-white",
    " bg-sky-850 text-white",
    " bg-sky-450 text-black"
    ];
    const blueGradient =[
        " bg-blue-600 text-white",
    " bg-blue-700 text-white",
    "  bg-blue-500 text-white",
    " bg-blue-600 text-white",
    " bg-blue-800 text-white",
    " bg-blue-400 text-black",
    " bg-blue-650 text-white",
    " bg-blue-750 text-white",
    " bg-blue-550 text-white",
    " bg-blue-650 text-white",
    " bg-blue-850 text-white",
    " bg-blue-450 text-black"
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
    " bg-violet-650 text-white",
    " bg-violet-750 text-white",
    " bg-violet-550 text-white",
    " bg-violet-650 text-white",
    " bg-violet-850 text-white",
    " bg-violet-450 text-black"
    ];
    const purpleGradient =[
        " bg-purple-600 text-white",
    " bg-purple-700 text-white",
    "  bg-purple-500 text-white",
    " bg-purple-600 text-white",
    " bg-purple-800 text-white",
    " bg-purple-400 text-black",
    " bg-purple-650 text-white",
    " bg-purple-750 text-white",
    " bg-purple-550 text-white",
    " bg-purple-650 text-white",
    " bg-purple-850 text-white",
    " bg-purple-450 text-black"
    ];
    const fuchsiaGradient =[
        " bg-fuchsia-600 text-white",
    " bg-fuchsia-700 text-white",
    "  bg-fuchsia-500 text-white",
    " bg-fuchsia-600 text-white",
    " bg-fuchsia-800 text-white",
    " bg-fuchsia-400 text-black",
    " bg-fuchsia-650 text-white",
    " bg-fuchsia-750 text-white",
    " bg-fuchsia-550 text-white",
    " bg-fuchsia-650 text-white",
    " bg-fuchsia-850 text-white",
    " bg-fuchsia-450 text-black"
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
        const colorArrays=[redGradient, purpleGradient, emeraldGradient, 
        orangeGradient, blueGradient, limeGradient, amberGradient, cyanGradient, yellowGradient, greenGradient, indigoGradient, tealGradient, skyGradient, violetGradient, roseGradient, fuchsiaGradient, pinkGradient ]

        
        if (selectedLexes.includes(lexid)){
            const selectedIndex = selectedLexes.indexOf(lexid)
            const gradientIndex = ( selectedIndex % colorArrays.length);
            const colorIndex = Math.floor(selectedIndex / colorArrays.length)%colorArrays[0].length;
            colorString += ' ' + colorArrays[gradientIndex][colorIndex];
            mylog(`getColorClasses(${lexid}): selectedIndex = ${selectedIndex}, gradIndex=${gradientIndex}, colorIndex=${colorIndex} colorString='${colorString}'`,true )
            
        }
        
        return colorString;

        
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
        let classString="lex-"+id;
        let highlight=highlightLexeme(id)
        return classString + (highlight ? " " + highlight : '');
    }

    function toggleLex(id){
        mylog("toggleLex("+id+")",true);
        if(selectedLexes.includes(id))
            selectedLexes.splice(selectedLexes.indexOf(id),1);
        else
            selectedLexes.push(id);
    }

    function highlightLexeme(id=0,color=null){
        let ret = ''
        ret += "bg-red-500";
        return ret;
    }


   let showSectionLinks=$state(false);
   let showViewOptions=$state(false);
    //$inspect("perGroups", perGroups, "expecting" expecting, perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
    $inspect("fetchedTextsResponse:", fetchedTextsResponse, "perGroups", perGroups, "perGroupsIndics", perGroupsIndices,"groupsRefsArray:", groupsRefsArray);
   // $inspect("Twelve");
    
</script>
<style>
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
          {#if dataReady}
          <ModalButton buttonText="Lexemes Highlights" title="Lexemes Highlights">
            <Button onclick={()=>{selectedLexes.length=0;}}  buttonText="Clear All"/>
            <h2>Selected Lexmes:</h2>
            <i>Click on lexeme to remove.</i>
            <hr/>
            {#each selectedLexes as lex}
               <Button onclick={()=>toggleLex(lex)} buttonText={Object.entries(fetchedTextsResponse.lexemes).find(
                ([lemma,obj])=>obj.id==lex)[0]} buttonColors={lexClasses[lex]}/> 
            {/each}
            <hr/>
            <h2>Other Lexemes</h2>
            <i>Click to add/highlight.</i>
            <br>
              {#each Object.entries(fetchedTextsResponse.lexemes).filter(
                ([lem,lex])=>!selectedLexes.includes(lex.id)) as [lem,lex]}
                <Button onclick={()=>toggleLex(lex.id)} buttonText={lem} buttonColors={lexClasses[lex.id]}/> 
            {/each}
            
         </ModalButton>
         {/if}
         
    {#if showViewOptions}
    <div id="sort-options" class="text-center inline-block">Sort/Focus:
        <select bind:value={sortOptionIndex}>
            {#each sortOptions as option, index}
            <option value={index}>{option.name}</option>
            {/each}
        </select>
        <button class="btn btn-primary inline-block align-middle" onclick={sortFilterClick}>Sort and Filter!</button>
        <button class="btn btn-primary inline-block align-middle" onclick={focusClick}>Focus!</button>

        <!--<label>
	    <input type="checkbox" bind:checked={hideNonPrimary} />
        Hide non-primary sections.
</label>-->
    </div>
    {/if}
        <div class="text-center inline-block" >
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
    <div id="results">
   

    </div>
    <div>
        {#if dataReady && fetchedTextsResponse}

            {#each perGroups as group, index}
            <div class='text-center' id="section-{group.id}">
                <h2 class="inline-block"><b><u>{group.title}</u></b></h2>
            <div class="float-right mr-2 break-after-all">
                {#if index > 0}<a href="#section-{perGroups[index-1].id}">[Prev]</a>{/if}
                <a href="#">[Top]</a>
                {#if index < perGroups.length-1}<a href="#section-{perGroups[index+1].id}" class="break-after-all">[Next]</a>{/if}
                </div>
                
                
                </div>
            <br/>
            
                <ParallelTextSection parGroup={group} {focus} wordClick={toggleLex} cssClassDict={lexClasses}/>
            <hr class="mb-2"/>
            {/each}
        {:else}
        Not ready!
        {/if}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here.</i></div>
    {/if}
</div>

