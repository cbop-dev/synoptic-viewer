<script>
	import NtSynopsisPanel from "$lib/components/content/NtSynopsisPanel.svelte";
    import Footer from "$lib/components/content/Footer.svelte";
    import { onMount } from "svelte";
    import ParallelGospelSection from "$lib/components/content/ParallelGospelSection.svelte";
    import SynopsisHome from "$lib/components/content/SynopsisHome.svelte";
    import { SynopsisOptions } from "$lib/components/content/SynopsisClasses";
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
  
  let urlOptions = $state(new SynopsisOptions());

   if (data.options) {
         //mylog("got request! Does it have chapters?" + data.request.chapters ? "yes!" + data.request.chapters.join(',') : "no! :-(");
        urlOptions = SynopsisOptions.makeFrom(data.options);
        mylog("Got options:")
        mylog(urlOptions);
   }
   else{
    mylog("Got no options!")
   }
   
    

   onMount(()=> {
    window.history.pushState({}, document.title, "/");
   })
</script>
<SynopsisHome options={urlOptions}/>

<!--<ParallelGospelSection/>-->
<!--<NtSynopsisPanel/>-->
<Footer/>
