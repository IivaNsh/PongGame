const express = require('express');
const app = express();
const path = require('path');

const http = require('http').Server(app);
const port = process.env.port || 8080;

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
        this.id = 0;

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
            io.to(this.right).emit( "invert", 1 );
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
        if(!player){ return; }
        player.pos = pos;
        this.players.set(player_id, player);
        //console.log([...this.players.entries()]);
    }

    startGame() {
        this.ball = {
            x: 1,
            y: 0.5,
            v_x: 0.5,
            v_y: 0.5,
            r: 0.03
        };
        this.players.set(this.left, { pos:0.5, score:0, width: 0.4 });
        this.players.set(this.right, { pos:0.5, score:0, width: 0.4 });
        this.endTime = 0;
        this.startTime = 0;
        this.dt = 0;
        this.id = setInterval(this.game_update.bind(this), 10);
    }

    stopGame() {
        clearInterval(this.id);
        io.to(this.left).emit( "end_game", this.ball);
        io.to(this.right).emit( "end_game", this.ball);
        
    }

    game_update() {
        
        if (this.endTime == 0) this.endTime = Date.now();
        this.startTime = Date.now();
        let dt = (this.startTime - this.endTime)/1000;
        this.endTime = this.startTime;
        


        let x = this.ball.x + this.ball.v_x*dt; 
        let y = this.ball.y + this.ball.v_y*dt;
        
        let left_player = this.players.get(this.left);
        let right_player = this.players.get(this.right);

        if(x - this.ball.r <= 0){
            //left player hit
            if(y > left_player.pos + left_player.width/2 || y < left_player.pos - left_player.width/2){
                //stopGame
                //left lost
                this.stopGame();
            }
            this.ball.v_x*=-1;

        }
        else if(x + this.ball.r >= space_aspect_ratio) {
            //right player hit
            if(y > right_player.pos + right_player.width/2 || y < right_player.pos - left_player.width/2){
                //stopGame
                //right lost
                this.stopGame();
            }
            this.ball.v_x*=-1;
        }
        if(y - this.ball.r <= 0 || y + this.ball.r >= 1) {
            this.ball.v_y*=-1;
        }
        
        this.ball.x += this.ball.v_x * dt;
        this.ball.y += this.ball.v_y * dt;
        
    
        //console.log(dt);
        
        io.to(this.left).emit( "ball_update", this.ball);
        io.to(this.right).emit( "ball_update", this.ball);
        io.to(this.left).emit( "players_update", this.players.get(this.left), this.players.get(this.right) );
        io.to(this.right).emit( "players_update", this.players.get(this.right), this.players.get(this.left) );

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
        console.log([...rooms])
    });
    
    console.log([...rooms])
});

