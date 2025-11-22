<script>
    /**
     * @type {{title:string,
     * message:string[]}}
     */
    let {
        title="Loading...",
        message=["וְקֹויֵ יְהוָה יַחֲלִיפוּ כֹחַ",
                "οἱ δὲ ὑπομένοντες τὸν θεὸν ἀλλάξουσιν ἰσχύν",
                "Those who wait for the Lord will renew their strength",
                "Isa 40:31"]
    } =$props();
</script>
<h3>{title}</h3>
        <div class="flex-wrap">
        {#each message as line}   
            <div class="flex-3 text-center greek text-lg">{line}</div>
        {/each}
        </div>
    <span class="loading loading-spinner loading-xl"></span>  