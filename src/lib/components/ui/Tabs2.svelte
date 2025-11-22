<script>

  /**
   * @type {{headings:string[],selectedTabIndex:number,classes:string[]}}
   */
  let {
    headings=['Tab 1','Tab 2', 'Tab 3'],
    selectedTabIndex=$bindable(0),
    classes=['']
  } =$props();

/**
 * 
 * @param {number} index
 */
function setTab(index){
  selectedTabIndex=index;
}

</script>

<div role="tablist" class="tabs tabs-box items-center self-center text-center {classes.join(' ')}">
  {#each headings as tab,index}
  <a role="tab" class={['tab', index == selectedTabIndex ? 'tab-active': '']} onclick={()=>setTab(index)}>{tab}</a>
  {/each}
  
</div>
