// ---------- Tile bank definition ----------
// Each tile: id (matches assets/<id>.png), beats (duration), onsets (relative offsets within the tile), name
const TILES = [
  { id:'r6', beats:2, onsets:[0],               name:'Blanche' },
  { id:'r5', beats:2, onsets:[0, 1.5],          name:'Noire pointée + croche' },
  { id:'r4', beats:1, onsets:[0],               name:'Noire' },
  { id:'r3', beats:1, onsets:[0, 0.5],          name:'Deux croches' },
  { id:'r1', beats:1, onsets:[0, 0.5,0.75],     name:'Croches double-double' },
  { id:'r0', beats:1, onsets:[0,0.25,0.5,0.75], name:'Quatre doubles-croches' },
  { id:'r2', beats:1, onsets:[0,0.25,0.5],      name:'Double-double-croche' },
];

// ---------- State ----------
let audioCtx = null;
let numPulsations = 4;
let bpm = 100;
let target = null;       // array of tile objects (the rhythm to guess)
let answer = [];         // array of length numPulsations: null, or {tile, start:true} / {tile, start:false, of}
let selectedSlot = null; // index of the currently selected empty slot, or null
let solutionRevealed = false;

// ---------- DOM refs ----------
const testBtn = document.getElementById('testBtn');
const encoreBtn = document.getElementById('encoreBtn');
const tempoSlider = document.getElementById('tempo');
const nbPulsSlider = document.getElementById('nb-puls');
const effaceBtn = document.getElementById('effaceBtn');
const solutionBtn = document.getElementById('solutionBtn');
const feedbackEl = document.getElementById('feedback');
const bankButtons = [...document.querySelectorAll('[data-tile]')];

const TOTAL_SLOTS = 5; // 4 pulsations max + 1 for the retombée (which can land on slot 5)

const pulsImgs = [0,1,2,3,4].map(i => document.getElementById('puls-img-' + i));
const repCells = [0,1,2,3,4].map(i => ({
  cell: document.getElementById('rep-cell-' + i),
  bg:   document.getElementById('rep-bg-' + i),
  pi:   document.getElementById('rep-pi-' + i),
  tile: document.getElementById('rep-tile-' + i),
}))

const solCells = [0,1,2,3,4].map(i => ({
  cell: document.getElementById('sol-cell-' + i),
  hog:  document.getElementById('sol-hog-' + i),
  tile: document.getElementById('sol-tile-' + i),
}));

// ---------- Helpers ----------
function tileById(id){ return TILES.find(t => t.id === id); }

// ---------- Rendering ----------
function buildPulsRow(){
  for(let i=0;i<TOTAL_SLOTS;i++){
    pulsImgs[i].src = (i === numPulsations) ? 'assets/retombee.png': 'assets/pulsation.png';
  }
  if (numPulsations < 4) pulsImgs[4].src = 'assets/transparent.png';
}

function buildRepRow(){
  for(let i=0;i<TOTAL_SLOTS;i++){
    const c = repCells[i];
    if(i === numPulsations){
      // retombée slot
      c.cell.classList.remove('selected');
      c.bg.style.display = 'none';
      c.pi.style.display = 'none';
      c.tile.style.display = 'block';
      c.tile.src = 'assets/retombee.png';
      c.tile.style.cursor = 'default';
      c.tile.onclick = null;
      continue;
    }
    if(!target || i >= numPulsations){
      // beyond the exercise: hide everything
      c.cell.classList.remove('selected');
      c.bg.style.display = 'none';
      c.pi.style.display = 'none';
      c.tile.style.display = 'none';
      continue;
    }
    const cell = answer[i];
    if(cell && !cell.start){
      // part of a previous multi-beat tile: hide this slot entirely
      if (cell.tile.id === "r6") {
        c.tile.style.display = 'block';
        c.tile.src = 'assets/blanc2.png';
        c.cell.classList.remove('selected');
        c.bg.style.display = 'none';
        c.pi.style.display = 'none';
        continue;}
      if (cell.tile.id === "r5") {
        c.tile.style.display = 'block';
        c.tile.src = 'assets/repR5_2.png';
        c.cell.classList.remove('selected');
        c.bg.style.display = 'none';
        c.pi.style.display = 'none';
        continue;}
      continue;
    }
    if(cell && cell.start){
      c.bg.style.display = 'none';
      c.pi.style.display = 'none';
      c.tile.style.display = 'block';
        if (cell.tile.id === "r6") {
          c.tile.src = 'assets/repR6.png';
          continue;
        }
        if (cell.tile.id === "r5") {c.tile.src = 'assets/repR5.png';
          continue;
        } else {
           c.tile.src = 'assets/' + cell.tile.id + '.png';
        }
      c.tile.style.cursor = 'pointer';
      c.tile.onclick = () => removeTileAt(i);
      c.cell.classList.remove('selected');
    } else {
      c.bg.style.display = 'block';
      c.pi.style.display = 'block';
      c.tile.style.display = 'none';
      c.bg.onclick = () => selectSlot(i);
      c.cell.classList.toggle('selected', i === selectedSlot);
    }
  }
}

