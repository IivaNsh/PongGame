const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const port = process.env.port || 3000;

const io = require('socket.io')(http);

let staticPath =  path.join(__dirname, '../public');
app.use(express.static(staticPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/main.html'));
});

http.listen(port, () => {
    console.log(`App on port ${port}`);
});


let space_aspect_ratio = 2;

function line_intersection(p1, p2, p3, p4){
    let [x1, y1] = [p1.x, p1.y];
    let [x2, y2] = [p2.x, p2.y];
    let [x3, y3] = [p3.x, p3.y];
    let [x4, y4] = [p4.x, p4.y];
    let s1 = x2-x1;
    let s2 = y2-y1;
    let s3 = x4-x3;
    let s4 = y4-y3;
    let h1 = y3-y1;
    let h2 = x3-x1;
    let a = h1*s1-s2*h2;
    let b = s2*s3-s4*s1;
    
    let t2 = a/b;
    let t1 = (s3*t2+h2)/s1;
    
    if((0<t2 && t2<1) && (0<t1 && t1<1)){
        let p = { x: (p4.x-p3.x)*t2 + p3.x, y: (p4.y-p3.y)*t2 + p3.y};
        return p;
    }
    return undefined;
}

class Vector2d{
    constructor(){
        this.x = 0;
        this.y = 0;
    }
    lenght(){
        return Math.hypot(this.x, this.y);
    }
}

class Room {
    constructor() {
        this.players = new Map();
        this.left = null;
        this.right = null;
        this.ball = {
            x: 1,
            y: 0.5,
            v_x: 0,
            v_y: 0,
            r: 0.1
        };
        this.send_loop_id = 0;
        this.ball_loop_id = 0;

        this.startTime = 0;
        this.endTime = 0;
    }

    isFull(){
        return !!this.right && !!this.left;
    }

    isEmpty(){
        return !(!!this.right || !!this.left);
    }

    add( player_id ) {
        this.players.set(player_id, { pos:0.5, score:0, width: 0.2 });
        
        if( !this.left ){
            this.left = player_id;
        }
        else if( !this.right ){
            this.right = player_id;
            io.to(this.right).emit( "invert" );
        }

        if(this.isFull()) { 
            this.startGame();
        }
    }

    remove( player_id ) {
        this.stopGame();
        let removed = this.players.delete(player_id);
        if(!removed) return;
        if(this.left == player_id){
            this.left = null;
        }
        else if(this.right == player_id){
            this.right = null;
        }
    }

    update_position( player_id, pos ) {
        let player = this.players.get(player_id);
        player.pos = pos;
    }

    startGame() {
        let v = 1;
        let a = Math.random()*Math.PI;
        this.ball = {
            x: 1,
            y: 0.5,
            v_x: v*Math.cos(a),
            v_y: v*Math.sin(a),
            r: 0.01
        };
        this.players.set(this.left, { pos:0.5, score:0, width: 0.4 });
        this.players.set(this.right, { pos:0.5, score:0, width: 0.4 });
        this.endTime = Date.now()
        this.startTime = Date.now();
        this.dt = 0;
        this.send_loop_id = setInterval(this.send_update.bind(this), 10);
        this.ball_loop_id = setInterval(this.ball_update.bind(this), 1);
    }

    stopGame() {
        clearInterval(this.send_loop_id);
        clearInterval(this.ball_loop_id);
        io.to(this.left).emit( "end_game" );
        io.to(this.right).emit( "end_game" );
    }

    send_update(){
        io.to(this.left).to(this.right).emit( "ball_update", this.ball);

        io.to(this.left).emit( "players_update", this.players.get(this.right) );
        io.to(this.right).emit( "players_update", this.players.get(this.left) );
    }

    ball_update(){
        this.startTime = Date.now();
        let dt = (this.startTime - this.endTime)/1000;
        this.endTime = this.startTime;

        let r = this.ball.r;
        let px = this.ball.x;
        let py= this.ball.y;
        let nx = this.ball.x + this.ball.v_x*dt;
        let ny = this.ball.y + this.ball.v_y*dt;
        
        let lpos = this.players.get(this.left).pos;
        let rpos = this.players.get(this.right).pos;
        let lhw = this.players.get(this.left).width/2;
        let rhw = this.players.get(this.right).width/2;

        let p1 = line_intersection({x: px - r, y: py}, {x: nx - r, y: ny}, {x:0, y:0}, {x:0, y:1});
        let p2 = line_intersection({x: px + r, y: py}, {x: nx + r, y: ny}, {x:space_aspect_ratio, y:0}, {x:space_aspect_ratio, y:1});
        let p3 = line_intersection({x: px, y: py - r}, {x: nx, y: ny - r}, {x:0, y:0}, {x:space_aspect_ratio, y:0});
        let p4 = line_intersection({x: px, y: py + r}, {x: nx, y: ny + r}, {x:0, y:1}, {x:space_aspect_ratio, y:1});
        
        if(p1 !== undefined){
            console.log("p1", p1);
            if( Math.abs(p1.y - lpos) > lhw){
                //stopGame
                //left lost
                this.stopGame();
            }
            else{
                this.ball.x = p1.x + r;
                this.ball.y = p1.y;

                let factor = (p1.y - lpos)/lhw;
                let angle = (Math.PI / 3) * factor;
                let v_mag = Math.hypot(this.ball.v_x, this.ball.v_y) * 1.05;
                
                this.ball.v_x = Math.cos(angle) * v_mag;
                this.ball.v_y = Math.sin(angle) * v_mag;
            }
            console.log("p1", p1);
        }
        else if(p2 !== undefined){
            console.log("p2", p2);
            if( Math.abs(p2.y - rpos) > rhw){
                //stopGame
                //right lost
                this.stopGame();
            }
            else{
                this.ball.x = p2.x - r;
                this.ball.y = p2.y;

                let factor = (p2.y - rpos)/rhw;
                let angle = (Math.PI / 3) * factor;
                let v_mag = Math.hypot(this.ball.v_x, this.ball.v_y) * 1.05;
                
                this.ball.v_x = -Math.cos(angle) * v_mag;
                this.ball.v_y = Math.sin(angle) * v_mag;
            }
            console.log("p2", p2);
        }

        else if(p3 !== undefined){
            this.ball.x = p3.x;
            this.ball.y = p3.y + r;
            this.ball.v_y *= -1;
            //this.ball.v_x*=1.05;
            //this.ball.v_y*=1.05;
            console.log("p3", p3);
        }
        else if(p4 !== undefined){
            console.log(this.ball.v_y);
            this.ball.x = p4.x;
            this.ball.y = p4.y - r;
            this.ball.v_y *= -1;
            //this.ball.v_x*=1.05;
            //this.ball.v_y*=1.05;
            console.log("p4", p4, this.ball.v_y);
        }
        
        this.ball.x += this.ball.v_x * dt;
        this.ball.y += this.ball.v_y * dt;
    }
}





let rooms = [];

io.on('connection', (socket) => {

    let room = null;

    for(let i=0; i<rooms.length; i++){
        if(!rooms[i].isFull()){
            room = rooms[i];
            break;
        }
    }
    if(!room){
        room = new Room();
        rooms.push(room);
    }

    player_id = socket.id;
    room.add(player_id)

    socket.on("position_update", (pos) => {
        room.update_position( socket.id, pos );
    });
    
    socket.on('disconnect', (reason) => {
        room.remove(socket.id);
        rooms = rooms.filter((x) => { return !x.isEmpty() })
        //console.log([...rooms])
    });
    
    //console.log([...rooms])
});



