let score = 0;
let active_fallers = [];
let burger_stack = [];
let skip_frame_counter = 0;
let current_skip = 0;
let max_skip = 15;
let frame_count = 0;
const faller_width = 100;
const faller_height = 30;
const catcher_width = 100;
let bottom_border_factor = 20;
let min_colors = 2;
let max_colors = 4;
let catcher_x;
let play_again_button;
var cloud_backgroud;

let colorArray = ["#ffd046","#ef233c","#235789","#7ee081","#98c1d9","#6b5ca5","#028A42","#009fb7","#f9a03f","#00171f"]
let active_goal = getRandomColors();
let active_enemy = exclusiveRandomColorArray(active_goal);
let goals_left = active_goal.length;


// ellipise falling from top of the screen to the bottom    
// random color, speed, and x cordinate assigned
class Faller {
    constructor( x_pos, y_pos, y_speed, color) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.y_speed = y_speed;
        this.color = color;
    }
    // move faller's position based on speed
    move() {
        // remove faller from list if out of screen
        if( this.y_pos > windowHeight+faller_width/2) {
            let index_to_remove = active_fallers.indexOf(this);
            active_fallers.splice(index_to_remove,1);
            delete this;
        }

        // advance faller
        this.y_pos += this.y_speed;
    }
    // display faller in the current position
    display() {
        fill(this.color);
        ellipse(this.x_pos, this.y_pos, faller_width, faller_height);
    }
    // check if faller is colliding with the top of the stack
    // if so add to stack and remove from active fallers
    isColliding() {
        // check x_pos value is with X pixels of catcher
        if( abs(this.x_pos - catcher_x) < faller_width/2 ) {
            // check y_pos value is within X pixels of catcher
            let stack_height = burger_stack.length * faller_height * 1/3;
            if( abs(this.y_pos - (windowHeight - bottom_border_factor - stack_height) ) < faller_height/2 ) {
                // grab index of faller colliding
                const index_of_faller = active_fallers.indexOf(this);

                // remove faller from list of actice_fallers
                active_fallers.splice(index_of_faller,1);
                
                // check if color is in goal or enemy
                checkGoal(this.color);
                checkEnemy(this.color);

                // add topping to stack
                burger_stack.push(this);
            }
        }
    }
}

// set p5 canvas
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    catcher_x = windowWidth / 2;
}

// call this function each new frame
function draw() {

    // clear canvas
    clear();

    // set backgroud
    imageMode(CENTER);
    image(cloud_backgroud, width/2, height/2, width, height);

    // run fallers and catcher
    runFallingStack();

    // track game
    runGame();

    // listen for mouse movement
    onMouseMove();
}

// load background image
function preload() {
    cloud_backgroud = loadImage("clouds.jpg")
    night_background = loadImage("night.jpeg")
}

// function to add new Faller to sky
function addFaller() {
    // set random x_pos and get negative y_pos
    let x_pos = Math.random()*(windowWidth - faller_width/2) + faller_width/2;
    let y_pos = -(faller_height/2);
    let y_speed = Math.floor( Math.random()* 7) + 3;
    
    // grab random color
    let color_index = Math.floor(Math.random()*colorArray.length);
    let color = colorArray[color_index];

    // create faller object and push to array
    let new_faller = new Faller( x_pos, y_pos, y_speed, color);
    active_fallers.push(new_faller);
}

// runs fallers and displays the stack
function runFallingStack() {

    // increase difficulty every 300 frames / 10 seconds
    if( frame_count == 300 ) {
        frame_count = 0;
        // increase difficulty
        current_skip++;
    } else {
        frame_count++;
    }
    // make sure frame count does not exceed goal
    if( skip_frame_counter > (max_skip - current_skip) ) {
        skip_frame_counter = 0
    }

    // make sure (max_skip - current_skip) doesnt go lower than 2
    if( current_skip > 13 ) {
        current_skip = 13;
    }

    // skip every XX frames and then add new faller
    console.log(max_skip - current_skip)
    if( skip_frame_counter == (max_skip - current_skip) ) {
        addFaller();
        skip_frame_counter = 0
     } else {
        skip_frame_counter++;
     }


    // display current fallers
    for( const faller of active_fallers ) {
        faller.move();
        faller.display();
        faller.isColliding();
    }

    // control catcher with arrow keys
    if(keyIsDown(LEFT_ARROW))
        catcher_x -= 15
    else if (keyIsDown(RIGHT_ARROW))
        catcher_x += 15
    
    // allow catcher to wrap around the screen
    if( catcher_x - catcher_width/2 > windowWidth )
        catcher_x = -(catcher_width/2)
    else if( catcher_x < -(catcher_width/2) )
        catcher_x = windowWidth + catcher_width/2
    
    displayStack();
}