function buildSolRow(){
  
  for(let i=0;i<TOTAL_SLOTS;i++){
    const c = solCells[i];
    const c2 = solCells[i+1];
    const c3 = solCells[4];
    if(i === numPulsations){
      c.hog.style.display = 'none';
      c.tile.style.display = 'block';
      c.tile.src = 'assets/retombee.png';
      continue;
    }
    if(solutionRevealed && target){
      if(i >= numPulsations){
        c.tile.style.display = 'none';
        c.hog.style.display = 'block';
        c.hog.className = 'cell-img hedgehog-dim';
        continue;
      }
      const tile = tileForBeat(i);
      if(tile){
        c.hog.style.display = 'none';
        c.tile.style.display = 'block';
        if (tile.id === "r6") {
            c.tile.src = 'assets/repR6.png';

            c2.hog.style.display = 'none';
            c2.tile.style.display = 'block';
            c2.tile.src = 'assets/blanc2.png';
        } else {
          if (tile.id === "r5") {
            c.tile.src = 'assets/repR5.png';

            c2.hog.style.display = 'none';
            c2.tile.style.display = 'block';
            c2.tile.src = 'assets/repR5_2.png';
          } else c.tile.src = 'assets/' + tile.id + '.png';
        }
      } /*else {
        // continuation of a multi-beat tile just before it: hide
        c.hog.style.display = 'none';
        c.tile.style.display = 'none';
      }*/
      continue;
    }
    c.tile.style.display = 'none';
    c.hog.style.display = 'block';
    c.hog.className = 'cell-img hedgehog-dim';
    if (nbPulsSlider.value < 4)  c3.hog.style.display = 'none' ;
  }
}


// Returns the tile that STARTS at beat i in the target sequence, or null
// (returns undefined for a beat that is the continuation of a previous tile)
// Returns the tile that STARTS at beat i in the target sequence, or null
// (returns undefined for a beat that is the continuation of a previous tile)
function tileForBeat(i){
  let cursor = 0;
  for(const tile of target){
    if(cursor === i) return tile;
    if(i > cursor && i < cursor + tile.beats) return null ; // continuation, hide
    cursor += tile.beats;
  }
  return (i < numPulsations) ? null : undefined;
}


// ---------- Bank placement logic ----------
function canPlace(tile, start){
  if(start === null || start === undefined) return false;
  if(start + tile.beats > numPulsations) return false;
  for(let k=0;k<tile.beats;k++){ if(answer[start+k] !== null) return false; }
  return true;
}
function findFirstFit(tile){
  for(let s=0;s<numPulsations;s++){ if(canPlace(tile,s)) return s; }
  return null;
}
function refreshBankAvailability(){
  bankButtons.forEach(btn => {
    const tile = tileById(btn.dataset.tile);
    let fits;
    if(selectedSlot !== null){ fits = canPlace(tile, selectedSlot); }
    else { fits = findFirstFit(tile) !== null; }
    btn.disabled = !target || !fits;
  });
}

function selectSlot(i){
  if(answer[i]) return;
  selectedSlot = (selectedSlot === i) ? null : i;
  buildRepRow();
  refreshBankAvailability();
}

function placeTile(tile, btnEl){
  let start = selectedSlot;
  if(start === null || !canPlace(tile, start)){
    start = findFirstFit(tile);
  }
  if(start === null) return;
  for(let k=0;k<tile.beats;k++){
    answer[start+k] = (k === 0) ? { tile, start:true } : { tile, start:false, of:start };
  }
  selectedSlot = null;
  buildRepRow();
  refreshBankAvailability();
  if(btnEl){
    btnEl.classList.add('tile-highlight');
    setTimeout(() => btnEl.classList.remove('tile-highlight'), 400);
  }
}

function removeTileAt(i){
  const cell = answer[i];
  if(!cell) return;
  const start = cell.start ? i : cell.of;
  const beats = cell.tile.beats;
  for(let k=0;k<beats;k++){ answer[start+k] = null; }
  feedbackEl.textContent = '';
  buildRepRow();
  refreshBankAvailability();
}

