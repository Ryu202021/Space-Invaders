document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const backgroundImage = document.getElementById("background");
const btn = document.getElementById("mute");
let mute = true;
btn.addEventListener('click', function() {mute = !mute});


// alien images
const destroyed = new Image();
destroyed.src = 'Sprites/Destroyed.png';
const LAZER = new Image(); // alien bullet
LAZER.src = 'Sprites/AlienBullet.png';
const UFO = new Image();
UFO.src = 'Sprites/UFO.png';
const ALIEN1 = new Image();
ALIEN1.src = 'Sprites/Alien1Sprite.png';
const ALIEN2 = new Image();
ALIEN2.src = 'Sprites/Alien2Sprite.png';
const ALIEN3 = new Image();
ALIEN3.src = 'Sprites/Alien3Sprite.png';
const ALIEN4 = new Image();
ALIEN4.src = 'Sprites/Alien4Sprite.png';
const ALIEN5 = new Image();
ALIEN5.src = 'Sprites/Alien5Sprite.png';


// sound


// sounds
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        if (mute === false) {
            this.sound.play();
        }
    }
    this.stop = function () {
        this.sound.pause();
    }
}
const shootSound = new sound('Sounds/shoot.wav');
const destroyedSound = new sound('Sounds/invaderkilled.wav');
const ufoSound1 = new sound('Sounds/ufo_highpitch.wav');
const ufoSound2 = new sound('Sounds/ufo_lowpitch.wav');

const moveSound1 = new sound('Sounds/fastinvader1.wav');
const moveSound2 = new sound('Sounds/fastinvader2.wav');
const moveSound3 = new sound('Sounds/fastinvader3.wav');
const moveSound4 = new sound('Sounds/fastinvader4.wav');
let moveSounds = [];
let soundIndex = 0;


let gameSpeed = 900;
const levelUpRate = 15000;

// aliens
const numColumns = 12;
const alienMarginTop = 35;
const alienMargin = 30;
const alienPadding = 10;
const alienPaddingTop = 10;
const alienWidth = 35;
const alienHeight = 30;
let frame = 0; // for animation
const ACTIVE = true;
const INACTIVE = false;
let time = 0;
const timerRate = 100;


// alien movement
let dx = 2;
let dy = 3;

// score
let score = 0;
let numAliens = numColumns * 5;
let gameOver = false;

let lives = 100;



// player
const playerWidth = 45;
const playerHeight = 30;
const playerSpeed = 5;
const marginBottom = 40;
// bullets
const bulletSpeed = 5;
const bulletWidth = 5;
const bulletHeight = 10;

let shotFired = false;
let leftPressed = false;
let rightPressed = false;

// lazers
const lazerSpeed = 5;
const lazerWidth = 10;
const lazerHeight = 13;
const maxLazers = 10;
let lazersLeft = 5;
const shotProb = 100;

// UFO
let ufoSpeed = 5;
const ufoWidth = 60;
const ufoHeight = 30;
let ufoLaunch = INACTIVE;
const ufoRate = 10000;



class Sprite {
    constructor(x, y, image, width, height) {
        this.x = x;
        this.y = y;
        this.image = image;
        this.status = 2;
        this.width = width;
        this.height = height;
    }
    getStatus() {
        return this.status;
    }
    getY() {
        return this.y;
    }
    getX() {
        return this.x;
    }

    getImage() {
        return this.image;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }

    setImage(image) {
        this.image = image;
    }

    setStatus(status) {
        this.status = status;
    }
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }

    hitBy(box) {
        if (this.x < box.x && this.x + this.width > box.x + box.width && this.y < box.y && this.y + this.height > box.y + box.height) {
            return true;
        }
        return false;
    }

}


// shields



const numShields = 4;
const shieldColumns = 4;
const shieldRows = 3;
const shieldWidth = 25;
const shieldHeight = 25;

