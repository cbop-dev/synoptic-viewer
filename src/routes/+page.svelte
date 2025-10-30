<script>
	import NtSynopsisPanel from "$lib/components/content/NtSynopsisPanel.svelte";
    import { onMount } from "svelte";
    import ParallelTextSection from "$lib/components/content/ParallelTextSection.svelte";
    import SynopsisHome from "$lib/components/content/SynopsisHome.svelte";
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
  let request = $state();
   if (data.request) {
         //mylog("got request! Does it have chapters?" + data.request.chapters ? "yes!" + data.request.chapters.join(',') : "no! :-(");
        request = data.request;
   }
    

   onMount(()=> {
    window.history.pushState({}, document.title, "/");
   })
</script>
<SynopsisHome request={request}/>
<!--<ParallelTextSection/>-->
<!--<NtSynopsisPanel/>-->
