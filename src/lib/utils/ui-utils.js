function findCurrentAnchorInfo() {
  const maxTop=30;
    const anchors = getAnchors();
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

export function getCurrentAnchor(){
    const anchor=findCurrentAnchorInfo();
    return anchor?.id;
}

export function getTopAnchorIndex(){
    return findCurrentAnchorInfo()?.index;
}

export function getAnchors(){
    return Array.from(document.querySelectorAll('div[id].anchor'));
}

export function findPrevAnchor(){
    const anchorInfo=findCurrentAnchorInfo();
    const anchors=getAnchors();
    let id=''
    if (anchorInfo && anchorInfo.index >0 && anchors.length > 0){
        id=anchors[anchorInfo.index+1].id ? anchors[anchorInfo.index-1].id : '';

    }
    return id;

}

export function findNextAnchor(){
    const anchorInfo=findCurrentAnchorInfo();
    const anchors=getAnchors();
    let id=''
    if (anchorInfo && anchorInfo.index < anchors.length-1){
        id=anchors[anchorInfo.index+1].id ? anchors[anchorInfo.index+1].id : '';

    }
    return id;

}
/* //working todo: finish!!
function findTopMostAnchorInfo() {
    const anchors = document.querySelectorAll('div[id].anchor');
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

  export function findTopMostAnchorId(){
    return findTopMostAnchorInfo()?.id;
  }

  function findLastAnchor(){
    const anchors = document.querySelectorAll('div[id].anchor');
    const last= anchors[anchors.length-1].id ? anchors[anchors.length-1].id : '';
    console.log("findLastAnchor last:" +last);
    return last;

  }


export function getDivAnchorIdsArray(){
    return Array.from(document.querySelectorAll('div[id].anchor')).map((a)=>a.id);
}

export function copyToClipboard(text){
  navigator.clipboard.writeText(theText);
}
  //export {findTopMostAnchor, findLastAnchor,getDivAnchorIdsArray}