const shieldMarginBottom = 175;
const shieldMargin = 40;
const shieldPadding = 200;

let shields = [];

const shieldColours = { strong: 'green', med: 'yellow', weak: 'red' }
class Shield extends Sprite {

    constructor(x, y, width, height) {
        super(x, y, null, width, height);
        this.collisionStatus = [];
        for (let c = 0; c < shieldColumns; c++) {
            this.collisionStatus[c] = [];
            for (let r = 0; r < shieldRows; r++) {
                this.collisionStatus[c][r] = 3;
            }
        }
    }

    draw() {
        for (let c = 0; c < shieldColumns; c++) {
            for (let r = 0; r < shieldRows; r++) {
                if (this.collisionStatus[c][r] > 0) {
                    let shieldX = this.x + c * shieldWidth;
                    let shieldY = this.y + r * shieldHeight;
                    let tempStat = this.collisionStatus[c][r];
                    ctx.beginPath();
                    ctx.rect(shieldX, shieldY, shieldWidth, shieldHeight);
                  
                    if (tempStat == 3) {
                        ctx.fillStyle = shieldColours.strong;
                        ctx.fill();
                    } else if (tempStat == 2) {
                        ctx.fillStyle = shieldColours.med;
                        ctx.fill();
                    } else if (tempStat == 1) {
                        ctx.fillStyle = shieldColours.weak;
                        ctx.fill();
                    }
                    ctx.closePath();
                }
            }
        }


    }
    hitFrom(box) {
        for (let c = 0; c < shieldColumns; c++) {
            for (let r = 0; r < shieldRows; r++) {
                if (this.collisionStatus[c][r] > 0) {
                    let shieldX = this.x + c * shieldWidth;
                    let shieldY = this.y + r * shieldHeight;
                    if (((shieldX < box.getX() && shieldX + this.width > box.getX()) || (shieldX < box.getX() - box.getWidth() && shieldX + this.width > box.getX() + box.getWidth())) && shieldY < box.getY() && shieldY + this.height > box.getY() + box.getHeight()) {
                        let tempStat = this.collisionStatus[c][r];
                        this.collisionStatus[c][r] = tempStat -1;
                        return true;
                    }
    
                }
            }

        }
        return false;
    }


}





let player = new Sprite(canvas.width / 2, canvas.height - marginBottom - playerHeight, document.getElementById('player'), playerWidth, playerHeight);


let alien1 = [];
let alien2 = [];
let alien3 = [];
let alien4 = [];
let alien5 = [];
let bullet = new Sprite(0, 0, null, bulletWidth, bulletHeight);
let lazer = [];
let ufo = new Sprite(0, alienMarginTop, UFO);

function init() {
    // defines/declares aliens' x and y co-ords as well as image using Sprite class
    for (let i = 0; i < numColumns; i++) {

        let alienX = (i * (alienWidth + alienPadding)) + alienMargin;
        alien4[i] = new Sprite(alienX, 1 * (alienHeight + alienPaddingTop) + alienMarginTop, ALIEN4, alienWidth, alienHeight);
        alien1[i] = new Sprite(alienX, 2 * (alienHeight + alienPaddingTop) + alienMarginTop, ALIEN1, alienWidth, alienHeight);
        alien2[i] = new Sprite(alienX, 3 * (alienHeight + alienPaddingTop) + alienMarginTop, ALIEN2, alienWidth, alienHeight);
        alien5[i] = new Sprite(alienX, 4 * (alienHeight + alienPaddingTop) + alienMarginTop, ALIEN5, alienWidth, alienHeight);
        alien3[i] = new Sprite(alienX, 5 * (alienHeight + alienPaddingTop) + alienMarginTop, ALIEN3, alienWidth, alienHeight);
    }

    // declares lazers with x and y using bullet class
    for (let i = 0; i < maxLazers; i++) {
        lazer[i] = new Sprite(0, 0, LAZER, lazerWidth, lazerHeight);
        lazer[i].setStatus(INACTIVE);
    }

    // declares shields using shield class
    for (let i = 0; i < numShields; i++) {
        let shieldX = shieldMargin + i * shieldPadding;
        shields[i] = new Shield(shieldX, canvas.height - shieldMarginBottom, shieldWidth, shieldHeight);
    }

    // assigns sound movement to sound array
    moveSounds[0] = moveSound1;
    moveSounds[1] = moveSound2;
    moveSounds[2] = moveSound3;
    moveSounds[3] = moveSound4;

    // starts the game
    draw();
}