// ---------- Answer checking ----------
function flattenOnsets(seq){
  const out = [];
  let cursor = 0;
  seq.forEach(tile => {
    tile.onsets.forEach(o => out.push(+(cursor+o).toFixed(3)));
    cursor += tile.beats;
  });
  return out;
}
function arraysClose(a,b){
  if(a.length !== b.length) return false;
  return a.every((v,i) => Math.abs(v - b[i]) < 0.01);
}
function matchPerBeat(userOnsets, targetOnsets){
  const matches = [];
  for(let b=0;b<numPulsations;b++){
    const u = userOnsets.filter(o => o>=b && o<b+1).length;
    const t = targetOnsets.filter(o => o>=b && o<b+1).length;
    matches.push(u===t);
  }
  return matches;
}
// ---------- Rhythm generation ----------
function generateTarget(beatsNeeded){
  const seq = [];
  let remaining = beatsNeeded;
  const oneBeatTiles = TILES.filter(t => t.beats === 1);
  const twoBeatTiles = TILES.filter(t => t.beats === 2);
  while(remaining > 0){
    let pool;
    if(remaining >= 2 && Math.random() < 0.35){ pool = twoBeatTiles; }
    else { pool = oneBeatTiles; }
    const tile = pool[Math.floor(Math.random()*pool.length)];
    if(tile.beats > remaining) continue;
    seq.push(tile);
    remaining -= tile.beats;
  }
  return seq;
}

// ---------- Audio ----------
function playClick(time, freq, dur=0.09, gain=0.35, type='triangle'){
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

function playSequence(seq, skipCountIn){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const secPerBeat = 60 / bpm;
  const start = audioCtx.currentTime + 0.15;
  const COUNT_IN_BEATS = skipCountIn ? 0 : 4;
  const rhythmStart = start + COUNT_IN_BEATS * secPerBeat;

  // 1) Count-in: 4 clicks, higher pitch, establishes the tempo (skipped on Encore)
  for(let i=0;i<COUNT_IN_BEATS;i++){
    playClick(start + i*secPerBeat, 1500, 0.07, 0.28, 'square');
  }

  // 2) The rhythm itself
  let cursor = 0;
  seq.forEach(tile => {
    tile.onsets.forEach(offset => {
      const t = rhythmStart + (cursor + offset) * secPerBeat;
      playClick(t, 880, 0.08, 0.32);
    });
    cursor += tile.beats;
  });

  // 3) Note de retombée at the end — same high-pitched sound as the count-in
  const landingTime = rhythmStart + numPulsations * secPerBeat;
  playClick(landingTime, 1500, 0.09, 0.32, 'square');
}

// ---------- Reset / flow ----------
function resetExercise(){
  target = null;
  answer = new Array(numPulsations).fill(null);
  selectedSlot = null;
  solutionRevealed = false;
  feedbackEl.textContent = '';
  encoreBtn.disabled = true;
  buildPulsRow();
  buildRepRow();
  buildSolRow();
  refreshBankAvailability();
}

nbPulsSlider.addEventListener('input', () => {
  numPulsations = Number(nbPulsSlider.value);
  resetExercise();
});

tempoSlider.addEventListener('input', () => {
  bpm = Number(tempoSlider.value);
});

testBtn.addEventListener('click', () => {
  answer = new Array(numPulsations).fill(null);
  selectedSlot = null;
  solutionRevealed = false;
  feedbackEl.textContent = '';
  target = generateTarget(numPulsations);
  buildPulsRow();
  buildRepRow();
  buildSolRow();
  refreshBankAvailability();
  playSequence(target);
  encoreBtn.disabled = false;
});

encoreBtn.addEventListener('click', () => {
  if(target) playSequence(target, true);
});

effaceBtn.addEventListener('click', () => {
  answer = new Array(numPulsations).fill(null);
  selectedSlot = null;
  solutionRevealed = false;
  feedbackEl.textContent = '';
  buildRepRow();
  buildSolRow();
  refreshBankAvailability();
});

solutionBtn.addEventListener('click', () => {
  if(!target){
    feedbackEl.textContent = 'Clique d\'abord sur « Test » !';
    feedbackEl.style.color = '#c0392b';
    return;
  }
  const userSeq = answer.filter(c => c && c.start).map(c => c.tile);
  const userOnsets = flattenOnsets(userSeq);
  const targetOnsets = flattenOnsets(target);
  const isJuste = arraysClose(userOnsets, targetOnsets);

  feedbackEl.textContent = isJuste ? '-- JUSTE ! --': '-- FAUX ! --';
  feedbackEl.style.color = isJuste ? '#118002' : '#c0392b';

  solutionRevealed = true;
  buildSolRow();
});

bankButtons.forEach(btn => {
  const tile = tileById(btn.dataset.tile);
  btn.addEventListener('click', () => placeTile(tile, btn));
});

// ---------- Init ----------
numPulsations = Number(nbPulsSlider.value);
bpm = Number(tempoSlider.value);
resetExercise();
