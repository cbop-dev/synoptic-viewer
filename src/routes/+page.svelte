<script>
	import NtSynopsisPanel from "$lib/components/content/NtSynopsisPanel.svelte";
    import Footer from "$lib/components/content/Footer.svelte";
    import { onMount } from "svelte";
    import ParallelGospelSection from "$lib/components/content/ParallelGospelSection.svelte";
    import SynopsisHome from "$lib/components/content/SynopsisHome.svelte";
    import { SynopsisUrlParamsMap} from "$lib/components/content/SynopsisClasses.svelte";
    import { URLParam } from "$lib/components/content/urlParams";
    import { SynopsisOptions3 } from "$lib/components/content/SynopsisClasses.svelte";
    import '../app.css';
    import { mylog } from "$lib/env/env";
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
  let options = $state(data.options ? data.options : new SynopsisOptions3());//$state(new SynopsisOptions2());

   if (!options) {
//    mylog("Got no options!")
   }
   else{
    //mylog("page.svelte got options! E.g., highlight on click:"+options.viewOptions.highlightOnClick)
   }
   
    

   onMount(()=> {
    window.history.pushState({}, document.title, "/");
   })
</script>
<SynopsisHome options={options}/>

<!--<ParallelGospelSection/>-->
<!--<NtSynopsisPanel/>-->
<hr class="p0 mt-3"/>
<div class="italic text-sm text-center">
<Footer/>
</div>
