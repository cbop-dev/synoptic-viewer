<script>
    import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
    import { ParallelText, GospelPericopeGroup } from "./parallelTexts.svelte";
    import { tfServer, TfServer } from "$lib/n1904/tfN1904";
	import ParallelTextSection from "./ParallelTextSection.svelte";
	import { mylog } from "$lib/env/env";
    import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
    import * as mathUtils from '$lib/utils/math-utils.js';
	//import Button from '../ui/Button.svelte';
    import ButtonSelect from '../ui/ButtonSelect.svelte';

    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);

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
        
        /**
         * 
         * @param {string} bookAbbrev
         * @param {string} ref
         * @returns {{reference: string, text: string}[]}
         */
        function buildTextRefsArray(bookAbbrev, ref){
            let textRefArray = [];
             for (const r of ref.split(";")){
                
                const [c,vv] = r.split(":");

                if(c && vv) {
                    if (vv.includes(',')){ //got indivisual verses/ranges
                        
                        for (const v of vv.split(',')){
                            let theRef = bookAbbrev? bookAbbrev + " ": '';
                            theRef += c+":"+v;
                            textRefArray.push({reference: theRef, text: ''});
                        }

                    }   
                    else{
                        const theRef =  bookAbbrev? bookAbbrev + " " + r : r;
                        textRefArray.push({reference: theRef, text: ''});
                    }
                }
                else{
                    const theRef =  bookAbbrev? bookAbbrev + " " + ref : ref;
                    textRefArray.push({reference: theRef, text: ''});
                }
                    
                
             }
             return textRefArray;
        }
        perGroups = filteredPericopes.map((pericope)=>{
            const row = gospelParallels.alandSynopsis.lookupPericope(pericope);
            const perGroup = new GospelPericopeGroup();
            perGroup.id = row.pericope;
            perGroup.title = row.pericope + ": " + row.title;
            if (row.Matt.ref)
                perGroup.matt.textRefs.push(...buildTextRefsArray("Matt", row.Matt.ref));
            if (row.Mark.ref)
                perGroup.mark.textRefs.push(...buildTextRefsArray("Mark", row.Mark.ref));
            if (row.Luke.ref)
                perGroup.luke.textRefs.push(...buildTextRefsArray("Luke", row.Luke.ref));
            if (row.John.ref)
                perGroup.john.textRefs.push(...buildTextRefsArray("John", row.John.ref));
            if (row.other.ref)
                perGroup.other.textRefs.push(...buildTextRefsArray("", row.other.ref));
             
            return perGroup;

        });
        

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

                    /*const nodes = await tfServer.getVerseNodesFromRefRange(tRef.reference);
                    //const nodeTexts
                    for (const node of nodes){
                        if (tRef.text)
                            tRef.text += " ";
                        tRef.text += await tfServer.fetchTextAlone(node);
                        
                    }*/
                    numReady+=1;
                }
                
                else{//not a range!

                    tfServer.fetchVerseTextByRef(bookName,bookCv.chap,bookCv.v).then((verseText)=>{
                        tRef.text=verseText;
                        numReady+=1;
                    })


                   /* tfServer.getNodeFromRef(tRef.reference).then((node)=>{
                        tfServer.fetchTextAlone(node).then((text)=>{
                            tRef.text=text;
                            numReady+=1;
                        });
                    });*/

                }
                
            }

            
        }
    }

    function fetchTexts(){
        for (const group of perGroups){
            fetchGroupText(group);
        }
    
    }

    function buildAndFetchPericopes(){
        buildPericopeRefs();
        fetching = true;
        fetchTexts();
    }
    function lookupShowNtParallels(){
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

    /**
     * @type {{pericope: number, title: string, 
     *  Matt: { ref: string,  primary: boolean }, 
     *  Mark: { ref: string , primary: boolean },
     *  Luke: { ref:  string , primary: boolean }, 
     *  John: { ref:string , primary: boolean }, 
     *  other: { ref:string }}[]} perTextData
     */
    let perTextData =$state([]);

    let selectedSection = $state();
   function selectSection(){
        alandPericopeNums=[...selectedSection];
        buildAndFetchPericopes();
   } 

    /**
     * @type {GospelPericopeGroup[]} parTexts
     */
    let perGroups = $state([]);
        
    $inspect(perGroups, expecting);
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
   let showSectionLinks=$state(false);
   let showViewOptions=$state(false);
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
        
            <ParallelTextSection parGroup={group} {focus}/>
    <hr class="mb-2"/>
        {/each}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here.</i></div>
    {/if}
</div>

