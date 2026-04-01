<script>
    /**
     * @type {{title:string,
     * loadingBackground:string,
     * minHeight:string,
     * height:string,
     * width:string,
     * bgStyle:string,
     * message:string[]}}
     */
    let {
        title="Loading...",
        loadingBackground='',
        width='',
        bgStyle='',
        height='400px',
        minHeight='200px',
        message=["וְקֹויֵ יְהוָה יַחֲלִיפוּ כֹחַ",
                "οἱ δὲ ὑπομένοντες τὸν θεὸν ἀλλάξουσιν ἰσχύν",
                "Those who wait for the Lord will renew their strength",
                "Isa 40:31"]
    } =$props();
</script>
<div style="{
(loadingBackground ? 'background-size:cover; background-repeat: no-repeat; background-position: center; background-image: url(' + loadingBackground + ');' : '')
+ (width ? 'width: ' + width  : '') + ";" 
+ (height? 'height: ' + height : '') + ";" 
+ (minHeight? 'min-height: ' + minHeight : '') + ";" 
+ (!height && minHeight ? 'height: ' + minHeight:'') + ";"
+ bgStyle
}"
class="w-full h-full block text-center self-center">

<h2 class=" inline-block text-xl self-center rounded pl-1 pr-1 mt-10">{title}</h2>
    
        <div class="flex-wrap mt-3" >
        {#each message as line}   
            <div  class="message flex-3 text-center greek text-lg  inline-block rounded pl-1 pr-1 m-1 ">{line}</div><br/>
        {/each}
        </div>
    <span class="loading loading-spinner loading-xl bg-white/90"></span>  

</div>
<style>
    .message, h2 {
        background-color: color-mix(var(--bg-content) 60%, transparent);
    }
</style>