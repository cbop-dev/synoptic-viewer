<script>
    import { mylog, debug } from "$lib/env/env";
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [buttonStyle]
   * @property {string} [textSize]
   * @property {string} [tooltip]
   * @property {boolean} [selected]
   * @property {boolean} [disable]
   * @property  [children]
   */

  /** @type {Props} */
  let {
    buttonText = "",
    buttonStyle = "bg-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ",
    textSize = "base",
    tooltip='',
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
        mylog("selected = 'true'");
        
        

      }
      
    }

  </script>
  
  <style>
    @reference "tailwindcss";
    .base {
      @apply text-white font-bold py-2 px-4 rounded cursor-pointer;
      
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
  
  <option  data-tip={tooltip} onclick={()=>{if(!disable){toggle()}}} bind:this={theButton} 
  class=" {tooltip ? 'tooltip' : ''} btn btn-outline btn-primary {selectStyle()} m-1 {disable ? 'btn-disabled' : ''}">
    {buttonText}
    {#if children}
		{@render children?.()}
		<hr />
		{/if}
  </option>