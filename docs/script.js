// Andrew Pratt 2020
// This code uses some bad practice, more of a prototype/just for fun

// Precache sounds
// Global variables suck but this project isn't important enough for me to do it the correct way :)
var sndStartBtn = new Audio("resource/startbtn.wav");
var sndHorse = [
	new Audio("resource/horse0.mp3"),
	new Audio("resource/horse1.mp3"),
	new Audio("resource/horse2.mp3")
];
var sndGameMusic = new Audio("resource/game-music.mp3");
var sndShoot = new Audio("resource/shoot.mp3");
var sndWin = new Audio("resource/win.mp3");

// Evil global variable for timers
var gameTimer;
var horseSndTimer;



// Utility clamp function, like the one in glsl
function clamp(x, minVal, maxVal)
{
	return Math.max( minVal, Math.min(x, maxVal) );
}


// Event handler for game step
function onGameStep(horse, horseVel, horseSndTimer)
{
	// Update horse
	updateHorse(horse, horseVel);
}

// Event handler for playing horse sfx
function onHorseSnd()
{
	// Play a random sound
	sndHorse[ Math.floor( Math.random() * sndHorse.length ) ].play();
}


// Event handler for when start button is clicked
function onStartBtn()
{
	// Play a sound
	sndStartBtn.play();
	
	// Hide the start menu
	$(".startMenuItem").hide();
	// Show game elements
	$(".gameItem").show();
	
	// Store reference to horse
	let horse = $("#horse");
	
	// Declare horse velocity
	// unit is pixels/(time in game steps)
	let horseVel = [0.0, 0.0];
	
	// Setup horse
	horseVel = setupHorse(horse);
	
	// Start playing horse sounds
	horseSndTimer = window.setInterval( onHorseSnd, 600 );
	
	// Start music
	sndGameMusic.play();
	
	// Start game loop
	gameTimer = window.setInterval( function() {onGameStep(horse, horseVel)}, 10, horseSndTimer );
}

// Event handler for when horse is clicked
function onHorseShot()
{
	// Stop game timer
	clearInterval(gameTimer);
	
	// Stop horse sound timer
	clearInterval(horseSndTimer);
	
	// Stop all playing horse sounds
	for (snd of sndHorse)
		snd.pause();
	
	// Stop music
	sndGameMusic.pause();
	
	// Play a sound
	sndShoot.play();
	
	// Hide game elements
	$(".gameItem").hide();
	
	// Show win screen
	$(".winScreen").show();
	
	// Change background
	$("#bg").css("background-image", "url(\"resource/winbg.jpg\")");
	
	// After a delay, show a transition
	setTimeout(startWinScreenTransition, 1000);
}

// Moves horse to random position inside screen bounds
function randomHorsePos(horse)
{
	// Move to random coords, taking image size into account
	horse.offset({
		top:	Math.random() * getMaxTopOffset (horse.height()	),
		left:	Math.random() * getMaxLeftOffset(horse.width()	)
	});
}

// Get x and y speed based on direction and forward speed
// theta: direction in radians
// speed: forward speed (aka magnitude of velocity vector)
function getVelocityVector(theta, speed)
{
	return [
		speed * Math.cos(theta),
		speed * Math.sin(theta)
	];
}

// Get the max top offset an element with a given height can have without going out of bounds
function getMaxTopOffset(len)
{
	return $(document).height() - len;
}
// Get the max left offset an element with a given width can have without going out of bounds
function getMaxLeftOffset(len)
{
	return $(document).width() - len;
}

// Call to transition from the black screen shown after the horse is shot to the win screen
function startWinScreenTransition()
{
	// Play a sound
	sndWin.play();
	
	// Animate the black screen to fade away
	$("#fullscreenBlack").animate({"opacity": 0}, 2500, "linear");
	
}

// Call to setup horse properties
// returns the horse's velocity
// NOTE: returning velocity isn't the best way to implement this by far, but I can write it faster that way
function setupHorse(horse)
{
	// Move to random pos
	randomHorsePos(horse);
	// Return a random velocity
	return getVelocityVector( (Math.random() * 2.0 * Math.PI), 5.0 );
}

// Call to move horse for one step
function updateHorse(horse, horseVel)
{
	// Store the horse's position before moving
	let horseOldOffset = horse.offset();
	
	// Offset the horse's position by it's velocity and store the new position
	horse.offset({
		top:	horseOldOffset.top  + horseVel[1],
		left:	horseOldOffset.left + horseVel[0]
	});
	let horseNewOffset = horse.offset();
	
	// If the horse's y position is out of bounds...
	if (horseNewOffset.top < 0.0 || horseNewOffset.top > getMaxTopOffset(horse.height()) )
	{
		// ...move it back inside
		horse.offset({
			top:	clamp( horseNewOffset.top, 0, getMaxTopOffset(horse.height()) ),
			left:	horseNewOffset.left
		});
		
		// Invert the horse's y-velocity so that it "bounces"
		horseVel[1] = -horseVel[1];

		// Update horseNewOffset
		horseNewOffset.top = horse.offset().top;
	}
	
	// If the horse's x position is out of bounds...
	if (horseNewOffset.left < 0.0 || horseNewOffset.left > getMaxLeftOffset(horse.width()) )
	{
		// ...move it back inside
		horse.offset({
			top:	horseNewOffset.top,
			left:	clamp( horseNewOffset.left, 0, getMaxLeftOffset(horse.width()) )
		});
		
		// Invert the horse's x-velocity so that it "bounces"
		horseVel[0] = -horseVel[0];
	}
}

// Main
function main()
{
	// Bind events
	$("#startBtn").click(onStartBtn);
	$("#horse").click(onHorseShot);
}

// Run main when ready
$(document).ready(main);