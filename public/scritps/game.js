const socket = io();



let playground;
let playgroundParent;

let platform1, platform2, ball;


let platform_1_pos_x = 0;
let platform_2_pos_x = 0;

let platform_1_pos_y = 0;
let platform_2_pos_y = 0;

let platform_width = 0;
let platform_height = 0;



let player1_score = 0;
let player2_score = 0;

let playground_w = 0, playground_h = 0;

let ball_size;

window.onload = () => {
  init();

  socket.on("players_update", (players) => {
    //setPlatformPos(platform2, playground_w-platform_height, y*(playground_h-platform_width));
  });

  socket.on("ball_update", (ball) => {
    ball_elemnt.style.width = ball.r * 2 * playground_h + "px";
    ball_elemnt.style.height = ball.r * 2 * playground_h + "px";
    setBallPos(ball_elemnt, ball.x*playground_w, ball.y*playground_h, ball.r*playground_h);
  });

  //myMove(playground);
};

function init(){
  playground = document.getElementsByClassName("playground")[0];
  playgroundParent = playground.parentElement;
  platform1 = document.getElementById("plt1");
  platform2 = document.getElementById("plt2");

  ball_elemnt = document.getElementById("ball");

  resize();
}

window.onresize = () => {
  resize();
}

function resize(){

  let w = playgroundParent.clientWidth;
  let h = playgroundParent.clientHeight;
  console.log(w, h);
  let playeground_aspect_ratio = 0.5;
  let platform_aspect_ratio = 0.2;

  let nw = 10;
  let nh = 10;

  if( w > h ){
    //lanscape
    nw = w;
    nh = nw*playeground_aspect_ratio;
    if ( h < nh ) { nh = h; nw = h/playeground_aspect_ratio; }
    playground.style.transform = "rotate(0deg)";
  }
  else{
    //potrail
    nw = h;
    nh = nw*playeground_aspect_ratio;
    if ( w < nh ) { nh = w; nw = w/playeground_aspect_ratio; }
    playground.style.transform = "rotate(90deg)";
  }
  playground.style.width  = `${nw}px`;
  playground.style.height = `${nh}px`;
  
  playground_w = nw;
  playground_h = nh;


  platform_width = nh * 0.25;
  platform_height = platform_width*platform_aspect_ratio;

  platform1.style.height = `${platform_width}px`;
  platform1.style.width = `${platform_height}px`;
  
  platform2.style.height = `${platform_width}px`;
  platform2.style.width = `${platform_height}px`;
  

  ball_size = nh * 0.06;
  ball_elemnt.style.width = `${ball_size}px`;
  ball_elemnt.style.height = `${ball_size}px`;


  setPlatformPos(platform1, 0, 0);
  setPlatformPos(platform2, playground_w-platform_height, 0);

}

function playground_mouse_move(event){
  //console.log(`moved! < ${event.x} | ${event.y} > { ${event.offsetX} | ${event.offsetY} }`)
  let top = event.offsetY - platform_width/2;
  let bottom = event.offsetY + platform_width/2;
  let nps = top;
  if (top < 0) {
    nps = 0;
  }
  else if (bottom > playground_h){
    nps = playground_h - platform_width;
  }
  setPlatformPos(platform1, 0, nps);
  socket.emit('move', nps/(playground_h-platform_width)); 
}

function setPlatformPos(platform, x, y){
  setElementPos(platform, x, y);
}

function setBallPos(ball, x, y, r){
  setElementPos(ball, x - r, y - r);
}

function setElementPos(element, x, y){
  element.style.transform = `translate(${x}px, ${y}px)`;
}

function getData(){

}

function sendData(){

}

function sendPlatformData(){

}

function getPlatformData(){

}

function getBallData(){
  
}

function getScoreData(){

}



function myMove(element) {
    let id = null;
    const elem = element;
    clearInterval(id);
    id = setInterval(frame, 5);

    let a=0, b=1, c=0, angle=0;

    function frame() {
      if (angle == 6) {
        clearInterval(id);
      } 
      else {
        elem.style.transform = `rotate3d(${a}, ${b}, ${c}, ${90}deg)`;
        angle+=0.05;

        a = Math.sin(0.2*angle + 0.1);
        b = Math.cos(0.3*angle + 0.5);
        c = Math.cos(0.1*angle + 0.9);

      }
    }
} 