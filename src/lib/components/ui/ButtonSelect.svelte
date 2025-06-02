<script>
    import { mylog, debug } from "$lib/env/env";
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [buttonStyle]
   * @property {string} [textSize]
   * @property {boolean} [selected]
   */

  /** @type {Props} */
  let {
    buttonText = "Reusable Button",
    buttonStyle = "bg-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ",
    textSize = "base",
    selected = $bindable(false)
  } = $props();
    

    let theButton = $state();
    function toggle() {
      
      if (selected) {
        selected = false;
        
        theButton.classList.replace("btn-neutral", "btn-primary");
        theButton.classList.replace("btn-active", "btn-outline"); 
      }
      else {
        selected = true;
        mylog("selected = 'true'");
        theButton.classList.replace( "btn-primary", "btn-neutral");
        theButton.classList.replace("btn-outline", "btn-active"); 
        

      }
      
    }

  </script>
  
  <style>
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
  
  <option  onclick={toggle} bind:this={theButton} class="btn btn-outline btn-primary">
    {buttonText}
  </option>