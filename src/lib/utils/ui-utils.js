import { mylog } from "$lib/env/env.js";

export const anchorClass = 'anchor';

export function findCurrentAnchorInfo(anchorClass='anchor') {
  const maxTop=30;
    const anchors = getAnchors(anchorClass);
    /**
     * @type {Element|null} curAnchor
     */
    let curAnchor = null;
    let curPosition  = Infinity;
    let curIndex=-1;

    anchors.forEach((anchor,index) => {
      const rect = anchor.getBoundingClientRect();
      if (  (!curAnchor) 
          ||(Math.abs(rect.top) < Math.abs(curPosition)))
      {
          curAnchor=anchor;
          curPosition=rect.top;
          curIndex=index;

      }
      
    });
    
    // Update the reactive variable with the ID or href of the top-most anchor
    return curAnchor ? {id: curAnchor.id, index: curIndex} : null;
  }

export function getCurrentAnchor(anchorClass='anchor'){
    const anchor=findCurrentAnchorInfo(anchorClass);
    return anchor?.id;
}

export function getTopAnchorIndex(anchorClass='anchor'){
    return findCurrentAnchorInfo(anchorClass)?.index;
}

export function getAnchors(anchorClass='anchor'){
    return Array.from(document.querySelectorAll('div[id].'+ anchorClass)).filter(el => {
        // Elements with display:none have 0 width/height and cause rect.top to be 0, breaking the calculations.
        // We filter out anything that has no dimensions and no offsetParent.
        const rect = el.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 || el.offsetParent !== null;
    });
}

export function findPrevAnchor(anchorClass='anchor'){
    const anchorInfo=findCurrentAnchorInfo(anchorClass);
    const anchors=getAnchors(anchorClass);
    let id=''
    if (anchorInfo && anchorInfo.index >0 && anchors.length > 0){
        id=anchors[anchorInfo.index-1].id ? anchors[anchorInfo.index-1].id : '';

    }
    return id;

}

export function findNextAnchor(anchorClass='anchor'){
    const anchorInfo=findCurrentAnchorInfo(anchorClass);
    const anchors=getAnchors(anchorClass);
    let id=''
    if (anchorInfo && anchorInfo.index < anchors.length-1){
        id=anchors[anchorInfo.index+1].id ? anchors[anchorInfo.index+1].id : '';

    }
    return id;

}
/* //working todo: finish!!
export function findTopMostAnchorInfo() {
    const anchors = document.querySelectorAll('div[id].'+ anchorClass);
    let topMost = null;
    let minTop = Infinity;

    anchors.forEach(anchor => {
      const rect = anchor.getBoundingClientRect();
      // Check if the anchor is in or above the viewport
      
        // Update topMost if this anchor is closer to the top
      if (rect.top >= 0 && rect.top < minTop) {
          topMost = anchor;
          minTop = rect.top;
        
      } 
      if (!topMost) {
            // Fallback to the closest anchor above the viewport
            topMost = anchor;
            minTop = rect.top
      }
      else if(minTop < 0 && rect.top >)
    
    });
    
    // Update the reactive variable with the ID or href of the top-most anchor
    return topMost ? {id: topMost.id, top: minTop} : null;
  }*/

  /*export function findTopMostAnchorId(){
    return findTopMostAnchorInfo()?.id;
  }*/

export function findLastAnchor(anchorClass='anchor'){
    const anchors = document.querySelectorAll('div[id].'+ anchorClass);
    const last= anchors[anchors.length-1].id ? anchors[anchors.length-1].id : '';
    
    return last;

  }


export function getDivAnchorIdsArray(anchorClass='anchor'){
    return Array.from(document.querySelectorAll('div[id].'+ anchorClass)).map((a)=>a.id);
}

export function copyToClipboard(text){
  navigator.clipboard.writeText(theText);
}
export 	function jumpToDiv(divId = '') {
		if (divId) {
            const el = document.getElementById(divId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
}

export function jumpToPrevSection(anchorClass='anchor'){
    const prevId=findPrevAnchor(anchorClass)
    if (prevId){
        jumpToDiv(prevId);
    }
}
export function jumpToTop(anchorClass='anchor'){
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function jumpToFirstSection(anchorClass='anchor'){
    const anchors = getAnchors(anchorClass);
    if (anchors && anchors.length) {
        anchors[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }     
}

export function jumpToLastSection(anchorClass='anchor'){
    const anchors = getAnchors(anchorClass);
    
    if (anchors && anchors.length) {
        anchors[anchors.length-1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }     
}

export function jumpToNextSection(anchorClass='anchor'){
    mylog("Jumping to next div."+anchorClass, true);
    const nextId=findNextAnchor(anchorClass)
    if (nextId){
        jumpToDiv(nextId);
        mylog(`jumpToNextSection->${nextId}`)
    }
}


  //export {findTopMostAnchor, findLastAnchor,getDivAnchorIdsArray}

