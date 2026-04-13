import { writable, get } from 'svelte/store';

const forceTesting = false ; // || true;
export const testing = forceTesting  || ((typeof process !== 'undefined') && process.env && process.env.TEST) || (import.meta.env.MODE =='test') ? true: false
const useLocalTF= true;// && false;
import { browser } from '$app/environment';
import { page } from '$app/state';
import {PUBLIC_TF_URL} from '$env/static/public';
let env ={
    
    //PUBLIC_TF_URL:"http://localhost:5000"
}


let env2={}
//let TF_SERVER_URL="";
const serverUrl=PUBLIC_TF_URL;

//browser ? page.url.protocol+ "://" + page.url.host + (page.url.port ? ":" + page.url.port : "") : "http://localhost:5000";
if (!browser || testing){
   // env = await import('$env/static/public');
    //env=await import("$env/dynamic/private");
    //env2= await import('$env/static/private');
    
}
else {

}
//TF_SERVER_URL=env2?.TF_SERVER_URL || env?.TF_SERVER_URL;



//what is this for???!?!??!?!?
export const tfserverurl = env?.PUBLIC_TF_URL || serverUrl ||'http://localhost:5000'; //page.url.protocol+"://"+page.url.host + (page.url.port ? ":"+page.url.port : ""); //http://localhost:5000";//add alternate tf-fast server


export const useSbl=true;


//export const apiURI= testing && tfserverurl ? '' : '/api/tf';
export const apiURI='/api/tf';



/**
 * @type {Writable<boolean>} debug
 */
export const debug = false;


//debug.set(true);

//debug = true;

export const levels = {
    RIDICULOUS: -100,
    DEBUG: 0,
    INFO: 1,
    LOG: 2,
    WARNING: 3,
    ERROR: 4,
    NONE: 100,
    SILENCE: 100000
};

let defaultLevel = 0; 
//defaultLevel=levels.SILENCE;
/*debugLevel.subscribe((v)=>{
    defaultLevel = v;
})*/
//$: defaultLevel = debugLevel.value;
//debugLevel.set(levels.DEBUG);




/**
 * @type {{levels:Object,debug:boolean,debugLevel:number,log:function(string,boolean,number):void}} myLog
 */
export const myLog={
    levels:levels,
    debug:debug,
    debugLevel:defaultLevel,
    /**
     * 
     * @param {string} msg 
     * @param {boolean} debugOn 
     * @param {number} thelevel 
     */
    log(msg,debugOn=myLog.debug, thelevel=myLog.levels.INFO){
       // console.log(`myLog.log(${msg},${debugOn},${thelevel})`);
        if (debugOn && thelevel >= defaultLevel ) {
        //   mylog("mylog level at " + defaultLevel)
            console.log(msg);
        }
    }

    
}
export function mylog(msg, debugOn=debug,thelevel=levels.INFO) {
    //mylog("mylog with debug val = " + get(debug))
    if (debugOn && thelevel >= defaultLevel ) {
     //   mylog("mylog level at " + defaultLevel)
        console.log(msg);
    }
}

/**
 * @param {number} level // change default log level to 'level': must be one of values in 'levels' object.
 * @returns {boolean} // true if successfully set level; false if not.
 */
export function setLogLevel(level) {
    let success = false;
    if (Object.values(levels).includes(level)) {
       // debugLevel.set(level);
        success = true;
    }
    return success;
           
}

export let repackageLemmas = false;
//repackageLemmas = true;


export let log = {
    debug: debug,
    defaultLevel: defaultLevel,
    levels: levels,
    mylog: mylog,
    setLogLevel: setLogLevel,
}

/**
export default {
    debug: debug,
    mylog: mylog,
    repackageLemmas: repackageLemmas
}
    */

if(testing){
    mylog("TESTING mode enabled!")
}
else{
    mylog("NOT Testing.")
}

//mylog(`tfserverurl=${tfserverurl}; apiURI=${apiURI}`,true);