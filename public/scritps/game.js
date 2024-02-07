const socket = io();

let space;
let element_player_left;
let element_player_right;
let element_ball;

let player_left = { pos: 0.5, score: 0, width: 0.2 };
let player_right = { pos: 0.5, score: 0, width: 0.2 };
let ball = {
  x: 0.5,
  y: 0.5,
  v_x: 0.1,
  v_y: 0.3,
  r: 0.05
};

let space_aspect_ratio = 2;
let scale = 300;

window.onload = () => {

  space = document.getElementById("space");
  element_player_left = document.getElementById("player_left");
  element_player_right = document.getElementById("player_right");
  element_ball = document.getElementById("ball");
  element_controll = document.getElementById("controll");
  element_controll = space.parentElement;
  element_game_content = document.getElementById("game_content")

  space.style.aspectRatio = space_aspect_ratio;
  space.style.height = scale + "px";

  element_player_left.style.height = player_left.width;
  element_player_right.style.height = player_right.width;
  
  element_player_right.style.top = player_right.pos * scale - element_player_right.offsetHeight/2 + "px";
  element_player_right.style.left = space.offsetWidth - element_player_right.offsetWidth + "px";


  socket.on("players_update", (player_left_backEnd, player_right_backEnd) => {
    player_left = player_left_backEnd;
    player_right = player_right_backEnd;

    element_player_left.style.height = player_left.width;
    element_player_right.style.height = player_right.width;

    element_player_right.style.top = player_right.pos * scale - element_player_right.offsetHeight/2 + "px";
    element_player_right.style.left = space.offsetWidth - element_player_right.offsetWidth + "px";
  });

  socket.on("ball_update", (ball_backEnd) => {
    ball = ball_backEnd;
    element_ball.style.width = ball.r * 2 * scale + "px";
    element_ball.style.height = ball.r * 2 * scale + "px";
    element_ball.style.transform = `translate(${(ball.x - ball.r) * scale}px, ${(ball.y - ball.r) * scale}px)`;
  });

  socket.on("invert", (_) => {
    element_game_content.style.transform = `scale(-1,1)`;
  });

  socket.on("disconnect", (reson) => {
    setTimeout(()=>{window.location.replace("main.html");}, 2000);
  });

  dragElementWithControllPC(element_player_left, element_controll);
  dragElementWithControllMobile(element_player_left, element_controll);
  setInterval(send_position, 50);
};

function dragElementWithControllPC(elmnt, elmnt_controll) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt_controll.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt_controll.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt_controll.onmousedown = dragMouseDown;
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
    elmnt.style.top = (pos4-getOffset(elmnt.parentElement).top - elmnt.offsetHeight/2) + "px";
    elmnt.style.left = (pos3-getOffset(elmnt.parentElement).left - elmnt.offsetWidth/2) + "px";
    
    constrictToElement(elmnt, elmnt.parentElement);

    player_left.pos = (elmnt.offsetTop + elmnt.offsetHeight/2) / scale;
    //console.log(elmnt.offsetLeft, elmnt.offsetTop, elmnt.parentElement.offsetWidth, elmnt.parentElement.offsetHeight)
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function dragElementWithControllMobile(elmnt, elmnt_controll) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  /* listen to the touchMove event,
  every time it fires, grab the location
  of touch and assign it to box */
  elmnt_controll.addEventListener("touchstart", (e) => {
      e = e || window.event;
      e.preventDefault();
      var touchLocation = e.targetTouches[0];
      pos3 = touchLocation.pageX;
      pos4 = touchLocation.pageY;
      console.log(pos3, pos4);
  });
  
  elmnt_controll.addEventListener('touchmove', function(e) {
    // grab the location of touch
      e = e || window.event;
      e.preventDefault();
      var touchLocation = e.targetTouches[0];
      
      pos1 = pos3 - touchLocation.pageX;
      pos2 = pos4 - touchLocation.pageY;
      pos3 = touchLocation.pageX;
      pos4 = touchLocation.pageY;
      
      
      // assign elmnt new coordinates based on the touch.
      elmnt.style.top = (pos4-getOffset(elmnt.parentElement).top - elmnt.offsetHeight/2) + "px";
      elmnt.style.left = (pos3-getOffset(elmnt.parentElement).left - elmnt.offsetWidth/2) + "px";
      
      constrictToElement(elmnt, elmnt.parentElement);

      player_left.pos = (elmnt.offsetTop + elmnt.offsetHeight/2) / scale;
    
      //console.log(pos3, pos4);
  });
  
  /* record the position of the touch
  when released using touchend event.
  This will be the drop position. */
  
  elmnt_controll.addEventListener('touchend', function(e) {
    // current elmnt position.
    var x = parseInt(elmnt.style.left);
    var y = parseInt(elmnt.style.top);
  });
  
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

function constrictToElement(el1, el2){
  if(el1.offsetTop < 0){ el1.style.top = 0 + "px"; }
  if(el1.offsetTop > el2.offsetHeight - el1.offsetHeight){ el1.style.top = el2.offsetHeight - el1.offsetHeight + "px"; }

  if(el1.offsetLeft < 0){ el1.style.left = 0 + "px"; }
  if(el1.offsetLeft > el2.offsetWidth - el1.offsetWidth){ el1.style.left = el2.offsetWidth - el1.offsetWidth + "px"; }
}

function send_position(){
  socket.emit("position_update", player_left.pos);
}