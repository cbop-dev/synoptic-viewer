<script>
	import NtSynopsisPanel from "$lib/components/content/NtSynopsisPanel.svelte";
    import ParallelGospelSection from "$lib/components/content/ParallelGospelSection.svelte";
    import '../../app.css';

    function onkeydown(event){
        if(event.key=='p'){
            
        }
    }
    
</script>

<!--<ParallelGospelSection/>-->
<NtSynopsisPanel allowEverything={true}/>