// functions for keyboard controls
function keyDownHandler(e) {
    let key = e.keyCode;
    if (key == 65 || key == 37 || key == 74) {
        leftPressed = true;
    } else if (key == 68 || key == 39 || key == 76) {
        rightPressed = true;
    } else if (key == 32 || key == 87 || key == 73 || key == 38 || key == 32) {
        shoot();
    } else if (key == 77) {
        mute = !mute;
    }
}

function keyUpHandler(e) {
    let key = e.keyCode;
    if (key == 65 || key == 37 || key == 74) {
        leftPressed = false;
    } else if (key == 68 || key == 39 || key == 76) {
        rightPressed = false;
    }
}
// function for mouse controls
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX + playerWidth < canvas.width) {
        player.setX(relativeX - playerWidth / 2);
    }
}


// draws shields
function drawShields() {
    for (let i = 0; i < numShields; i++) {
        shields[i].draw();
    }
}



// draws bullets
function drawBullet() {
    ctx.beginPath();
    ctx.rect(bullet.getX(), bullet.getY(), bullet.getWidth(), bullet.getHeight());
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}
// draws live count
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: " + lives, 10, canvas.height - 10);
    // draw bottom of game
    ctx.beginPath();
    ctx.rect(0, canvas.height - marginBottom, canvas.width, 5);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath;
}
// draws score
function drawScore() {
    let currentScore = score;
    if (score < 10) {
        currentScore = '0000';
    } else if (score < 100) {
        currentScore = '00' + score;
    } else if (score < 1000) {
        currentScore = '0' + score;
    }

    ctx.font = "20px Fonts/minecraft.zip";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + currentScore, 10, 30);
}

// sets bullet position and tells game shot from player has been fired
function shoot() {
    if (!shotFired) {
        bullet.setX(player.getX() + playerWidth / 2);
        bullet.setY(player.getY());
        shotFired = true;
        shootSound.play();
    }
}
// draws alien lazers

function drawLazer(shot) {

    ctx.drawImage(shot.getImage(), shot.getX(), shot.getY(), shot.getWidth(), shot.getHeight());

}

// draws player
function drawPlayer() {
    ctx.drawImage(player.getImage(), player.getX(), player.getY(), player.getWidth(), player.getHeight());

}
// draws UFO
function drawUFO() {
    if (ufo.getStatus() == 2) {
        ufo.setImage(UFO);
        ctx.drawImage(ufo.getImage(), ufo.getX(), ufo.getY(), ufoWidth, ufoHeight);
    } if (ufo.getStatus() == 1) {
        ufo.setImage(destroyed);
        ctx.drawImage(ufo.getImage(), ufo.getX(), ufo.getY(), ufoWidth, ufoHeight);
    }
}
// draws background
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}



// this initiates the animation by calling the loop function 
// for the first time 
function move() {

    for (let i = 0; i < numColumns; i++) {
        alien4[i].setX(alien4[i].getX() + dx);
        alien1[i].setX(alien1[i].getX() + dx);
        alien2[i].setX(alien2[i].getX() + dx);
        alien5[i].setX(alien5[i].getX() + dx);
        alien3[i].setX(alien3[i].getX() + dx);

    }
}