// displays the faller stack
function displayStack() {
    fill(0);
    let catcher_size = 150;
    rectMode(CENTER);
    rect(catcher_x, windowHeight-bottom_border_factor/2, catcher_size, bottom_border_factor)
    for( let i = 0; i < burger_stack.length; i++ ) {
        burger_stack[i].x_pos = catcher_x;
        burger_stack[i].y_pos = windowHeight - faller_height*i/3 - bottom_border_factor;
        burger_stack[i].display();
    }
}

// controls color goals and score
// resets stack on new point
function runGame() {

    let bar_height = 20;

    rectMode(CORNER)


    // display goal bar
    let single_goal_bar_length = windowWidth / active_goal.length;
    for( i = 0; i < active_goal.length; i++ ) {
        fill(active_goal[i]);
        rect( single_goal_bar_length * i, 0, single_goal_bar_length, bar_height );
    }

    // label goal bar
    fill(0);
    textAlign(CENTER);
    text("GOALS", single_goal_bar_length/2, bar_height/1.4);

    // display enemy bar
    let single_enemy_bar_length = windowWidth / active_enemy.length;
    for( i = 0; i < active_enemy.length; i++ ) {
        fill(active_enemy[i]);
        rect( single_enemy_bar_length * i, bar_height, single_enemy_bar_length, bar_height );
    }

    fill(0)
    text("ENEMIES", single_enemy_bar_length/2, bar_height * 1.8);

    // display score
    fill(255);
    text("Score: " + score, 2 * bar_height, 3 * bar_height)

    // check if goal is met
    if( goals_left <= 0 ) {
        score++;
        burger_stack = [];        
        active_enemy = getRandomColors();
        active_goal = exclusiveRandomColorArray(active_enemy);
        goals_left = active_goal.length;
    }
}

// check if given color is a goal
// if so grey out box and add point
function checkGoal(color) {
    for( let i = 0; i < active_goal.length; i++ ) {
        if( active_goal[i] == color ) {
            // faller is in the goal
            // grey out box
            let goal_index = active_goal.indexOf(color);
            active_goal[goal_index] = '#808080';
            goals_left--;
            score++;
        }
    }
}

// checks if given color is an enemy
// if so stop the program
function checkEnemy(color) {
    for( let i = 0; i < active_enemy.length; i++ ) {
        if( active_enemy[i] == color ) {
            // faller is in the enemy array
            endGame();
        }
    }
}

// generates array of random color hex codes
// array ranges in size from min_colors to max_colors
function getRandomColors() {
    let randomColors = [];
    let arraySize = Math.random() * ( max_colors - min_colors ) + min_colors;
    for( var i = 0; i < arraySize; i++ ) {
        color_index = Math.floor(Math.random()*colorArray.length);
        if( !randomColors.includes(colorArray[color_index]) )
            randomColors.push(colorArray[color_index]);
        else 
            i--;
    }
    return randomColors;
}

// generates array of random color hex codes excluding colors from given array
// array ranges in size from min_colors to max_colors
function exclusiveRandomColorArray( to_exclude ) {
    let randomColors = [];
    let arraySize = Math.random() * ( max_colors - min_colors ) + min_colors;
    for( var i = 0; i < arraySize; i++ ) {
        color_index = Math.floor(Math.random()*colorArray.length);
        if( !randomColors.includes(colorArray[color_index]) && !to_exclude.includes(colorArray[color_index]) )
            randomColors.push(colorArray[color_index]);
        else 
            i--;
    }
    return randomColors;
}

// runs game ending screen
function endGame() {

    play_again_button = createButton('Play Again');

    noLoop();
    imageMode(CENTER);
    image(night_background, width/2, height/2, width, height);
    fill(255);

    play_again_button.position(windowWidth/2,windowHeight/2);
    play_again_button.mousePressed(playAgain)
}

// called when Play Again button is pressed
function playAgain() {
    active_fallers = [];
    burger_stack = [];
    score = 0;
    active_goal = getRandomColors();
    active_enemy = exclusiveRandomColorArray(active_goal);
    goals_left = active_goal.length;
    play_again_button.remove();
    catcher_x = windowWidth / 2
    loop();
}

// Allows catcher to be controlled by mouse when moved
// uses arrowkeys otherwise otherwise
function onMouseMove() {
    var moved = false
    window.onmousemove = function(){
      if(!moved){
          moved = true;
          catcher_x = mouseX;
      }
   }
}

