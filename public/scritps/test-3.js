
isMobile = DetectDevice(); //return true if mobile, and return false if desktop
console.log(isMobile)

elmnt = document.getElementById("box");

dragElementMobile(elmnt);
dragElementPC(elmnt);

function constrictToElement(el1, el2){
    if(el1.offsetTop < 0){ el1.style.top = 0 + "px"; }
    if(el1.offsetTop > el2.offsetHeight - el1.offsetHeight){ el1.style.top = el2.offsetHeight - el1.offsetHeight + "px"; }

    if(el1.offsetLeft < 0){ el1.style.left = 0 + "px"; }
    if(el1.offsetLeft > el2.offsetWidth - el1.offsetWidth){ el1.style.left = el2.offsetWidth - el1.offsetWidth + "px"; }
}

function DetectDevice() {
    let isMobile = window.matchMedia || window.msMatchMedia;
    if (isMobile) {
      let match_mobile = isMobile("(pointer:coarse)");
      return match_mobile.matches;
    }
    return false;
}

function dragElementPC(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    
    constrictToElement(elmnt, elmnt.parentElement);

    //console.log(elmnt.offsetLeft, elmnt.offsetTop, elmnt.parentElement.offsetWidth, elmnt.parentElement.offsetHeight)
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function dragElementMobile(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    /* listen to the touchMove event,
    every time it fires, grab the location
    of touch and assign it to box */
    elmnt.addEventListener("touchstart", (e) => {
        e = e || window.event;
        e.preventDefault();
        var touchLocation = e.targetTouches[0];
        pos3 = touchLocation.pageX;
        pos4 = touchLocation.pageY;
        console.log(pos3, pos4);
    });
    
    elmnt.addEventListener('touchmove', function(e) {
      // grab the location of touch
        e = e || window.event;
        e.preventDefault();
        var touchLocation = e.targetTouches[0];
        
        pos1 = pos3 - touchLocation.pageX;
        pos2 = pos4 - touchLocation.pageY;
        pos3 = touchLocation.pageX;
        pos4 = touchLocation.pageY;
        
        
        // assign elmnt new coordinates based on the touch.
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        constrictToElement(elmnt, elmnt.parentElement);

        //console.log(pos3, pos4);
    });
    
    /* record the position of the touch
    when released using touchend event.
    This will be the drop position. */
    
    elmnt.addEventListener('touchend', function(e) {
      // current elmnt position.
      var x = parseInt(elmnt.style.left);
      var y = parseInt(elmnt.style.top);
    });
    
}
