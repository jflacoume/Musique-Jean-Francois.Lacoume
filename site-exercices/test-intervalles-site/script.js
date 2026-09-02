let phase = false;
let listTest = [];
let interv = "0";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

document.addEventListener('click', function(event) {
    const bouton = event.target ;
    const etat = bouton.getAttribute("etat");

    // Réinitianilisation
    if (bouton.id === "recommencer") {
        location.reload();
        phase = false;
    }
    //(!phase) correspond à la phase 0, de séléction des intervalles à tester.
    else if (!phase) {
        // Sélection 1 par 1
        if (etat !== "2" && bouton.matches(".grosBouton_int")) {
        bouton.style.backgroundColor = (etat === "1") ? "yellowgreen" : "rgb(220, 213, 23)" ;
        bouton.setAttribute("etat",(etat === "1") ? "0" : "1");
        } 
        //Selectionne ou déselectionne tous les intervalles en même temps
        else  if (bouton.id === "selectAll" && etat !== "2") {
            all1(bouton.getAttribute("etat"));
            bouton.setAttribute("etat",(etat === "1") ? "0" : "1");
            bouton.style.backgroundColor = (etat === "0") ? "yellowgreen" : "rgb(220, 213, 23)" ;
        } 
           // Validation du choix
        else if (bouton.id === "validChoix") {
            listTest = [];
            for (let i = 0; i<= 12; i++) {
                const bt1= document.getElementById(i);
                const etat1 = bt1.getAttribute("etat");
                if (etat1 === "1") listTest.push(bt1.id);
                bt1.style.backgroundColor = (etat1 === "1") ? "cornsilk" : "transparent";
                bt1.style.fontWeight = (etat1 === "1") ? "900" : "300";
                phase = true;
            }
        }
    }
    // phase du test
    else {
        const bt_bon = document.getElementById("bon");
        const bt_mauvais = document.getElementById("mauvais");
        const start =audioCtx.currentTime + 0.15 ;

        
    
        if (bouton.id === "test") {
            const noteDep = Math.floor(Math.random()*40) + 45 ;
            const mouv = Math.random() < 0.5 ? 1 : -1 ;
            interv = listTest[Math.floor(Math.random()*listTest.length)] ;
            const freq1 = Tone.mtof(noteDep) ;
            const freq2 = Tone.mtof(noteDep + mouv*interv) ;
            bt_bon.style.backgroundColor = "transparent";
            bt_bon.style.color = "transparent";
            bt_mauvais.style.backgroundColor = "transparent";
            bt_mauvais.style.color = "transparent";
            playClick(start, freq1);
            playClick(start+0.5, freq2);
            
        }
        else if (bouton.matches(".grosBouton_int")) {
            if (interv === (bouton.id)) {
                bt_bon.style.backgroundColor = "chartreuse";
                bt_bon.style.color = "rgb(43, 67, 226)";
            } else {
                bt_mauvais.style.backgroundColor = "red";
                bt_mauvais.style.color = "rgb(43, 67, 226)";
            }
        }
    }
        
})

// (De-)Selectionne tous les intervalles
function all1 (x){
    for (let i = 0; i<= 12; i++) {
        const bt3= document.getElementById(i);
        
        bt3.setAttribute ("etat", x) ;
        bt3.style.backgroundColor = (bt3.getAttribute("etat") === "1") ? "rgb(220, 213, 23)" : "yellowgreen" ;
        
    }
}


//Joue une note avec Tone.js
function playClick(time, freq, dur=1, gain=0.35, type='square'){
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

