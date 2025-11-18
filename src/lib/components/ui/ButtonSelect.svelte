<script>
    import { mylog, debug } from "$lib/env/env";
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [buttonStyle]
   * @property {string} [textSize]
   * @property {string} [tooltip]
   * @property {boolean} [tooltipbottom]
   * @property {boolean} [selected]
   * @property {boolean} [disable]
   * @property  [children]
   */

  /** @type {Props} */
  let {
    buttonText = "",
    buttonStyle = " btn btn-outline btn-primary m-1 font-bold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ",
    textSize = "base",
    tooltip='',
    tooltipbottom=false,
    selected = $bindable(false),
    children=null,
    disable=false
  } = $props();
    

    let theButton = $state();
    function selectStyle(){
      if (selected)
        return " btn-secondary btn-active";
      else
        return " btn-primary btn-outline ";
    }
    function toggle() {
      
      if (selected) {
        selected = false;
        
       
      }
      else {
        selected = true;
       // mylog("selected = 'true'");
        
        

      }
      
    }

  </script>
  
  <style>
    @reference "tailwindcss";
    .base {
      @apply  py-2 px-4 rounded cursor-pointer;
      
    }
  
    .sm {
      @apply text-sm;
    }
  
    .base {
      @apply text-base;
    }
  
    .lg {
      @apply text-lg;
    }
  </style>
  
  <button  data-tip={tooltip} onclick={()=>{if(!disable){toggle()}}} bind:this={theButton} 
  class=" {tooltip ? 'tooltip' : ''}  {tooltipbottom ? 'tooltip-bottom' : ''} {selectStyle()} {disable ? 'btn-disabled' : ''} {buttonStyle}">
    {buttonText}
    {#if children}
		{@render children?.()}
		<hr />
		{/if}
  </button>