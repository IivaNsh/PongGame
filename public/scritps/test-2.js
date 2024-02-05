
elmnt = document.getElementById("box");

dragElementMobile(elmnt);


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
        console.log(pos3, pos4);
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
