//import ParTexts from "./parallelTexts.svelte.js";
import {ParallelColumn, ParallelColumnGroup, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices} from "./parallelTexts.svelte.js";
import * as env from '$lib/env/env.js'
import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
import { mylog } from "$lib/env/env";
import * as BibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as MathUtils from '$lib/utils/math-utils.js';
import { LexemeInfo,LexStats } from "../datastructures/lexeme.js";
import { GospelFilter } from "./SynopsisClasses.svelte.js";



/**
 * 
 * @param {string} bookAbbrev
 * @param {string} ref
 * @returns {TextAndRef[]}
 */
export function getTextRefsArray(bookAbbrev, ref){
    /**
     * @type {TextAndRef[]}
     */
    let textRefArray = [];
        for (const r of ref.trim().split(";").map((s)=>s.trim()).filter((s)=>s)){
           
            const [c,vv] = r.split(":");
            
            if(c && vv) {
                if (vv.includes(',')){ //got indivdual verses/ranges
                    
                    for (const v of vv.split(',')){
                        const textRef = new TextAndRef();
                        let theRef = bookAbbrev? bookAbbrev : "";
                        theRef += (theRef? " " : '') +c+":";
                        theRef += v;
                        textRef.reference=theRef;
                        textRefArray.push(textRef);
                    }

                }   
                else{
                    const theRef =  bookAbbrev? bookAbbrev + " " + r.trim() : r.trim();
                    const textRef = new TextAndRef();
                    textRef.reference=theRef;
                    textRefArray.push(textRef);
                }
            }
            else{
                const theRef =  bookAbbrev? bookAbbrev + " " + ref : ref;
                const textRef = new TextAndRef();
                    textRef.reference=theRef;
                    textRefArray.push(textRef);
            }
                
     
        }
    return textRefArray;
}


/**
 * @name buildGroupsArray
 * @param {number[]} pericopeNums
 * @returns  {GospelPericopeGroup[]}
 */
export function getGroupsArray(pericopeNums,includeSecondary=false){
    return pericopeNums.map((pericope)=>{
        const row = gospelParallels.alandSynopsis.lookupPericope(pericope);
        const perGroup = new GospelPericopeGroup();
        perGroup.id = row.pericope;
        perGroup.title = row.pericope + ": " + row.title;
        if (row.Matt.ref){
            perGroup.gospelCols.matt.textRefs.push(...getTextRefsArray("Matt", row.Matt.ref));
            
        }
        if (row.Mark.ref) {
            perGroup.gospelCols.mark.textRefs.push(...getTextRefsArray("Mark", row.Mark.ref));
           
        }
        if (row.Luke.ref){
            perGroup.gospelCols.luke.textRefs.push(...getTextRefsArray("Luke", row.Luke.ref));
            
        }
        if (row.John.ref) {
            perGroup.gospelCols.john.textRefs.push(...getTextRefsArray("John", row.John.ref));
           
        }
        if (row.other.ref) {
            perGroup.gospelCols.other.textRefs.push(...getTextRefsArray("", row.other.ref));
        }

        if(includeSecondary && row.Matt.secondary && row.Matt.secondary.length) {
            perGroup.gospelCols.matt.secondary.push(...getTextRefsArray("Matt", row.Matt.secondary));
        }
        if(includeSecondary && row.Mark.secondary && row.Mark.secondary.length) {
                perGroup.gospelCols.mark.secondary.push(...getTextRefsArray("Mark", row.Mark.secondary));
        }
        if(includeSecondary && row.Luke.secondary && row.Luke.secondary.length) {
                perGroup.gospelCols.luke.secondary.push(...getTextRefsArray("Luke", row.Luke.secondary));
        }
        if(includeSecondary && row.John.secondary && row.John.secondary.length) {
                perGroup.gospelCols.john.secondary.push(...getTextRefsArray("John", row.John.secondary));
        }
            
        return perGroup;

    });
}