// when aliens reach side of screen, they will shift down
function shiftDown() {

    for (let i = 0; i < numColumns; i++) {
        alien4[i].setY(alien4[i].getY() + dy);
        alien1[i].setY(alien1[i].getY() + dy);
        alien2[i].setY(alien2[i].getY() + dy);
        alien5[i].setY(alien5[i].getY() + dy);
        alien3[i].setY(alien3[i].getY() + dy);
    }
}


function collisionDetection() {
    // check if bullet collides with an alien
    for (let i = 0; i < numColumns; i++) {
        let alienOne = alien1[i];
        let alienTwo = alien2[i];
        let alienThree = alien3[i];
        let alienFour = alien4[i];
        let alienFive = alien5[i];
        if (shotFired === true && alienOne.getStatus() > 1 && alienOne.hitBy(bullet) === true) {
            shotFired = false;
            score += 10;
            numAliens--;
            alienOne.setStatus(alienOne.getStatus() - 1);
            destroyedSound.play();
        } else if (shotFired === true && alienTwo.getStatus() > 1 && alienTwo.hitBy(bullet) === true) {
            shotFired = false;
            score += 10;
            numAliens--;
            alienTwo.setStatus(alienTwo.getStatus() - 1);
            destroyedSound.play();
        } else if (shotFired === true && alienThree.getStatus() > 1 && alienThree.hitBy(bullet) === true) {
            shotFired = false;
            score += 10;
            numAliens--;
            alienThree.setStatus(alienThree.getStatus() - 1);
            destroyedSound.play();
        } else if (shotFired === true&& alienFour.getStatus() > 1 && alienFour.hitBy(bullet) === true) {
            shotFired = false;
            score += 10;
            numAliens--;
            alienFour.setStatus(alienFour.getStatus() - 1);
            destroyedSound.play();
        } else if (shotFired === true&& alienFive.getStatus() > 1 && alienFive.hitBy(bullet) === true) {
            shotFired = false;
            score += 10;
            numAliens--;
            alienFive.setStatus(alienFive.getStatus() - 1);
            destroyedSound.play();
        }

    }

    for (let i =0; i < numShields; i++) {
        if (shields[i].hitFrom(bullet) === true && shotFired) {
            shotFired = false;
        }
        for (let j = 0; j < maxLazers; j++) {
            if (lazer[j].getStatus() === ACTIVE) {
                let shot = lazer[j];

                // shield and lazer collision detection
                if (shields[i].hitFrom(shot) === true) {
                    shot.setStatus(INACTIVE);
                    lazersLeft++;
                }
                if (player.hitBy(shot) && shot.getStatus() === ACTIVE) {
                    lives--;
                    shot.setStatus(INACTIVE);
                    lazersLeft++;
                }
                
               
            }

        
        }
    }
  
    // collision detection for UFO
    if (bullet.getY() > ufo.getY() && bullet.getY() < ufo.getY() + ufoWidth && (bullet.getX() > ufo.getX() && bullet.getX() < ufo.getX() + ufoWidth) && (bullet.getX() + bulletWidth > ufo.getX() && bullet.getX() + bulletWidth < ufo.getX() + ufoWidth) && shotFired === true && ufo.getStatus() > 1) {
        shotFired = false;
        score += 50;
        ufo.setStatus(ufo.getStatus() - 1);
        destroyedSound.play();
        
    }




}

