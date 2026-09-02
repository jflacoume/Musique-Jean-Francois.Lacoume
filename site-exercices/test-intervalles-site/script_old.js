
const tousSelect = document.getElementById("selectAll");
const valide = document.getElementById("validChoix");
const phaseTest = valide.getAttribute("etat");
const recommencer = document.getElementById ("recommencer");
const test = document.getElementById("test");
var interv ="0" ;
// liste des items choisis pour le test
const listTest = [] ;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


//Selectionne ou de-éselectionne tous les intervalles en fonction du seul bouton Tous/aucun
tousSelect.addEventListener('click', () =>  {
    let etat = tousSelect.getAttribute("etat");
    if (valide.getAttribute("etat") === "1") {
        all1(tousSelect.getAttribute("etat"));
        tousSelect.setAttribute("etat",(etat === "1") ? "0" : "1");
        tousSelect.style.backgroundColor = (etat === "0") ? "yellowgreen" : "rgb(220, 213, 23)" ;
    }
});

/*Valide la sélection pour le test*/
valide.addEventListener('click', () =>  {
    if (valide.getAttribute("etat") === "1") {
        for (let i = 0; i<= 12; i++) {
            let bt1= document.getElementById(i);
            let etat1 = bt1.getAttribute("etat");   
            bt1.setAttribute("etat",(etat1 === "1")||(etat1 === "2") ? "2" : "0");
            if (bt1.getAttribute("etat") === "0") {
                etat1 = "3";
                bt1.setAttribute("etat", etat1);
            }
        }
        for (let j = 0; j<=12; j++){
            let btTest = document.getElementById(j);
            let etatTest = btTest.getAttribute("etat");
            if (etatTest === "2") {
                btTest.style.backgroundColor = "cornsilk";
                btTest.style.fontWeight = "900";
                listTest.push(btTest.id); // remplis le tableau des items du test
            } else {
        btTest.style.backgroundColor = "transparent";
        btTest.style.fontWeight = "300";
            }    
        }
    console.log(listTest);
    valide.setAttribute("etat","0");
    test.setAttribute("etat","1");
    }
});
recommencer.addEventListener('click', () =>  {
    location.reload();
    });

/*Selectionne ou déselectionne un seul intervalle*/  
document.addEventListener('click', function(event) {
    // Vérifie si l'élément cliqué est un bouton
    if (event.target.matches(".grosBouton_int")) {
        let bt2 = event.target;
        let etat2 = bt2.getAttribute("etat");
        if (etat2 !== "2"  && valide.getAttribute("etat") === "1") {
        bt2.style.backgroundColor = (etat2 === "1") ? "yellowgreen" : "rgb(220, 213, 23)" ;
        bt2.setAttribute("etat",(etat2 === "1") ? "0" : "1");
       }
    }
}) ;

function all1 (x){
    for (let i = 0; i<= 12; i++) {
        let bt3= document.getElementById(i);
        
        bt3.setAttribute ("etat", x) ;
        bt3.style.backgroundColor = (bt3.getAttribute("etat") === "1") ? "rgb(220, 213, 23)" : "yellowgreen" ;
        
    }
}

// Phase test
// joue le test quand on clique sur le bouton TES

test.addEventListener("click", () => {
    const start =audioCtx.currentTime + 0.15 ;
    const noteDep = Math.floor(Math.random()*40) +40 ;
    interv = listTest[Math.floor(Math.random()*listTest.length)] ;
    const mouv = Math.random() < 0.5 ? 1 : -1 ;
    const freq1 = Tone.mtof(noteDep) ;
    const freq2 = Tone.mtof(noteDep + mouv*interv) ;
    let bt_bon = document.getElementById("bon");
    let bt_mauvais = document.getElementById("mauvais");

    // init. des boutons resultat
    bt_bon.style.backgroundColor = "transparent";
    bt_bon.style.color = "transparent";
    bt_mauvais.style.backgroundColor = "transparent";
    bt_mauvais.style.color = "transparent";
    
    if (test.getAttribute("etat") === "1") {
        playClick(start, freq1);
        playClick(start+0.5, freq2);
        console.log(noteDep+"   "+interv +"   "+ mouv);
        }

});

//recupere le resultat
document.addEventListener('click', function(event) {
    let bt_bon = document.getElementById("bon");
    let bt_mauvais = document.getElementById("mauvais");
    // Vérifie si l'élément cliqué est un bouton 
        if (event.target.matches(".grosBouton_int")) {
            if (interv === (event.target.id)) {
                bt_bon.style.backgroundColor = "chartreuse";
                bt_bon.style.color = "rgb(43, 67, 226)";
            } else {
                bt_mauvais.style.backgroundColor = "red";
                bt_mauvais.style.color = "rgb(43, 67, 226)";
            } 
        } 
    }
) ;
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

