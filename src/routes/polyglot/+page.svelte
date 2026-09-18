<script>
	import NtSynopsisPanel from "$lib/components/content/NtSynopsisPanel.svelte";
    import { onMount } from "svelte";
    import ParallelGospelSection from "$lib/components/content/ParallelGospelSection.svelte";
    import SynopsisHome from "$lib/components/content/SynopsisHome.svelte";
    //import { SynopsisOptions3.SynopsisUrlParamsMap} from "$lib/components/content/SynopsisClasses.svelte";
    import { URLParam } from "$lib/components/content/urlParams";
    import { SynopsisOptions3 } from "$lib/components/content/SynopsisClasses.svelte";
    //import '../../app.css';
	import { TfServer } from '$lib/components/content/TfUtils.js';
    import {getServer} from '$lib/tf/tfServer.js'
    import { mylog } from "$lib/env/env.js";
	import PolyglotViewer from "$lib/components/content/PolyglotViewer.svelte";

    const myURI='/polyglot/';
    function onkeydown(event){
        if(event.key=='p'){
            
        }
    }
  
  /**
   * @typedef {Object} Props
   * @property {any} data - export let request;
   */
  let { data } = $props();
  

  /**
   * @type {SynopsisOptions3}
   */
  let options = $state(data.options ? data.options : new SynopsisOptions3());

   if (!options) {
//    mylog("Got no options!")
   }
   else{
    //mylog("page.svelte got options! E.g., highlight on click:"+options.viewOptions.highlightOnClick)
   }
   
   /**
    * @type {TfServer} myServer
   */
   const myServer=$derived(getServer(options.request.bible));

   onMount(()=> {
    window.history.pushState({}, document.title, myURI);
   })
</script>
<div id="page-top-div" class="anchor"></div>

<PolyglotViewer options={options} tfServer={myServer}/>


<!--<ParallelGospelSection/>-->
<!--<NtSynopsisPanel/>-->
<div id="page-bottom-div" class=" anchor"></div>

