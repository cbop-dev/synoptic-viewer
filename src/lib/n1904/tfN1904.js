
//import { mylog } from '../env/env';
import { mylog,apiURI } from '$lib/env/env.js';
import ntlexemes from './n1904-lexemes.json';
import ntChaps from './tfN1904chaps.json';
import { tfNtBooksDict } from './ntbooks.js';
import * as bibleUtils from './bibleRefUtils.js';
import TfUtils from '$lib/components/content/TfUtils';

export const lexemes = ntlexemes;

export class TfServer{
    ready = false;
    NT = null;
    server=apiURI;
   
    /**
     * 
     * @param {string} url 
     * @returns {Promise.<Object>} -- JS object from http JSON response
     */
    static async jsonFetch(url){
        const resp = await fetch(url);
        return resp.json();
    }
    
    static async jsonPOSTFetch(url,data){
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
        mylog("getTexts!...");
        const reqObject = {refs:bcvArray,options:{showVerses:showVerses, lexemes:lexemes}}

        //const bodyData = JSON.stringify(reqObject)
		const response = await TfServer.jsonPOSTFetch(apiURI+"/texts",reqObject)
        mylog("getTexts(fetchURL: '"+apiURI+"') body data = " + reqObject, true);
        return response;
	} 
   
    static getLexeme(id){
        return Object.entries(lexemes).find(([lemma,obj])=>obj.id==id);
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
    constructor(){
       this.load();
    }

    setServer(url){
        this.server=url;
    }

    async fetchText(node){
        const theResp = await TfServer.jsonFetch(this.server+"/text/"+node);
        return theResp ? theResp : ''
    }

    async fetchVerseTextByRef(book,chap='1',v='1'){
        mylog("fetchVerseTextByRef("+[book,chap,v].join(',')+")");
        if (book && parseInt(chap) && parseInt(v)){
            v = v.replaceAll(/[a-zA-z]/g, '')
            chap = chap.replaceAll(/[a-zA-Z]/g, '')
            let url = tfServer.server + "/verse?book=";
            let bookname = TfServer.getBookNameBySyn(book);
            if (!bookname){
                mylog("fetchVerseTextByRef Bookname not found for " + book);
                bookname = TfServer.getBookName(TfServer.getBookID(book));
            }
                
            url +=bookname +"&chapter="+chap+"&verse="+v;
            const resp = await TfServer.jsonFetch(url);
            return resp && resp.text ? resp.text.trim() : '';
        }
        return ''
        
    }
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
        const bookChapVObj= bibleUtils.getBookChapVerseFromRef(theRefRange);
        /**
         * @type {number[]} vv
         */
        const vv = [];
        if(bookChapVObj.v){
            if(bookChapVObj.v.includes('-')){
                vv.push(...bibleUtils.createNumArrayFromStringListRange(bookChapVObj.v));
            }
            else if(parseInt(bookChapVObj.v)){
                vv.push(parseInt(bookChapVObj.v));
            }

        }
        
        const nodes = [];

        for (const v of vv){
            const theNewNode = await this.tfGetNodeFromSection(TfServer.getBookNameBySyn(bookChapVObj.book),bookChapVObj.chap, v);
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
        const url = this.server + "/verses?book="+book.trim()+"&chapter="+chap.trim()
        +"&start="+start.trim()+"&end="+end+"&showVerses="+ (showVerses ? '1':'0');
       // mylog("tfGetNodeFromRange fetching: "+url)
        return await TfServer.jsonFetch(url);
    }

    /**
     * 
     * @param {string} theRef - reference to NT book, chapter, or verse. Eg., "Matt", "Matt 1", or "Matt 1:3"
     */
    async getNodeFromRef(theRef){
        const logPref = 'getNodeFromRef('+theRef+'): ';
        const bookChapVObj= bibleUtils.getBookChapVerseFromRef(theRef);
        
        let bookName = '';
        let theNode = 0;
        
        if (bookChapVObj.book){
            bookName = TfServer.getBookNameBySyn(bookChapVObj.book)
            
            
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
            nodeid = await TfServer.jsonFetch(this.server+uri);
        }
        
        return nodeid;
    }



    /**
     * 
     * @param {string} refString -- a NT book name of some sort
     * @returns {number|null} - the TF node id of the book, if a matching one is found! 0 otherwise.
     */
    static getBookID(refString) {
    refString = refString.replaceAll(/\s+/g,' ').trim();
    
    const found = Object.keys(tfNtBooksDict).find((k)=>(tfNtBooksDict[k].name.toLowerCase() == refString.toLowerCase()) || tfNtBooksDict[k].syn.map((s)=>s.toLowerCase().replaceAll("_", " ")).includes(refString.toLowerCase().replaceAll("_"," ")));
    if (found)
        return parseInt(found);
    else 
        return 0;
}

    /**
     * 
     * @param {string} refString  -- a NT book name
     * @returns {string} the abbreviation of the book we're using, standardize searches and grouping, etc. If none, returns empty string.
     */
    static getBookAbbrev(refString){
        const bookID = TfServer.getBookID(refString);
        if(bookID)
            return tfNtBooksDict[bookID].abbrev;
        else
            return '';
    }




    static getBookNameBySyn(syn){
    
        const id = TfServer.getBookID(syn)
        const name = TfServer.getBookName(id);
        mylog("getBookNameBySyn("+syn+")->id:"+id+", name:" +name)
        return name;
    }

        
    /**
     * 
     * @param {number} node 
     * @returns {string}
     */
        static getBookName(node){
        //mylog("=========================================================");
        //mylog("HERE WE ARE!!========")
    // mylog("=========================================================");
        if (!tfNtBooksDict[String(node)]){
        //   mylog("did not find " + node + " in tfNtBooksDict");
        }
        const name =  tfNtBooksDict[node] ? tfNtBooksDict[node].name : ''
        //mylog("getBookName("+node+")-->'" + name+"'");
        return name;
    }


}
//const NT = use("CenterBLC/SBLGNT", version="2022")

//python.exit() 

const tfServer = new TfServer();

mylog("in tf.js...")
export {tfServer}