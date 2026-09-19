
const range = [13, 25, 49, 88];
const depart = [60, 48, 36, 21];
let r = 0;
let noteDep = 60 ;
let note = 60;

var selectedPreset=_tone_0000_JCLive_sf2_file;
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player=new WebAudioFontPlayer();
player.loader.decodeAfterLoading(audioContext, '_tone_0000_JCLive_sf2_file');
	
document.addEventListener('click', function(event) {
    const bouton = event.target ;
	const clavier = document.getElementById("clavier");
	if (bouton.id <= 3) {for (let i = 0; i<4; i++) {
		const bt1= document.getElementById(i);
		const clavier = document.getElementById("clavier");
		bt1.style.backgroundColor = "transparent";
	}
	bouton.style.backgroundColor = "cornsilk";
	console.log("./assets/piano"+bouton.id+".png");
	clavier.src= "./assets/piano"+bouton.id+".png";
	r = range[bouton.id] ;
	noteDep = depart[bouton.id] ;
	
}
if (bouton.id === "4" ) {

	note = parseInt(Math.floor(Math.random() * r) + noteDep) ;
	player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, 0, note, 2);
}
if (bouton.id === "5") player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, 0, note, 2);
})