// shoots lazers for aliens
function pewPew(x, y) {
    let exit = false;
    for (let i = 0; i < maxLazers && exit === false; i++) {

        let shot = lazer[i];
        if (shot.getStatus() === INACTIVE) {
            shot.setX(x + alienWidth / 2);
            shot.setY(y + alienHeight);
            shot.setStatus(ACTIVE);
            lazersLeft--;
            exit = true;
        }

    }
}
// draws aliens
function drawAlien(alien) {
    if (alien.getStatus() > 0) {
        if (alien.getStatus() == 1) {
            alien.setImage(destroyed);
            ctx.drawImage(alien.getImage(), alien.getX(), alien.getY(), alienWidth, alienHeight);
        } else if (alien.getImage() === ALIEN1) {
            ctx.drawImage(alien.getImage(), frame * 127, 0, 127, 91, alien.getX(), alien.getY(), alienWidth, alienHeight);
        } else if (alien.getImage() === ALIEN2) {
            ctx.drawImage(alien.getImage(), frame * 112, 0, 112, 90, alien.getX(), alien.getY(), alienWidth, alienHeight);
        } else if (alien.getImage() === ALIEN3) {
            ctx.drawImage(alien.getImage(), frame * 131, 0, 131, 92, alien.getX(), alien.getY(), alienWidth, alienHeight);
        } else if (alien.getImage() === ALIEN4) {
            ctx.drawImage(alien.getImage(), frame * 88, 0, 88, 94, alien.getX(), alien.getY(), alienWidth, alienHeight);
        } else if (alien.getImage() === ALIEN5) {
            ctx.drawImage(alien.getImage(), frame * 124, 0, 122, 88, alien.getX(), alien.getY(), alienWidth, alienHeight);
        }
    }
}



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);	// clears 
    drawBackground();
    drawScore();
    drawLives();
    drawPlayer();
    drawShields();
    collisionDetection();



    if (shotFired === true) {
        drawBullet();
        bullet.setY(bullet.getY() - bulletSpeed);
        if (bullet.getY() < 0) {
            shotFired = false;
        }
    }

    // draw aliens

    for (let i = 0; i < numColumns; i++) {
        let alienOne = alien1[i];
        let alienTwo = alien2[i];
        let alienThree = alien3[i];
        let alienFour = alien4[i];
        let alienFive = alien5[i];
        if ((alienOne.getStatus() > 0 && alienOne.getX() + alienOne.getWidth() + dx > canvas.width - alienMargin || alienOne.getX() + dx < alienMargin)
            || (alienTwo.getStatus() > 0 && alienTwo.getX() + alienTwo.getWidth() + dx > canvas.width - alienMargin || alienTwo.getX() + dx < alienMargin)
            || (alienThree.getStatus() > 0 && alienThree.getX() + alienThree.getWidth() + dx > canvas.width - alienMargin || alienThree.getX() + dx < alienMargin)
            || (alienFour.getStatus() > 0 && alienFour.getX() + alienFour.getWidth() + dx > canvas.width - alienMargin || alienFour.getX() + dx < alienMargin)
            || (alienFive.getStatus() > 0 && alienFive.getX() + alienFive.getWidth() + dx > canvas.width - alienMargin || alienFive.getX() + dx < alienMargin)) {

            dx = -dx;
            shiftDown();
            if ((alienOne.getY() + alienOne.getHeight() >= player.getY())
                || (alienTwo.getY() + alienTwo.getHeight() >= player.getY())
                || (alienThree.getY() + alienThree.getHeight() >= player.getY())
                || (alienFour.getY() + alienFour.getHeight() >= player.getY())
                || (alienFive.getY() + alienFive.getHeight() >= player.getY())) {
                gameOver = true;
            }



        }
        drawAlien(alienOne);
        drawAlien(alienTwo);
        drawAlien(alienThree);
        drawAlien(alienFour);
        drawAlien(alienFive);
    }

    // move lazers
    for (let i = 0; i < maxLazers; i++) {
        if (lazer[i].getStatus() === ACTIVE) {
            let shot = lazer[i];
            shot.setY(shot.getY() + lazerSpeed);
            drawLazer(shot);
            // bullet collision detection
            if (shotFired === true && bullet.getY() > shot.getY() && bullet.getY() < shot.getY() + lazerHeight && ((bullet.getX() > shot.getX() && bullet.getX() < shot.getX() + lazerWidth) || (bullet.getX() - bulletWidth > shot.getX() && bullet.getX() + bulletWidth < shot.getX() + lazerWidth))) {
                shot.setStatus(INACTIVE);
                lazersLeft++;
                score += 5;
                shotFired = false;
                destroyedSound.play();
            }
        }
    }

    // draws ufo
    if (ufoLaunch === ACTIVE && ufo.getStatus() > 0) {
        drawUFO();
        ufo.setX(ufo.getX() + ufoSpeed);
    }
    



    // move player
    if (leftPressed) {
        if (player.getX() - playerSpeed > 0) {
            player.setX(player.getX() - playerSpeed);
        }
    } else if (rightPressed) {
        if (player.getX() + playerWidth + playerSpeed < canvas.width) {
            player.setX(player.getX() + playerSpeed);
        }
    }
    if (numAliens <= 0) {
        gameOver = true;

    }


    // game end
    if (gameOver === true) {
        alert("GAME OVER");

        document.location.reload();

    }


    requestAnimationFrame(draw);
}
document.addEventListener('load', init());

