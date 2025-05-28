
//import { mylog } from '../env/env';
import { mylog,tfserverurl } from '$lib/env/env.js';
import gospelSynopsis from '@cbop-dev/aland-gospel-synopsis';
import ntChaps from './tfN1904chaps.json';




class TfServer{
    ready = false;
    NT = null;
    server=tfserverurl;
   
    /**
     * 
     * @param {string} url 
     * @returns {Promise.<Object>} -- JS object from http JSON response
     */
    static async jsonFetch(url){
        const resp = await fetch(url);
        return resp.json();
    }
   
    async load() {
        if (!this.ready){
            console.log("checking for tf ...")
           
            
            await TfServer.jsonFetch(this.server+"/text/1");
            this.ready=true;
            
        }
        else{
            console.log("already ready!")
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
        const bookChapVObj= gospelSynopsis.getBookChapVerseFromRef(theRefRange);
        /**
         * @type {number[]} vv
         */
        const vv = [];
        if(bookChapVObj.v){
            if(bookChapVObj.v.includes('-')){
                vv.push(...gospelSynopsis.createNumArrayFromStringListRange(bookChapVObj.v));
            }
            else if(parseInt(bookChapVObj.v)){
                vv.push(parseInt(bookChapVObj.v));
            }

        }
        
        const nodes = [];

        for (const v of vv){
            const theNewNode = await this.tfGetNodeFromSection(gospelSynopsis.getBookNameBySyn(bookChapVObj.book),bookChapVObj.chap, v);
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
    async tfGetTextFromRange(book,chap,start,end){
        const url = this.server + "/verses?book="+book.trim()+"&chapter="+chap.trim()+"&start="+start.trim()+"&end="+end
       // mylog("tfGetNodeFromRange fetching: "+url)
        return await TfServer.jsonFetch(url);
    }

    /**
     * 
     * @param {string} theRef - reference to NT book, chapter, or verse. Eg., "Matt", "Matt 1", or "Matt 1:3"
     */
    async getNodeFromRef(theRef){
        const logPref = 'getNodeFromRef('+theRef+'): ';
        const bookChapVObj= gospelSynopsis.getBookChapVerseFromRef(theRef);
        
        let bookName = '';
        let theNode = 0;
        //let searchString = '';
        //let bookID = 0;
        if (bookChapVObj.book){
            bookName = gospelSynopsis.getBookNameBySyn(bookChapVObj.book)
            //bookID = gospelSynopsis.getBookID(bookChapVObj.book);
            //bookName = gospelSynopsis.getBookName(bookID);
        //    searchString = bookName ? bookName : '';
            
        }
        
        theNode = await this.tfGetNodeFromSection(bookName, bookChapVObj.chap, bookChapVObj.v);
      //  mylog(logPref + "searchString = '" + searchString +"'; node = " + theNode) ;
       // mylog(logPref+"bookChapVObj:");
        //mylog(bookChapVObj);
        //mylog(logPref + " bookName:'" + bookName+"'; bookID=" + bookID);
        return theNode;

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

}
//const NT = use("CenterBLC/SBLGNT", version="2022")

//python.exit() 

const tfServer = new TfServer();

console.log("in tf.js...")
export {tfServer}