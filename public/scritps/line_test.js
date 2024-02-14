


function drawCircle(p, r, width, color, context){
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.arc(p.x, p.y, r, 0, 2 * Math.PI);
    context.stroke();
}
function drawCircleFill(p, r, color, context){
    context.fillStyle = color;
    context.beginPath();
    context.arc(p.x, p.y, r, 0, 2 * Math.PI);
    context.fill();
}





function drawLine(p1, p2, width=2, color="black", context){

    context.strokeStyle = color;
    context.lineWidth = width;

    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();

    drawCircle(p1, 10, 2, color, context);
    drawCircle(p2, 10, 2, color, context);
}

function darwRect(p1, p2, color="black", context){
    context.fillStyle = color;

    context.rect(p1.x, p1.y, p2.x, p2.y);
    context.fill();
}


function line_intersection(p1, p2, p3, p4){
    //let t2 = ((p3.y-p1.y)*(p2.x-p1.x)+(p3.x-p1.x)*(p2.y-p1.y))/((p4.y-p3.y)*(p2.x-p1.x)+(p3.x-p4.x)*(p2.y-p1.y));
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










window.onload = () => {

    
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    selected = -1;

    let ps = []
    ps.push({ x: 100, y: 300 });
    ps.push({ x: 400, y: 100 });
    ps.push({ x: 100, y: 100 });
    ps.push({ x: 500, y: 300 });


    

    function update(context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawLine(ps[0], ps[1], width=2, color="black", context);
        drawLine(ps[2], ps[3], width=2, color="black", context);
        
        let p = line_intersection(ps[0],ps[1],ps[2],ps[3]);
        if(p!=undefined){
            //drawCircle(p, 5, 2, color="red", context)
            drawCircleFill(p, 5, color="red", context);
        }
    }

    canvas.onmousedown = (e)=>{
        let p = { x: e.offsetX, y: e.offsetY };
        for(let i =0; i<ps.length; i++){
            let d = Math.sqrt((ps[i].x-p.x)*(ps[i].x-p.x)+(ps[i].y-p.y)*(ps[i].y-p.y));
            if(d<10){
                selected = i;
            }
        }
    };
    
    canvas.onmouseup = (e)=>{
        selected = -1;
    };
    
    canvas.onmouseleave = (e)=>{
        selected = -1;
    };
    
    canvas.onmousemove = (e)=>{
        if(0<=selected && selected<ps.length){
            ps[selected] = { x: e.offsetX, y: e.offsetY };
        }
    };
    
    setInterval(function(){
        update(context);
      }, 20);
    
}