<script>
import { ColorUtils } from "$lib/utils/color-utils";
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
   * @property {boolean} [tooltipbottom=false]
   * @property {function} [onclick]
   * @property {{bg:string,font:string,border:string}} [bgFontObj]
   */

  /** @type {Props} */
  let {
    buttonText = "Reusable Button",
    buttonType="btn-neutral",
    buttonStyle = "btn base rounded  focus:outline-none focus:ring-4 m-1 p-1",
    style='',
    textSize = "normalSize",
    ready = true,
    buttonColors=' focus:ring-blue-300 hover:bg-blue-700 ',
    tooltip='',
    tooltipbottom=false,
    onclick=()=>{},
    bgFontObj={bg:'',font:'',border:''}
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

    button.customVars{
      background-color: var(--bgColor,default);
      color: var(--fontColor,default);

    }
  </style>
  
  <button  data-tip={tooltip} disabled={!ready} {onclick} 
  class="{tooltip ? 'tooltip' : ''} {textSize} {buttonStyle} {buttonType} shadow-xl {style} {bgFontObj.bg && bgFontObj.font ? 'customVars' : ''}"  {tooltipbottom}
  style={ColorUtils.bgFontString(bgFontObj.bg,bgFontObj.font)}
  >
    {buttonText} 
  </button>