/**
 * 
 * @param {ParallelColumnGroup[]} groupsArray 
 * @returns {{groupsIndices: number[][][], refsArray: string[]}} 
 * @description does some weird magic: returns two arrays:
 *  - groupsIndices: 3-dimensiona array of indices. 
 *      1. First level corresponds to indexes of groupsArray, and contains 2-dimensional arrays:
 *      2. Second level contains one array per column of the corresponding group in groupsArray
 *      3. Third level, is the actual indicies into the refsArray property
 * - refsArray: list of reference strings, where each is a biblical reference (e.g., "Matt 3:16")
 * 
 */
export function getParallelGroupsRefsArrays(groupsArray)
{
    let refIndex = 0;
    /**
     * @type {number[][][]} groupsIndices???? what is this?
     */
    const groupsIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];
    //TODO: test this. Does it work?
    for (let [gi, group] of groupsArray.entries()){
        /**
         * @type {number[][]} thisGroupIndices
         */
        const thisGroupIndices=[];
        
        for (const parText of group.parallelColumns){
            const thisColIndices=[]
            for (const ref of parText.textRefs){
                /**
                 * @type {number[]}
                 */
               
                if (refsArray.includes(ref.reference)){ //already fetching this ref. Double-dip!
                    thisColIndices.push(refsArray.indexOf(ref.reference));
                }
                else{
                    refsArray.push(ref.reference);
                    thisColIndices.push(refIndex);
                    refIndex++; 
                }
                
            }
            thisGroupIndices.push(thisColIndices);
        }

        groupsIndices.push(thisGroupIndices)
    }
    mylog('getPericopeRefs finishing. groupsIndices=');
    mylog(groupsIndices)
    return {groupsIndices,refsArray}
}
/**
 * 
 *  @param {ParallelColumn[]} parallelColumns 
 *  @return {{parallelIndices: number[][], refsArray: string[]}} 
 *  @description returns two arrays: parallelIndices, a 2-dimensional array of numbers. 
 *  The first indices of this corresponds with the indices of parallelColumns.  The second-level array contains indices into refsArray, 
 *  which in turn contains the reference (e.g., "Matt 3:16") for each bible text queried. This removes duplicate queries the same text 
 *  is wanted multiple times. Thus, the resulting `refsArray` of the return object function can be used to query the TfServer,
 *  and the result of this can be used refsArray to populate the texts in parallelColumns. 
 */
export function getParallelRefsArrays(parallelColumns){
     //let refIndex = 0;
    /**
     * @type {number[][]} groupsIndices
     */
    const parallelIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];

    
    for (let [index, parText] of parallelColumns.entries()){
        const thisParIndices=[];
        
        for (const [i,txtAndRef] of parText.textRefs.entries()){
            
            if (refsArray.includes(txtAndRef.reference)){ //already fetching this ref. Double-dip!
                thisParIndices.push(refsArray.indexOf(txtAndRef.reference));
            }
            else{
                const length = refsArray.push(txtAndRef.reference);
                thisParIndices.push(length-1);
                
            }
            
        }

        parallelIndices.push(thisParIndices);
     

        
    }
    mylog('getPericopeRefs finishing. groupsIndices=');
    mylog(parallelIndices)
    return {parallelIndices: parallelIndices,refsArray: refsArray}
}



/**
 * 
 * @param {GospelPericopeGroup[]} perGroups
 * @param {Object<string,Object>} response 
 * @param {GospelPericopeGroupIndices[]} perGroupsIndices 
 * @param {boolean} words 
 * @param {boolean} includeSecondary 
 * @param {number[]} [excludeCols=[]] indices of columns to exclude from phrase-matching. Will still populate them!
 */
export function populateGroupsText(perGroups,response,perGroupsIndices,words=true,includeSecondary=true,excludeCols=[]){
    // mylog("v==================================v", true);
    //mylog("populateGroupTexts()...",true);
    
    for (const [index,group] of perGroups.entries()){
        mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index);
        if (!group.populated) {
            populateGroupText(group,response && response['texts'] ? response['texts'] : null,perGroupsIndices[index],words,includeSecondary,excludeCols)        
        }
    }
    mylog("DONE! Populated the GroupTexts()!")
    mylog("^==================================^")
}

