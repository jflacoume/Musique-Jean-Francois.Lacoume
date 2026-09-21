
    function pgcd(a, b) {
  if (b === 0) {
    return a;
  }
  return pgcd(b, a % b);
}

function ppcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / pgcd(a, b);
}

var nb1 = 1;
var nb2 = 1;

let bt = document.querySelector("button") ;
bt.addEventListener("click", () => {
    document.querySelector('.container1').innerHTML = '';
    document.querySelector('.container2').innerHTML = 'Travaillons les multiplets !';
    document.querySelector('.container3').innerHTML = '';
    document.getElementById('ppcm').textContent = " " ;
    document.getElementById("nombre1").selectedIndex = 0;
    document.getElementById("nombre2").selectedIndex = 0;
    document.getElementById("vpm").selectedIndex = 0;
});


function affiche(x,y) {
   document.querySelector('.container1').innerHTML = '';
    document.querySelector('.container2').innerHTML = '';
    document.querySelector('.container3').innerHTML = '';
  const el1 = document.querySelector('.container1')
    for (let i = 0; i < ppcm(x, y); i++){
        const maDiv = document.createElement("div") ;
        maDiv.className = 'graduation';
        if (i % x === 0) {
            maDiv.textContent = "▼" ;
        } else {
            maDiv.textContent = "" ;
        }
        el1.appendChild(maDiv);
    } ;

  const el3 = document.querySelector('.container3')
    for (let i = 0; i < ppcm(x, y); i++){
        const maDiv = document.createElement("div") ;
        maDiv.className = 'graduation';
        if (i % y === 0) {
            maDiv.textContent = "▲" ;
        } else {
            maDiv.textContent = "" ;
        }
        el3.appendChild(maDiv);
    } ;

    const el2 = document.querySelector('.container2')
    for (let i = 0; i < ppcm(x, y); i++){
        const maDiv = document.createElement("div") ;
        maDiv.className = 'graduation';
        maDiv.setAttribute("style", "font-size: 10px;");
        maDiv.textContent =i % x +1;
        el2.appendChild(maDiv);
    } ;
}

const select1 = document.getElementById('nombre1');
select1.addEventListener("change", (event) => {
nb1 = event.target.value;
document.getElementById('ppcm').textContent = " " + ppcm(nb1, nb2) ;
affiche(nb1,nb2);

});

const select2 = document.getElementById('nombre2');
select2.addEventListener("change", (event) => {
  nb2 = event.target.value;
  document.getElementById('ppcm').textContent = " " + ppcm(nb1, nb2) ;
  affiche(nb1,nb2);

});

const select3 = document.getElementById('vpm');
select3.addEventListener("change", (event) => {
  vpmvalue = event.target.value;
  if (vpmvalue === "1"){  affiche(nb1,nb2);

  } else {  affiche(nb2,nb1);
  }
});

