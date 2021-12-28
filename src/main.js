const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let x = 21; 
let y = 21;
let dx = 4; 
let dy = 4;
const ballRadius = 10;
const colors = ['red','pink','orange','yellow','green','blue','black','white','purple','salmon'];
let curr = 0;
let random;
let leftPressed = false;
let rightPressed = false;

let paddle = {
    height : 10,
    width : 100,
    x : (canvas.width - 100) / 2
}

const info_brick = {
    row : 3,
    col : 6,
    wid : (canvas.width - 60 - 50) / 6 ,
    hei : 15,
    pad : 10,
    offTop : 30,
    offLeft : 30
}

let bricks = []; 

let SCORE = {curr : 0, max : 10 * (info_brick.row * info_brick.col)};

let USER_LIFE = 1; //남은 생명수

let GAME_START;
let PLAYABLE = true;
const blue = '#0095DD';

function init(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_score();
    draw_life();
    draw_bricks();
    draw_ball();
    draw_paddle();
    collision_detection();

    if(PLAYABLE){GAME_START = requestAnimationFrame(init);}
}//init

/* 공 그리기 */
function draw_ball(){
    ctx.beginPath();
    ctx.fillStyle = colors[curr];
    ctx.arc(x,y,ballRadius,0,Math.PI * 2,false);
    x+=dx;
    y+=dy;

    if(x >= canvas.width - ballRadius || x <= ballRadius){
        randomColor();
        dx = -dx;
    }//if 좌우 벽
    
    if(y <= 20){
        randomColor();
        dy = -dy;
    }else if(y >= canvas.height - ballRadius){
        randomColor();
        if(x > paddle.x && x < paddle.x + paddle.width){
            const speed = Math.abs(dy + 2) > 20 ? 20 : dy + 2;
            dy = -(speed); //패들에 닿을수록 속도 빨라짐
        }else{
            USER_LIFE--;
            reset_info();
            if(USER_LIFE < 0){lost_game();}
        }
    }//if 상하벽

    ctx.fill();
    ctx.closePath();
}//draw_ball

/* 공 벽에 부딪치면 랜덤 칼라 */
function randomColor(){
    random = Math.round(Math.random() * 5);
    if(random == curr){
        while(random == curr){random = Math.round(Math.random() * colors.length - 1);}
    }
    curr = random;
}//randomColor

/* 패들 그리기 */
function draw_paddle(){
    const {width,height,x} = paddle;
    ctx.beginPath();
    ctx.rect(x,canvas.height - height, width, height);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

    if(rightPressed && x < canvas.width - width){
        paddle.x += 5;
    }
    if(leftPressed && x > 0){
        paddle.x -= 5;
    }
}//draw_paddle

/* 키보드 핸들러 */
function keyboardHandler(e,bool){
    switch(e.key){
        case "ArrowLeft" : 
            leftPressed = bool;
            break;
        case "ArrowRight" : 
            rightPressed = bool;
            break;
    }//keyUpHandler
}//keyboardHandler

/* 마우스 핸들러 */
function mouseMoveHandler(e){
    const half_padWid = paddle.width / 2;
    const relativeX = e.clientX - canvas.offsetLeft;
    if((relativeX > half_padWid) && 
       relativeX < canvas.width - half_padWid){
        paddle.x = relativeX - half_padWid;
    }//if
}//mouseMoveHandler

/* 벽돌 그리기 관련 */
function set_bricks(){
    const {col,row} = info_brick;
    for(let c=0; c<col; c++){
        bricks[c] = [];
        for(let r=0; r<row; r++){
            bricks[c][r] = {x:0, y:0, status:1};
        }//for-row
    }//for-col
}//set_bricks

function draw_bricks(){
    const {row,col,wid,hei,pad,offTop,offLeft} = info_brick;
    for(let c = 0; c < col; c++ ){
        for(let r=0; r<row; r++){
            if(bricks[c][r].status !== 1){continue;}
            const brickX = offLeft + (c * (wid + pad));
            const brickY = offTop + (r * (wid + pad));
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX,brickY,wid,hei);
            ctx.fillStyle = blue;
            ctx.fill();
            ctx.closePath();
        }//for-row
    }//for-col
}//draw_bricks

/* 충돌감지 함수 */
function collision_detection(){
    const {col,row,wid,hei} = info_brick;
    for(let c = 0; c<col; c++){
        for(let r=0; r<row; r++){
            const B = bricks[c][r];
            if(B.status !== 1){continue;}
            if((x > B.x)&&
               (x < B.x + wid) &&
               (y > B.y) &&
               (y < B.y + hei)){
                dy = -dy;
                randomColor();
                B.status = 0;
                SCORE.curr += 10;
                is_win();
            }//if
        }//for-row
    }//for-col
}//collision_detection

/* 점수 그리기 */
function draw_score(){
    ctx.font = "14px Dotum";
    ctx.fillStyle = blue;
    ctx.fillText(`점수 : ${SCORE.curr}`, 10, 20);
}//draw_score

/* 생명 그리기 */
function draw_life(){
    ctx.fonr = "16px Dotum";
    ctx.fillStyle = blue;
    ctx.fillText(`목숨 : ${USER_LIFE}`,canvas.width - 65,20);
}//draw_life

/* 승리 감지 */
function is_win(){
    if(SCORE.curr == SCORE.max){
        window.cancelAnimationFrame(GAME_START);
        if(confirm('YOU WIN!!!')){
            document.location.reload();
        }else{
            pause_game(true);
        }//reload
    }//if 점수가 최종일때
}//is_win

/* 패배 감지 */
function lost_game(){
    window.cancelAnimationFrame(GAME_START);
    if(confirm('게임오버')){
        document.location.reload();
    }else{
        pause_game(false);
    }
}//lost_game

/* 목숨 잃었을 때 리셋 */
function reset_info(){
    // x = canvas.width / 2;
    // y = canvas.height - 30;
    x = 21;
    y = 21;
    dx = 4;
    dy = -4;
    paddle.x = (canvas.width - 100) / 2;
}//reset_info

function pause_game(bool){
    PLAYABLE = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = blue;
    ctx.fillText(`${bool ? 'You Won' : 'Game Over'}`,canvas.width / 2, 150);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`score : ${SCORE.curr}`,canvas.width / 2, 200);
}//pause_game

/////////////////////////////////////
//최종실행
set_bricks();
init();

window.addEventListener('keydown',(e)=>{keyboardHandler(e,true)},false);
window.addEventListener('keyup',(e)=>{keyboardHandler(e,false)},false);
window.addEventListener('mousemove',mouseMoveHandler,false);