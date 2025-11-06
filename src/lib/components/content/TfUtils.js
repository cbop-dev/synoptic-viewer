import ParTexts from "./parallelTexts.svelte.js";
import {ParallelText, ParallelTextGroup, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices} from "./parallelTexts.svelte.js";
import * as env from '$lib/env/env.js'
import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
import { mylog } from "$lib/env/env";
import * as BibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as MathUtils from '$lib/utils/math-utils.js';



/**
 * 
 * @param {string} bookAbbrev
 * @param {string} ref
 * @returns {{reference: string, text: string}[]}
 */
export function getTextRefsArray(bookAbbrev, ref){
    let textRefArray = [];
        for (const r of ref.split(";")){
           
            const [c,vv] = r.split(":");
            
            if(c && vv) {
                if (vv.includes(',')){ //got indivdual verses/ranges
                    
                    
                    for (const v of vv.split(',')){
                        const textRef = new ParTexts.TextAndRef();
                        let theRef = bookAbbrev? bookAbbrev + " " : " ";
                        theRef += c+":";
                        theRef += v;
                        textRef.reference=theRef;
                        textRefArray.push(textRef);
                    }

                }   
                else{
                    const theRef =  bookAbbrev? bookAbbrev + " " + r : r;
                    const textRef = new ParTexts.TextAndRef();
                    textRef.reference=theRef;
                    textRefArray.push(textRef);
                }
            }
            else{
                theRef =  bookAbbrev? bookAbbrev + " " + ref : ref;
                const textRef = new ParTexts.TextAndRef();
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
export function getGroupsArray(pericopeNums){
    return pericopeNums.map((pericope)=>{
        const row = gospelParallels.alandSynopsis.lookupPericope(pericope);
        const perGroup = new GospelPericopeGroup();
        perGroup.id = row.pericope;
        perGroup.title = row.pericope + ": " + row.title;
        if (row.Matt.ref)
            perGroup.matt.textRefs.push(...getTextRefsArray("Matt", row.Matt.ref));
        if (row.Mark.ref)
            perGroup.mark.textRefs.push(...getTextRefsArray("Mark", row.Mark.ref));
        if (row.Luke.ref)
            perGroup.luke.textRefs.push(...getTextRefsArray("Luke", row.Luke.ref));
        if (row.John.ref)
            perGroup.john.textRefs.push(...getTextRefsArray("John", row.John.ref));
        if (row.other.ref)
            perGroup.other.textRefs.push(...getTextRefsArray("", row.other.ref));
            
        return perGroup;

    });
}


//TODO: finish this! still in progess, broken!!!
/**
 * 
 *  @param {ParallelText[]} parallelTexts 
 *  @return {{parallelIndices: number[][], refsArray: string[]}} 
 *  @description returns two arrays: parallelIndices, a 2-dimensional array of numbers, each of which is an index into refsArray. 
 */
export function getParallelRefsArrays(parallelTexts){
     //let refIndex = 0;
    /**
     * @type {number[][]} groupsIndices
     */
    const parallelIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];

    
    for (let [index, parText] of parallelTexts.entries()){
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
 * @param {ParallelTextGroup} parallelTextGroup 
 * @param {Object} response
 * @param {{parallelIndices: number[][], refsArray: string[]}} parRefsObj 
 * @param {boolean} [words=true] 
 */
export function populateTexts(parallelTextGroup, response, parRefsObj, words=true){


    for (const [index,par] of parallelTextGroup.parallelTexts.entries()){
        //mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index);
    
        for (const [i,textRef] of par.textRefs.entries()){
            // mylog("checking ref: " + textRef.reference);
            const queryIndex= parRefsObj.parallelIndices[index][i];
            if (response && response.texts && response.texts[queryIndex]){
                textRef.text= response.texts[queryIndex].text;
                if (words){
                    
                    textRef.words=response.texts[queryIndex].words;
                }
                // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
            }
            
        }
        
        parallelTextGroup.markUniqueAndIdenticalWords();        
    }
    //mylog("DONE! Populated the ParTexts()! We have " + parallelTextGroup.parallelTexts.length + " par Texts.")
    //mylog("here's what we got: " 
      //  + parallelTextGroup.parallelTexts.map((p)=>p.textRefs.map((tr)=>tr.text).join(";"))
        //.join("|"));
    //mylog("^==================================^")

}


/**
 * 
 * @param  {GospelPericopeGroup[]} groupsArray
 * @returns {{groupsIndices: GospelPericopeGroupIndices[], refsArray: string[]}} 
 **/
export function getGroupRefsArrays(groupsArray){
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
                    groupIndices[book].push(refsArray.indexOf(ref.reference));
                }
                else{
                    refsArray.push(ref.reference);
                    groupIndices[book].push(refIndex);
                    refIndex++; 
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
    ready = false;
    name = "TF Empty DB";
    /**
     * @type {Object<string,Object>} booksDict
     */
    lexemes = {};
    
    chaps={};

    /**
     * @type {Object<string,Object>} booksDict
     */
    booksDict = {};
    dbURI="/nt";
    server=env.tfserverurl;

    

    getURL(){
        return this.server+this.dbURI
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
    

    getBCVarrayFromRefs(refs){
    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvArray
     */
        const bcvArray = [];
        for (const ref of refs){
            const bookCv=BibleUtils.getBookChapVerseFromRef(ref);
            bookCv.chap = bookCv.chap ? bookCv.chap.replaceAll(/[a-zA-Z]/g,'') : ''
            bookCv.v = bookCv.v ? bookCv.v.replaceAll(/[a-zA-Z]/g,'') : ''
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
     * @returns {Promise.<Object>}
     */
    async getTexts(bcvArray,showVerses=true,lexemes=true) {
        //mylog("getTexts!...",true);
        const reqObject = {refs:bcvArray,options:{showVerses:showVerses, lexemes:lexemes}}

        //const bodyData = JSON.stringify(reqObject)
        const url = this.getURL() + "/texts";
		const response = await this.jsonPOSTFetch(url,reqObject)
        mylog("getTexts(fetchURL: '"+url+"') body data = " + JSON.stringify(reqObject),true);
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
     * @param {number} node 
     * @returns 
     */
    async fetchText(node){
        const url = this.getURL()+"/text/"+node;
        mylog("fetchText("+url+")");
        const theResp = await this.jsonFetch(url);
        return theResp ? theResp : ''
    }

    async fetchVerseTextByRef(book,chap='1',v='1'){
        mylog("fetchVerseTextByRef("+[book,chap,v].join(',')+")");
        if (book && parseInt(chap) && parseInt(v)){
            v = v.replaceAll(/[a-zA-z]/g, '')
            chap = chap.replaceAll(/[a-zA-Z]/g, '')
            let url = this.getURL() + "/verse?book=";
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
        const url = this.getURL() +  "/verses?book="+book.trim()+"&chapter="+chap.trim()
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
    
    //TODO: implement and test:
    /**
     * 
     * @param {string[]} refs 
     * @param {Object|null} options 
     */
    async tfFetchPostTexts(refs=[],options=null){
        //TODO: this!
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
            const thenode = await this.jsonFetch(this.getURL()+uri);
            nodeid = Number(thenode) ? Number(thenode) : 0;
        }
        
        return nodeid;
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



    /**
     * 
     * @param {string} syn 
     * @returns 
     */
    getBookNameBySyn(syn){
    
        const id = this.getBookID(syn)
        const name = this.getBookName(id);
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


    
}

export default {getTextRefsArray,getGroupRefsArrays,getGroupsArray,getParallelRefsArrays,populateTexts,TfServer}