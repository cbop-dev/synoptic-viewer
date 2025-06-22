<script>
  /**
   * @typedef {Object} Props
   * @property {string} [buttonText]
   * @property {string} [buttonStyle]
   * @property {string} [buttonType]
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
    buttonType="btn-neutral",
    buttonStyle = "btn base focus:outline-none focus:ring-4 m-1 p-1",
    style='',
    textSize = "normalSize",
    ready = true,
    buttonColors=' focus:ring-blue-300 hover:bg-blue-700 ',
    tooltip='',
    onclick=()=>{}
  } = $props();
  </script>
  
  <style>
    @reference "tailwindcss";
    .base {
      @apply  font-bold py-2 px-4 rounded cursor-pointer;
      
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
  class="{tooltip ? 'tooltip' : ''} {textSize} {buttonStyle} {buttonType} {buttonColors} rounded-xl shadow-xl {style}">
    {buttonText}
  </button>