/**
 * @description Populates a group (one set/row of parallel columns) of aligned Gospel texts, based on the http/json response already given by a tf-fast service ('/texts/') request.
 * @param {GospelPericopeGroup} group
 * @param {Object|null} responseTexts 
 * @param {GospelPericopeGroupIndices} perGroupIndices 
 * @param {boolean} words 
 * @param {boolean} includeSecondary 
 * @param {number[]} [excludeCols=[]] indices of columns to exclude from phrase-matching. Will still populate them!
 */
export function populateGroupText(group,responseTexts=null,perGroupIndices,words=true,includeSecondary=true,excludeCols=[]){
    for (const book of ['matt', 'mark', 'luke', 'john','other']){
            for (const [i,textRef] of group[book].textRefs.entries()){
                mylog("checking ref: " + textRef.reference);
                const queryIndex= perGroupIndices[book].main[i];
                if (responseTexts && responseTexts[queryIndex]){
                    textRef.text= responseTexts[queryIndex].text;
                    if (responseTexts[queryIndex].notes){
                        const notes = responseTexts[queryIndex].notes.filter((n)=>n.length).join("\n");
                        if (notes.length){
                            textRef.note=notes;
                        }
                    }
                    if (words){
                        
                        textRef.vwords=VerseWords.buildFromObj(responseTexts[queryIndex].words);
                    }
                    // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                    // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                }
            }
            if (includeSecondary && group[book].secondary && group[book].secondary.length){
                for (const [i,textRef] of group[book].secondary.entries()){
                    mylog("checking ref: " + textRef.reference);
                    const queryIndex= perGroupIndices[book].secondary[i];
                    if (responseTexts && responseTexts[queryIndex]){
                        textRef.text= responseTexts[queryIndex].text;
                        if (responseTexts[queryIndex].notes){
                            const notes = responseTexts[queryIndex].notes.filter((n)=>n.length).join("\n");
                            if (notes.length){
                                textRef.note=notes;
                            }
                        }
                        if (words){
                            
                            textRef.vwords=VerseWords.buildFromObj(responseTexts[queryIndex].words);
                        }
                        // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                        // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                    }

                }
            }
        }
        //const excludeCols=GospelFilter.createValues(gospelFilter.filter).map((g,i)=>g? i : -1).filter((i)=> i>=0);
        group.markUniqueAndIdenticalWords(includeSecondary,excludeCols);
        group.buildLexIdenticalPhrases(3,true,true,excludeCols);  
        group.populated=true; 
}   


/**
* @description Populates on group of parallel columns of texts based on the http/json response already given by a tf-fast service ('/texts/') request.
* @param {ParallelColumnGroup} parallelColumnGroup 
* @param {Object} response
* @param {number[][]} parallelIndices - first index corresponding to that of parallelColumnGroup, then containing indices into response.text
* @param {boolean} [words=true]
* @param {number[]} [excludeCols=[]] 
*/
export function populateTextGroup(parallelColumnGroup, response, parallelIndices, words=true,excludeCols=[]){


    for (const [index,par] of parallelColumnGroup.parallelColumns.entries()){
    
        for (const [i,textRef] of par.textRefs.entries()){
            // mylog("checking ref: " + textRef.reference);
            const queryIndex= parallelIndices[index][i];
            if (response && response.texts && response.texts[queryIndex]){
                textRef.text= response.texts[queryIndex].text;
                if (words){
                    
                    const vWords = VerseWords.buildFromObj(response.texts[queryIndex].words);
                    textRef.vwords=vWords;
                }
                if (response.texts[queryIndex].notes){
                    const theNotes = response.texts[queryIndex].notes.filter((n)=>n.length).join("\n");
                    if (theNotes.length){
                        textRef.note=theNotes;
                    }
                }
                // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                
            }
            
            
        }
        
        parallelColumnGroup.markUniqueAndIdenticalWords(true,excludeCols);
        parallelColumnGroup.buildLexIdenticalPhrases(3,true,true,excludeCols);   
    }
 

}


/**
 * 
 * @param  {GospelPericopeGroup[]} groupsArray
 * @returns {{groupsIndices: GospelPericopeGroupIndices[], refsArray: string[]}} 
 **/
export function getGospelGroupRefsArrays(groupsArray,includeSecondary=false){
    let refIndex = 0;
    /**
     * @type {GospelPericopeGroupIndices[]} groupsIndices
     */
    const groupsIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];
    //TODO: test this. Does it work?
    for (let [gi, group] of groupsArray.entries()){
        const groupIndices=new GospelPericopeGroupIndices();
        
        for (const book of ['matt','mark','luke','john','other']){
            for (const ref of group[book].textRefs){
                if (refsArray.includes(ref.reference)){ //already fetching this ref. Double-dip!
                    groupIndices[book].main.push(refsArray.indexOf(ref.reference));
                }
                else{
                    refsArray.push(ref.reference);
                    groupIndices[book].main.push(refIndex);
                    refIndex++; 
                }
                
            }

            if(includeSecondary && group[book].secondary && group[book].secondary.length){
                for (const ref of group[book].secondary){
                    //mylog(`found secondary ref group (id: ${group.id}) for ${book}: ${ref}`)
                    if (refsArray.includes(ref.reference)){ //already fetching this ref. Double-dip!
                        groupIndices[book].secondary.push(refsArray.indexOf(ref.reference));
                    }
                    else{
                        refsArray.push(ref.reference);
                        groupIndices[book].secondary.push(refIndex);
                        refIndex++; 
                    }
                
                }
            }

        }

        groupsIndices.push(groupIndices)
    }
    mylog('getPericopeRefs finishing. groupsIndices=');
    mylog(groupsIndices)
    return {groupsIndices,refsArray}
}

/**
 * 
 * @param {GospelPericopeGroup} group 

 */


/**
 * 
 * @param {string[]} refs
 * @returns {{book:string,chapter:number|null,verses:number[]}[]}
 */




export class TfServer{
    static abbrev='Dummy Server!';

    ready = false;
    name = "TF Empty DB";
    longname='';
    shortname='';
    abbrev='';
    param='nt';
    showNotes = false;

    /**
     * @type {Object<string,{id:number,count:number, beta:string}>} 
     */
    lexemes = {};
    totalWords=0;
    numLexemes=0;
    chaps={};


   
    /**
     * @type {Object<number,{name:string,abbrev:string, syn:string[],words:number,chapters:number,lemmas:number}>}
     */
    booksDict = {};
    dbURI="/nt";
    server=env.tfserverurl;
    

    

    getURL(){
        return this.server+this.dbURI;
    }

    getApiUri(){
        return env.testing ? this.getURL() : env.apiURI+this.dbURI;
    }
   
    /**
     * 
     * @param {string} url 
     * @returns {Promise.<Object>} -- JS object from http JSON response
     */
    async jsonFetch(url){
        const resp = await fetch(url);
        return resp.json();
    }
    
/**
 * 
 * @param {string[]} refs 
 * @returns 
 */
    getBCVarrayFromRefs(refs){
    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvArray
     */
        const bcvArray = [];
        for (const [i,ref] of refs.entries()){
            const bookCv=BibleUtils.getBookChapVerseFromRef(ref);
            bookCv.chap = bookCv.chap ? bookCv.chap.replaceAll(/[a-zA-Z]/g,'') : ''
            bookCv.v = bookCv.v ? bookCv.v.replaceAll(/[a-zA-Z]/g,'') : ''
            if (!bookCv.book) {
                //mylog(`getBCVarrayFromRefs('${refs.join(';')}'): Got no book name for row ${i} chap: ${bookCv.chap} and ${bookCv.v}`, true);
            }
            const bookName = this.getBookNameBySyn(bookCv.book);
            //mylog('fetchGroupText got bookname ' + bookName + " for: " + bookCv.book);

            /**
             * @type {number[]} verseArray
             */
            let verseArray = [];
            if(bookCv.v){//create array of verses:
                    verseArray = MathUtils.createNumArrayFromStringListRange(bookCv.v); 
            }
            bcvArray.push({book: bookName, chapter: bookCv.chap ? Number(bookCv.chap) : null, verses: verseArray});
        }
        return bcvArray;
    }

    /**
     * 
     * @param {string} url 
     * @param {Object} data 
     * @returns {Promise.<Object>}
     */
    async jsonPOSTFetch(url,data){
        const jsonData = JSON.stringify(data);
        const response = await fetch(url, {method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
        mylog("jsonPOSTFetch("+url+", jsonData = '" + jsonData+"'");
		const jsonResp = await response.json();
        return jsonResp;
    }

     /**
     * 
     * @param {{book:string,chapter:number|null,verses:number[]}[]} bcvArray
     * @returns {Promise.<Object>} respone from fetch request, converted from the HTTP JSON response into a javascript object.
     */
    async getTexts(bcvArray,showVerses=true,lexemes=true,showNotes=this.showNotes) {
        //mylog("getTexts!...",true);
        const reqObject = {refs:bcvArray,options:{showVerses:showVerses, lexemes:lexemes,showNotes:showNotes}}

        //const bodyData = JSON.stringify(reqObject)
        const url = this.getApiUri() + "/texts";
		const response = await this.jsonPOSTFetch(url,reqObject)
        mylog("getTexts(fetchURL: '"+url+"') body data = " + JSON.stringify(reqObject));
       // mylog("response: ")
       // mylog(response)
        return response;
	} 
   
    /**
     * 
     * @param {number} id 
     * @returns 
     */
    getLexeme(id){
        return Object.entries(this.lexemes).find(([lemma,obj])=>obj.id==id);
    }
    async load() {
        if (!this.ready){
            mylog("bypassing checking for tf ...")
            
          //  await TfServer.jsonFetch(this.server+"/text/1");
            this.ready=true;            
        }
        else{
            mylog("already ready!")
        }
    }


    /**
     * 
     * @param lexID {number|string}
     * @returns {Promise<LexemeInfo>}
     */
    async fetchLexInfo(lexID) {
        const lemma=new LexemeInfo();
        const getLexUrl = this.getApiUri() + "/lex/";
        const url = getLexUrl + lexID.toString();
        //console.debug("Fetching " + url);
        const res = await fetch(url);
       // query.sent = true;
        mylog(`fetchLexInfo(${lexID})....`)
        const theJsonObj = await res.json();
        const foundLex = new LexemeInfo(theJsonObj.id,theJsonObj.lemma,theJsonObj.gloss,theJsonObj.total, theJsonObj.pos,theJsonObj.total,theJsonObj.beta)
        //lemma.copyFrom(foundLex);

        return foundLex;
    }


    /**
     * 
     * @param {number} node 
     * @returns 
     */
    async fetchText(node){
        const url = this.getApiUri()+"/text/"+node;
        mylog("fetchText("+url+")");
        const theResp = await this.jsonFetch(url);
        return theResp ? theResp : ''
    }

    async fetchVerseTextByRef(book,chap='1',v='1'){
        mylog("fetchVerseTextByRef("+[book,chap,v].join(',')+")");
        if (book && parseInt(chap) && parseInt(v)){
            v = v.replaceAll(/[a-zA-z]/g, '')
            chap = chap.replaceAll(/[a-zA-Z]/g, '')
            let url = this.getApiUri() + "/verse?book=";
            let bookname = this.getBookNameBySyn(book);
            if (!bookname){
                mylog("fetchVerseTextByRef Bookname not found for " + book);
                bookname = this.getBookName(this.getBookID(book));
            }
                
            url +=bookname +"&chapter="+chap+"&verse="+v;
            const resp = await this.jsonFetch(url);
            return resp && resp.text ? resp.text.trim() : '';
        }
        return ''
        
    }

    /**
     * 
     * @param {number} node 
     * @returns 
     */
    async fetchTextAlone(node){
        const resp = await this.fetchText(node);
        return resp && resp.text ? resp.text.trim() : '';
    }
    
    /**
     * 
     * @param {string} theRefRange - NT verse range, "Matt 1:3-4";
     */
    async getVerseNodesFromRefRange(theRefRange){
        const logPref = 'getVerseNodesFromRefRange('+theRefRange+'): ';
        const bookChapVObj= BibleUtils.getBookChapVerseFromRef(theRefRange);
        /**
         * @type {number[]} vv
         */
        const vv = [];
        if(bookChapVObj.v){
            if(bookChapVObj.v.includes('-')){
                vv.push(...BibleUtils.createNumArrayFromStringListRange(bookChapVObj.v));
            }
            else if(parseInt(bookChapVObj.v)){
                vv.push(parseInt(bookChapVObj.v));
            }

        }
        
        const nodes = [];

        for (const v of vv){
            const theNewNode = await this.tfGetNodeFromSection(this.getBookNameBySyn(bookChapVObj.book),
                            bookChapVObj.chap, v);
            if (theNewNode)
                nodes.push(theNewNode);

        }

        return nodes.sort();
    }

    /**
     * 
     * @param {string} book 
     * @param {string} chap 
     * @param {string} start 
     * @param {string} end 
     */
    async tfGetTextFromRange(book,chap,start,end,showVerses=true){
        const url = this.getApiUri() +  "/verses?book="+book.trim()+"&chapter="+chap.trim()
        +"&start="+start.trim()+"&end="+end+"&showVerses="+ (showVerses ? '1':'0');
       // mylog("tfGetNodeFromRange fetching: "+url)
        return await this.jsonFetch(url);
    }

    /**
     * 
     * @param {string} theRef - reference to NT book, chapter, or verse. Eg., "Matt", "Matt 1", or "Matt 1:3"
     */
    async getNodeFromRef(theRef){
        const logPref = 'getNodeFromRef('+theRef+'): ';
        const bookChapVObj= BibleUtils.getBookChapVerseFromRef(theRef);
        
        let bookName = '';
        let theNode = 0;
        
        if (bookChapVObj.book){
            bookName = this.getBookNameBySyn(bookChapVObj.book)
            
            
        }
        
        theNode = await this.tfGetNodeFromSection(bookName, bookChapVObj.chap, bookChapVObj.v);
      //  mylog(logPref + "searchString = '" + searchString +"'; node = " + theNode) ;
       // mylog(logPref+"bookChapVObj:");
        //mylog(bookChapVObj);
        //mylog(logPref + " bookName:'" + bookName+"'; bookID=" + bookID);
        return theNode;

    }
    
    //TODO: and test:
    /**
     * 
     * @param {string[]} refsArray an array of strings, each of which is a single biblical reference to look up (like "Matt 3:16")
     * @param {Object|null} options 
     * @returns the response object from getTexts()
     */
    async fetchPostTextsBatch(refsArray=[],options=null,secondary=false){
         /**
         * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvFetchArray
         */
        //mylog(`fetchpostTextsBath(["${refsArray.join('","')}"])`);
        const bcvFetchArray=this.getBCVarrayFromRefs(refsArray);
        
        return await this.getTexts(bcvFetchArray,true,true);
        //return texts;
    }

    async tfGetNodeFromSection(book,chap,v){
        if (typeof v === 'string'){
            v = v.replaceAll(/[a-zA-Z ]+/g, '').trim();
        }
        if (typeof chap === 'string'){
            chap = chap.trim();
        }
        
        let nodeid=0;
        let uri = "/node"
        if (book){
            uri += "?book="+book.trim();
            if (chap) {
                uri += "&chapter="+chap;
                if(v)
                    uri+= "&verse="+v;
            }
            const thenode = await this.jsonFetch(this.getApiUri()+uri);
            nodeid = Number(thenode) ? Number(thenode) : 0;
        }
        
        return nodeid;
    }


    
    /**
     * @param {number} lexID 
     * @returns {Promise<LexStats>} counts fetched and stats calculated for the lexeme
     * 
     */
    async fetchLexRefsCounts(lexID, calculate=true){//},theSections=null){//},lexObj=null) { //not doing this yet.
        
   
        /*if (lexObj){
            lemmaInfo.copyFrom(lexObj);
        }*/

        /**
         * 
         */
       // let theSections=[];

        const url = this.getApiUri() + "/getrefs/" + lexID;

        
       // console.debug("Fetching " + url);
        const theJsonObj = await this.jsonFetch(url);
        const lexStats=new LexStats(0,this.totalWords);
        if (theJsonObj){
            if (theJsonObj.total){
                lexStats.count=theJsonObj.total;
                lexStats.calculateFrequencies(true);
            }
            
            if (theJsonObj.bookcounts){
                Object.entries(theJsonObj.bookcounts).forEach(([bookId,theBookCount])=>{
                    const theBookId=parseInt(bookId)
                    lexStats.addAndCalcBookStatsIfNeeded(theBookId,theBookCount,this.booksDict[theBookId].words,theJsonObj.total,this.totalWords);
                })
            }
    
            //try to make convert book names into their abbreviations
           /* const themap=theJsonObj.bookcounts ? 
                    Object.entries(theJsonObj.bookcounts).map(([b,count])=>[book,{count: v,}])
                        //.map(([k,v])=>this.booksDict[k] && this.booksDict[k].abbrev ? [this.booksDict[k].abbrev, (typeof v == 'number' ? v : parseInt(v))] : null).filter((o)=>o) 
                        :
                        null;
            const bookcounts = themap ? Object.fromEntries(themap) : null;
            
            if (bookcounts && Object.keys(bookcounts).length){
                lexStats.bookCounts=bookcounts;

            }*/

            
            const refs = theJsonObj.refs;
            if (refs && refs.length){
                //mylog(`got refs(${lexID}):['${JSON.stringify(refs)}']`, true);
                lexStats.references=refs.map((r)=>{
                    let ret = r;
                    const bcv = BibleUtils.getBookChapVerseFromRef(r);
                    
                    const book=bcv && bcv.book ? this.getBookAbbrev(bcv.book) : '';
                    if (book){
                        r = book + ( bcv.chap ? (" " + bcv.chap) : '') + (bcv.v? ":" + bcv.v : '');
                    }

                    if (r && r!=book){
                        ret = r;
                    }
                    return ret;
                
                });
            }else{
            // mylog(`got not refs for id ${lexID}`,true)
            }
        }
        //lexStats.calculateFrequencies(calculate);
        
        return lexStats;
    
    }


    /**
     * 
     * @param {string} refString -- a NT book name of some sort
     * @returns {number|null} - the TF node id of the book, if a matching one is found! 0 otherwise.
     */
    getBookID(refString) {
        refString = refString.replaceAll(/\s+/g,' ').trim() 
        
        const found = Object.keys(this.booksDict).find((k)=>(this.booksDict[k].name.toLowerCase() == refString.toLowerCase()) || 
        this.booksDict[k].syn.map((s)=>s.toLowerCase().replaceAll("_", " ")).includes(refString.toLowerCase().replaceAll("_"," ")));
        
        return parseInt(found) ? parseInt(found) : 0
    }

    /**
     * 
     * @param {string} refString  -- a NT book name
     * @returns {string} the abbreviation of the book we're using, standardize searches and grouping, etc. If none, returns empty string.
     */
    getBookAbbrev(refString){
        const bookID = this.getBookID(refString);
        if(bookID)
            return this.booksDict[bookID].abbrev;
        else
            return '';
    }

    getBookAbbrevById(id){
        return this.booksDict[id]?.abbrev ? this.booksDict[id]?.abbrev  : this.getBookName(id);
    }

    getBookSyn(id){
        return this.booksDict[id]?.syn[0] ? this.booksDict[id]?.syn[0] : this.getBookName(id);
    }

    /**
     * 
     * @param {string} syn 
     * @returns 
     */
    getBookNameBySyn(syn){
        
        const id = syn ? this.getBookID(syn) : 0
        if (!id){
            mylog("got not book name synonymn!")
        }
        const name =  id ? this.getBookName(id) : ''
        mylog("getBookNameBySyn("+syn+")->id:"+id+", name:" +name)
        return name;
    }

        
    /**
     * 
     * @param {number} node 
     * @returns {string}
     */
    getBookName(node){
        if (!this.booksDict[String(node)]){
        //   mylog("did not find " + node + " in this.booksDict");
        }
        const name =  this.booksDict[node] ? this.booksDict[node].name : ''
        //mylog("getBookName("+node+")-->'" + name+"'");
        return name;
    }

    getNoteFooter(){
        return "";
    }
    
}

export default {getTextRefsArray,getGospelGroupRefsArrays,getGroupsArray,getParallelRefsArrays,populateTextGroup,populateGroupsText,TfServer,getParallelGroupsRefsArrays}