function launchUfo() {
    ufoLaunch = ACTIVE;

    ufo.setStatus(2);
    if (ufoSpeed < 0) {
        ufo.setX(canvas.width);
    } else if (ufoSpeed > 0) {
        ufo.setX(0 - ufoWidth);
    }
}

function timer() {
    time += timerRate;
    if (time % gameSpeed == 0) {
        animate();
    } if (time % ufoRate == 0) {
        launchUfo();
    } if (time % levelUpRate == 0) {
        gameSpeed -= 100;
        if (lazersLeft < maxLazers) {
            lazersLeft++;
        }
    }
}

function explosionCleanup() {
    for (let i = 0; i < numColumns; i++) {
        let alienOne = alien1[i];
        let alienTwo = alien2[i];
        let alienThree = alien3[i];
        let alienFour = alien4[i];
        let alienFive = alien5[i];
        if (Math.floor(Math.random() * 100) % shotProb == 0 && lazersLeft > 0 && alienOne.getStatus() > 1) {
            pewPew(alienOne.getX(), alienOne.getY());

        }
        if (alienOne.getStatus() == 1) {
            alienOne.setStatus(0);
        }

       
        if (Math.floor(Math.random() * 100) % shotProb == 0 && lazersLeft > 0 && alienTwo.getStatus() > 1) {
            pewPew(alienTwo.getX(), alienTwo.getY());

        }
        if (alienTwo.getStatus() == 1) {
            alienTwo.setStatus(0);
        }

       
        if (Math.floor(Math.random() * 100) % shotProb == 0 && lazersLeft > 0 && alienThree.getStatus() > 1) {
            pewPew(alienThree.getX(), alienThree.getY());

        }
        if (alienThree.getStatus() == 1) {
            alienThree.setStatus(0);
        }

        if (Math.floor(Math.random() * 100) % shotProb == 0 && lazersLeft > 0 && alienFour.getStatus() > 1) {
            pewPew(alienFour.getX(), alienFour.getY());

        }
        if (alienFour.getStatus() == 1) {
            alienFour.setStatus(0);
        }

        
        if (Math.floor(Math.random() * 100) % shotProb == 0 && lazersLeft > 0 && alienFive.getStatus() > 1) {
            pewPew(alienFive.getX(), alienFive.getY());

        }
        if (alienFive.getStatus() == 1) {
            alienFive.setStatus(0);
        }
    }
    if (ufo.getStatus() == 1) {
        ufo.setStatus(0);
        ufoLaunch = INACTIVE;
    }


}

function animate() {
    move();
    moveSounds[soundIndex].play();
    soundIndex++;
    frame++;

    if (frame > 1) {
        frame = 0;
    }
    move();
    moveSounds[soundIndex].play();
    soundIndex++;
    if (soundIndex > 3) {
        soundIndex = 0;
    }
    explosionCleanup();
}

setInterval(timer, timerRate);
