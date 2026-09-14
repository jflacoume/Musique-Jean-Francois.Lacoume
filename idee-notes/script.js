    const choixNotes= document.getElementById("nb-puls");
    let nombreDeNotes = "5";
    let iteration = 1;
    const listeNotes = ["DO", "RE", "MI", "FA", "SOL", "LA", "SI"]
   

    document.addEventListener('click', function(event) {
        const bouton = event.target ;
        const etat = bouton.getAttribute("etat");

        // Réinitianilisation
        if (bouton.id === "nb-puls"){
            nombreDeNotes = parseInt(choixNotes.value);
       
            for (let i =  1; i <= 5; i++) {
                const bt1= document.getElementById(i);
                bt1.style.backgroundColor = (i < nombreDeNotes +1) ? "cornsilk" : "transparent";
            }
        }
        else if (bouton.id === "recommencer") {
            location.reload();
        }
        else if ((bouton.id === "lance-de" || "de") && iteration <= nombreDeNotes){
            note = Math.floor(Math.random() * 7);
            console.log(listeNotes[note]);
            const bt1= document.getElementById(iteration);
            bt1.textContent = listeNotes[note];
            iteration ++;
        }
        })

