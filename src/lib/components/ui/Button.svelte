<script>
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [buttonStyle]
   * @property {any} [style]
   * @property {string} [textSize]
   * @property {boolean} [ready]
   * @property {string} [tooltip]
   * @property {string} [buttonColors]
   * @property {function} [onclick]
   */

  /** @type {Props} */
  let {
    buttonText = "Reusable Button",
    buttonStyle = "btn bg-black base hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 ",
    style='',
    textSize = "normalSize",
    ready = true,
    buttonColors='',
    tooltip='',
    onclick=()=>{}
  } = $props();
  </script>
  
  <style>
    @reference "tailwindcss";
    .base {
      @apply text-white font-bold py-2 px-4 rounded cursor-pointer;
      
    }
  
    .sm {
      @apply text-sm;
    }
  
    .normalSize {
      @apply text-base;
    }
  
    .lg {
      @apply text-lg;
    }
  </style>
  
  <button  data-tip={tooltip} disabled={!ready} {onclick} 
  class="{tooltip ? 'tooltip' : ''} {textSize} {buttonStyle} {buttonColors} rounded-xl shadow-xl {style}">
    {buttonText}
  </button>