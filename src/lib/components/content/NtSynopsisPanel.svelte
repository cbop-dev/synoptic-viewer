<script>
    import { gospelParallels } from "@cbop-dev/aland-gospel-synopsis";
    import { ParallelText, GospelPericopeGroup } from "./parallelTexts.svelte";
    import { tfServer, TfServer } from "$lib/n1904/tfN1904";
	import ParallelTextSection from "./ParallelTextSection.svelte";
	import { mylog } from "$lib/env/env";
    import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
    import * as mathUtils from '$lib/utils/math-utils.js';

    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);

    function parsePericopeNums(){
        const refAreaRefs = refAreaText.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";").split(";");
        /**
         * @type {number[]} theNums
         */
        const theNums = [];
        refAreaRefs.forEach((ref)=>{
            const pNum = gospelParallels.getAlandPericopeNumbers(ref.trim());
            for (const num of pNum){
                if(!theNums.includes(num))
                    theNums.push(num);
            }
            
        });
        
        alandPericopeNums = theNums.sort((a,b)=>a-b);   
    }

    function buildPericopeRefs(){
        
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
        perGroups = alandPericopeNums.map((pericope)=>{
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

    function lookupShowNtParallels(){
        parsePericopeNums();
        buildPericopeRefs();
        fetching = true;
        fetchTexts();
        //fetching = false;
        //ready = true;
        

        
    }
    let refAreaText = $state('Matt 6:10');
    /**
     * @type {number[]}
     */
    let alandPericopeNums = $state([])

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
        buildPericopeRefs();
        fetching = true;
        fetchTexts();
   } 

    /**
     * @type {GospelPericopeGroup[]} parTexts
     */
    let perGroups = $state([]);
        
    $inspect(perGroups, expecting);
   
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
<div >
    {#if alandPericopeNums.length}

    <div class="text-center" id="results">
    <h2 class="inline-block">Sections:</h2>
    <div class="inline-block">
        {#each alandPericopeNums as section, index}
        {index > 0 ? ', ': ''}<a href="#section-{section}">{section}</a>
        {/each}


    </div>
    </div>
    <div>
        {#each perGroups as group, index}
        <div class='text-center' id="section-{group.id}">
            <h2 class="inline-block"><b><u>{group.title}</u></b></h2>
        <div class="float-right mr-2">
            {#if index > 0}<a href="#section-{perGroups[index-1].id}">[Prev]</a>{/if}
            <a href="#">[Top]</a>
            {#if index < perGroups.length-1}<a href="#section-{perGroups[index+1].id}" class="break-after-all">[Next]</a>{/if}
        </div>
        
        
        </div>
        
            <ParallelTextSection parGroup={group}/>
    <hr class="mb-2"/>
        {/each}

    </div>
    
    {:else}
        <div class="text-center"><i class="m-auto">Results will show up here.</i></div>
    {/if}
</div>

