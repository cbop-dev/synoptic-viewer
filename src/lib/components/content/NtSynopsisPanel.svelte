<script>
    import { gospelParallels } from "@cbop-dev/aland-gospel-synopsis";
    import { ParallelText, GospelPericopeGroup } from "./parallelTexts.svelte";
    import { tfServer } from "$lib/n1904/tfN1904";
	import ParallelTextSection from "./ParallelTextSection.svelte";
	import { mylog } from "$lib/env/env";

    let fetching = $state(false);
    let expecting = $state(0);
    let numReady=$state(0);
    let ready = $derived(numReady >= expecting);

    function getPericopeNums(){
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
                const theRef =  bookAbbrev? bookAbbrev + " " + r : r;
                textRefArray.push({reference: theRef, text: ''});
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
                const bookCv=gospelParallels.getBookChapVerseFromRef(tRef.reference);
                const bookName = gospelParallels.getBookNameBySyn(bookCv.book);
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
                    tfServer.getNodeFromRef(tRef.reference).then((node)=>{
                        tfServer.fetchTextAlone(node).then((text)=>{
                            tRef.text=text;
                            numReady+=1;
                        });
                    });

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
        getPericopeNums();
        buildPericopeRefs();
        fetching = true;
        fetchTexts();
        //fetching = false;
        //ready = true;
        

        
    }
    let refAreaText = $state('Matt 5:31');
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
Enter NT reference to view parallel texts:<br/>
<textarea id="refarea" rows="1" bind:value={refAreaText}></textarea><br/>
<button onclick={lookupShowNtParallels} class="btn btn-primary">Show me!</button>
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
            {#if index < perGroups.length-1}<a href="#section-{perGroups[index+1].id}">[Next]</a>{/if}
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

