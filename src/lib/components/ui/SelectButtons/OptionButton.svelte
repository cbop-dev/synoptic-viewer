<script>
 
	import { mylog } from "$lib/env/env.js";
  import {onMount} from "svelte";
  
  
    //if (!ready) 
    

  let theButton = $state();
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [oldbuttonStyle]
   * @property {string} [buttonStyle]
   * @property {string} [textSize]
   * @property {string} [tooltip]
   * @property {string} [miscStyle]
   * @property {string} [buttonSize]
   * @property {any} selected
   * @property {boolean} [ready] - ready = false;
   * @property {function} [onclick]
   * @property {boolean} [disableToggle=false]
   */

  /** @type {Props} */
  let {
    buttonText = "Reusable Button",
    oldbuttonStyle = "bg-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 m-10",
    buttonStyle = "btn btn-outline btn-primary",
    textSize = "base",
    tooltip='',
    miscStyle='',
    selected = $bindable(false),
    buttonSize="m-0 ml-1 mb-1",
    ready = true,
    disableToggle = false,
    onclick = ()=>{}
  } = $props();

  let selectedStyle = $derived(selected ? "btn-neutral btn-active": "btn-primary btn-outline");

  export function deselect() {
      selected = false;
      mylog('selected = false');
      /*theButton.classList.replace("btn-neutral", "btn-primary");
      theButton.classList.replace("btn-active", "btn-outline");*/
      
  }
  export function select() {
      selected = true;
      mylog("selected = 'true'");
      /*
      theButton.classList.replace( "btn-primary", "btn-neutral");
      theButton.classList.replace("btn-outline", "btn-active"); */

  }



  export function toggle() {
    
    mylog("option button ("+buttonText +") toggle. Select: " + selected)
    if (!disableToggle) { 
      if (selected) {
          deselect();
          //if (selected) mylog("failed to deselect!");
      }
      else {
        select();
        //mylog("selected! but is it? " + selected);

      }
    }
    onclick();
    //mylog("now selected: " + selected);
    
  }
  onMount(()=>{
    if (selected) select();
  })
  
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
  
  <button  onclick={toggle} disabled={!ready} bind:this={theButton} 
  class="{tooltip ? 'tooltip' : ''} btn btn-outline btn-primary {buttonStyle} {buttonSize} {miscStyle} {selectedStyle}"
  data-tip={tooltip} >
  {buttonText}
  </button>
  