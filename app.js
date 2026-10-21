import {levels,puzzleCount,puzzlesPerLevel,questions,facts,categories,illustrations,quizPool,quizRound,makePuzzle,puzzleLevel,idsForLevel,wordCells,cellKey,puzzleSolved} from './library.js';

const $ = selector => document.querySelector(selector);
const app = $('#app');
const paths = {
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 puzzle:'<path d="M8 3H4a1 1 0 0 0-1 1v4a2 2 0 1 1 0 4v8a1 1 0 0 0 1 1h5a2 2 0 1 0 4 0h7a1 1 0 0 0 1-1v-6a2 2 0 1 1 0-4V4a1 1 0 0 0-1-1h-8a2 2 0 1 1-4 0z"/>',
 quiz:'<path d="M9 18h6m-5 3h4M9 14c-1.5-1-3-2.6-3-5a6 6 0 1 1 12 0c0 2.4-1.5 4-3 5-.7.5-1 1-1 2h-4c0-1-.3-1.5-1-2z"/>',
 facts:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v14"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="m15 18-6-6 6-6"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 check:'<path d="m4 12 5 5L20 6"/>',close:'<path d="M5 5 19 19M19 5 5 19"/>',
 spark:'<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7zM19 17l.6 2.4L22 20l-2.4.6L19 23l-.6-2.4L16 20l2.4-.6z"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5M5.6 9A7 7 0 0 1 18 6l2 1M4 17l2 1a7 7 0 0 0 12.4-3"/>'
};
const icon=(name,size=24)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function read(key,fallback){try{return JSON.parse(localStorage.getItem('ww-'+key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem('ww-'+key,JSON.stringify(value))}catch{toast('Dein Browser kann den Fortschritt gerade nicht speichern.')}}
const storedLevel=(key)=>Object.hasOwn(levels,read(key,'easy'))?read(key,'easy'):'easy';
const state={
 view:'home',puzzle:null,puzzleLevel:storedLevel('puzzle-level'),puzzlePage:0,entries:{},selectedWord:0,selectedCell:0,checked:false,hints:{letters:0,words:0},
 completed:read('completed',[]),quizLevel:storedLevel('quiz-level'),quizCategory:'Alle',quizSize:10,round:[],quizIndex:0,chosen:null,score:0,quizDone:false,
 factId:0,factCategory:'Alle',modal:null,savedFacts:read('savedFacts',[])
};
let dockObserver;
const action=(name,value='')=>`data-action="${name}" data-value="${esc(value)}"`;
function imageFor(category,cls='',loading='lazy'){
 const [file,alt]=illustrations[category]||illustrations.Wissenschaft;
 return `<img class="${cls}" src="assets/${file}.webp" alt="${esc(alt)} – Themenillustration" loading="${loading}" width="960" height="640">`;
}
function nav(){return `<nav class="bottom-nav" aria-label="Hauptnavigation">${[['home','Start'],['puzzles','Rätsel'],['quiz','Quiz'],['facts','Fakten']].map(([v,label])=>{
 const active=state.view===v||state.view==='puzzle'&&v==='puzzles';
 return `<button class="nav-item ${active?'active':''}" ${action('nav',v)} ${active?'aria-current="page"':''}>${icon(v==='puzzles'?'puzzle':v==='home'?'home':v==='quiz'?'quiz':'facts',25)}<span>${label}</span></button>`;
 }).join('')}</nav>`}
function shell(content,cls=''){
 dockObserver?.disconnect();app.innerHTML=`<div class="app-shell ${cls}">${content}${nav()}</div>`;
 const dock=$('.puzzle-dock');
 if(dock){dockObserver=new ResizeObserver(entries=>document.documentElement.style.setProperty('--dock-height',(entries[0].borderBoxSize?.[0]?.blockSize??dock.offsetHeight)+'px'));dockObserver.observe(dock);document.documentElement.style.setProperty('--dock-height',dock.offsetHeight+'px')}
 if(state.modal)requestAnimationFrame(()=>$('#close-modal')?.focus());
}
function topbar(title,back='home',right=''){return `<header class="topbar"><button class="icon-btn" ${action('nav',back)} aria-label="Zurück">${icon('back')}</button><h1>${esc(title)}</h1>${right||'<span class="topbar-spacer"></span>'}</header>`}
function levelControl(selected,kind){return `<div class="level-switch" role="group" aria-label="Schwierigkeit">${Object.entries(levels).map(([level,label])=>`<button ${action(kind,level)} aria-pressed="${selected===level}" class="${selected===level?'active':''}"><span class="level-dots" aria-hidden="true">${'●'.repeat(Object.keys(levels).indexOf(level)+1)}</span>${label}</button>`).join('')}</div>`}
function navigate(view){state.modal=null;state.view=view;render();window.scrollTo(0,0)}
function renderHome(){shell(`<header class="brandbar"><div class="brand">WISSENWELT<span class="brand-rays">✦</span></div><div class="avatar">${icon('spark',21)}</div></header><main class="home-main"><div class="home-hero"><h1>Heute wird’s<br><em>spannend.</em></h1><img src="assets/learner.webp" alt="Neugierige Lernende"></div><div class="home-cards"><button class="feature-card card-puzzle" ${action('nav','puzzles')}><span><strong>Kreuzworträtsel</strong><small>${puzzleCount} Rätsel · 3 Schwierigkeitsstufen</small><b class="round-arrow">${icon('arrow',25)}</b></span><img src="assets/crossword.webp" alt=""></button><button class="feature-card card-quiz" ${action('nav','quiz')}><span><strong>Quiz</strong><small>${questions.length} Fragen. Von leicht bis knifflig.</small><b class="round-arrow">${icon('arrow',25)}</b></span><img src="assets/quiz.webp" alt=""></button><button class="feature-card card-facts" ${action('nav','facts')}><span><strong>Fakten-Feed</strong><small>${facts.length} Wissenshäppchen zum Entdecken.</small><b class="round-arrow">${icon('arrow',25)}</b></span><img src="assets/saturn.webp" alt=""></button></div><div class="progress-note">${icon('spark',19)}<span>${state.completed.length?`${state.completed.length} Rätsel gelöst – weiter so!`:'Bleib neugierig. Jeden Tag ein bisschen mehr.'}</span></div><div class="discovery-strip">${imageFor('Natur')}${imageFor('Geografie')}${imageFor('Kultur')}</div></main>`,'home-view')}
function renderPuzzles(){
 const ids=idsForLevel(state.puzzleLevel),start=state.puzzlePage*20,pageIds=ids.slice(start,start+20),solved=ids.filter(id=>state.completed.includes(id)).length;
 shell(`${topbar('Kreuzworträtsel')}<main class="puzzles-main"><section class="section-intro"><h2>Ein bisschen<br><span>um die Ecke denken.</span></h2><p>${puzzleCount} Rätsel. Wähle deine Stufe und leg los.</p></section><div class="puzzle-cover">${imageFor(state.puzzleLevel==='hard'?'Wissenschaft':state.puzzleLevel==='medium'?'Kultur':'Geografie','', 'eager')}</div>${levelControl(state.puzzleLevel,'puzzle-level')}<p class="level-description">${{easy:'Vertraute Begriffe, klare Hinweise. Perfekt zum Warmwerden.',medium:'Mehr Zusammenhänge und Fachbegriffe. Zeit zum Grübeln.',hard:'Präzise Hinweise und Spezialwissen. Für neugierige Köpfe.'}[state.puzzleLevel]}</p><div class="puzzle-list-header"><span>${puzzlesPerLevel} Rätsel · ${levels[state.puzzleLevel]}</span><span>${solved} gelöst</span></div><div class="puzzle-list">${pageIds.map(id=>`<button class="puzzle-row" ${action('open-puzzle',id)}><span class="puzzle-no">${String(id).padStart(3,'0')}</span><span class="puzzle-row-text"><strong>Rätsel ${id}</strong><small>${levels[state.puzzleLevel]} · Bunte Wissensmischung</small></span><span class="status-icon ${state.completed.includes(id)?'done':''}">${icon(state.completed.includes(id)?'check':'arrow',20)}</span></button>`).join('')}</div><div class="pagination"><button ${action('puzzle-page',-1)} ${state.puzzlePage===0?'disabled':''}>Zurück</button><span>${state.puzzlePage+1} / 10</span><button ${action('puzzle-page',1)} ${state.puzzlePage===9?'disabled':''}>Weiter</button></div></main>`);
}
function openPuzzle(id){state.puzzle=makePuzzle(id);state.puzzleLevel=state.puzzle.level;state.entries=read('puzzle-'+id,{});state.hints=read('hints-'+id,{letters:0,words:0});state.selectedWord=0;state.selectedCell=0;state.checked=false;navigate('puzzle')}
const selected=()=>state.puzzle.words[state.selectedWord];
function isWordSolved(word){return wordCells(word).every(([r,c],i)=>state.entries[cellKey(r,c)]===word.word[i])}
function renderPuzzle(){
 const p=state.puzzle,w=selected(),cells=wordCells(w),active=new Set(cells.map(([r,c])=>cellKey(r,c))),current=cellKey(...cells[state.selectedCell]);
 const numbers={};p.words.forEach(word=>numbers[cellKey(word.row,word.col)]=word.number);
 const cols=p.grid[0].length,rows=p.grid.length;
 const widthSize=Math.floor((Math.min(window.innerWidth,480)-36-(cols-1)*2)/cols);
 const dockEstimate=window.innerHeight<=720?285:330;
 const heightSize=Math.floor((window.innerHeight-dockEstimate-77-160-(rows-1)*2)/rows);
 const size=Math.min(widthSize,Math.max(19,Math.min(34,heightSize)));
 const done=puzzleSolved(p,state.entries),assisted=state.hints.letters+state.hints.words>0;
 shell(`${topbar('Rätsel '+p.id,'puzzles',`<button class="icon-btn" ${action('reset-puzzle')} aria-label="Rätsel zurücksetzen">${icon('refresh',21)}</button>`)}<main class="puzzle-main"><div class="puzzle-meta"><span>${levels[p.level]} · ${p.words.length} Begriffe</span><span>${done?'✓ Gelöst'+(assisted?' mit Hilfe':''):p.words.filter(isWordSolved).length+' von '+p.words.length+' gelöst'}</span></div><div class="board-clue"><b>${w.number} ${w.dir==='across'?'→':'↓'}</b><span>${esc(w.clue)}</span></div><div class="grid-wrap"><div class="crossword-grid" role="group" aria-label="Kreuzworträtsel ${p.id}" style="--cols:${cols};--cell:${size}px">${p.grid.map((row,r)=>row.map((letter,c)=>{
  if(!letter)return '<div class="cell empty" aria-hidden="true"></div>';
  const k=cellKey(r,c),wrong=state.checked&&state.entries[k]&&state.entries[k]!==letter;
  return `<button class="cell playable ${active.has(k)?'in-word':''} ${k===current?'current':''} ${wrong?'wrong':''}" ${action('cell',k)} aria-label="Zeile ${r+1}, Spalte ${c+1}${numbers[k]?', Hinweis '+numbers[k]:''}: ${state.entries[k]||'leer'}" aria-pressed="${k===current}">${numbers[k]?`<span class="cell-no">${numbers[k]}</span>`:''}<span class="cell-letter">${state.entries[k]||''}</span></button>`
 }).join('')).join('')}</div></div><p class="grid-help">Tippe ein Feld an. An Kreuzungen erneut tippen, um die Richtung zu wechseln. Umlaute: AE, OE, UE; ß: SS.</p><div class="clue-list-title">Alle Hinweise</div><div class="clue-list">${[...p.words].sort((a,b)=>a.number-b.number||a.dir.localeCompare(b.dir)).map(word=>{const i=p.words.indexOf(word);return `<button class="clue-row ${i===state.selectedWord?'selected':''}" ${action('word',i)}><span>${word.number} ${word.dir==='across'?'→':'↓'}</span><span>${esc(word.clue)}</span><small>${isWordSolved(word)?'✓':`(${word.word.length})`}</small></button>`}).join('')}</div></main><section class="puzzle-dock" aria-label="Ausgewählter Hinweis und Tastatur"><div class="dock-clue"><div class="clue-heading"><span>${w.number} · ${w.dir==='across'?'Waagerecht':'Senkrecht'}</span><small>${w.word.length} Buchstaben ${isWordSolved(w)?'· ✓':''}</small></div><p id="selected-clue">${esc(w.clue)}</p><div class="answer-slots" style="--letters:${w.word.length}" aria-label="Aktuelles Wort">${cells.map(([r,c],i)=>`<button class="slot ${i===state.selectedCell?'selected':''}" ${action('slot',i)} aria-label="Buchstabe ${i+1}: ${state.entries[cellKey(r,c)]||'leer'}">${state.entries[cellKey(r,c)]||'·'}</button>`).join('')}</div><div class="dock-help"><button ${action('reveal-letter')}>${icon('spark',15)} Buchstabe</button><button ${action('reveal-word')}>${icon('facts',15)} Ganzes Wort</button><button ${action('check')}>${icon('check',15)} Prüfen</button></div></div><div class="letter-keyboard" aria-label="Buchstabentastatur">${['QWERTZUIOP','ASDFGHJKL','YXCVBNM'].map(row=>`<div class="key-row">${[...row].map(ch=>`<button ${action('letter',ch)}>${ch}</button>`).join('')}</div>`).join('')}<div class="key-row action-row"><button ${action('backspace')} aria-label="Buchstabe löschen">⌫ Löschen</button><button ${action('next-word')}>Nächstes Wort ${icon('arrow',15)}</button></div></div></section>`,'puzzle-view');
}
function selectCell(value){
 const [r,c]=value.split(',').map(Number),currentCells=wordCells(selected()),same=currentCells[state.selectedCell]?.join(',')===value;
 const matches=state.puzzle.words.map((w,i)=>({w,i})).filter(({w})=>wordCells(w).some(([rr,cc])=>rr===r&&cc===c));
 const chosen=matches.find(({i})=>same?i!==state.selectedWord:i===state.selectedWord)||matches[0];
 state.selectedWord=chosen.i;state.selectedCell=wordCells(chosen.w).findIndex(([rr,cc])=>rr===r&&cc===c);renderPuzzle();
}
function persistPuzzle(){
 save('puzzle-'+state.puzzle.id,state.entries);save('hints-'+state.puzzle.id,state.hints);
 const done=puzzleSolved(state.puzzle,state.entries),was=state.completed.includes(state.puzzle.id);
 if(done&&!was){state.completed.push(state.puzzle.id);toast('Geschafft! Alle Begriffe gelöst. 🎉')}
 if(!done&&was)state.completed=state.completed.filter(id=>id!==state.puzzle.id);
 save('completed',state.completed);
}
function enterLetters(value){
 const chars=value.toUpperCase().replaceAll('Ä','AE').replaceAll('Ö','OE').replaceAll('Ü','UE').replaceAll('ẞ','SS').replace(/[^A-Z]/g,'');
 const cells=wordCells(selected());
 for(const ch of chars){const [r,c]=cells[state.selectedCell];state.entries[cellKey(r,c)]=ch;if(state.selectedCell<cells.length-1)state.selectedCell++;else break}
 state.checked=false;persistPuzzle();renderPuzzle();
}
function revealLetter(){
 const cells=wordCells(selected()),indices=Array.from({length:cells.length},(_,i)=>(state.selectedCell+i)%cells.length);
 const index=indices.find(i=>{const [r,c]=cells[i];return state.entries[cellKey(r,c)]!==selected().word[i]});
 if(index===undefined){toast('Dieses Wort ist schon richtig.');return}
 const [r,c]=cells[index];state.selectedCell=index;state.entries[cellKey(r,c)]=selected().word[index];state.hints.letters++;persistPuzzle();renderPuzzle();
}
function revealWord(){wordCells(selected()).forEach(([r,c],i)=>state.entries[cellKey(r,c)]=selected().word[i]);state.hints.words++;persistPuzzle();renderPuzzle();toast('Lösung: '+selected().word)}
function eraseLetter(){const cells=wordCells(selected());let [r,c]=cells[state.selectedCell];if(!state.entries[cellKey(r,c)]&&state.selectedCell>0){state.selectedCell--;[r,c]=cells[state.selectedCell]}delete state.entries[cellKey(r,c)];state.checked=false;persistPuzzle();renderPuzzle()}
function checkPuzzle(){state.checked=true;let total=0,correct=0;state.puzzle.grid.forEach((row,r)=>row.forEach((letter,c)=>{if(letter){total++;if(state.entries[cellKey(r,c)]===letter)correct++}}));renderPuzzle();toast(`${correct} von ${total} Buchstaben richtig.`)}
function quizConfig(){state.round=[];state.quizDone=false;state.chosen=null;renderQuiz();window.scrollTo(0,0)}
function startQuiz(){
 const pool=quizPool(state.quizLevel,state.quizCategory);if(!pool.length)return;
 state.round=quizRound(pool,state.quizSize,read('recent-questions',[]));state.quizIndex=0;state.score=0;state.chosen=null;state.quizDone=false;
 renderQuiz();window.scrollTo(0,0);
}
function renderQuiz(){
 if(!state.round.length){
  const available=quizPool(state.quizLevel,state.quizCategory).length,count=Math.min(state.quizSize,available);
  shell(`${topbar('Quiz')}<main class="quiz-start"><div class="quiz-cover">${imageFor(state.quizLevel==='hard'?'Wissenschaft':state.quizLevel==='medium'?'Kultur':'Natur','', 'eager')}</div><h2>Wie knifflig<br><em>darf’s werden?</em></h2><p>${questions.length} Fragen mit Erklärungen. Jede Runde wird neu gemischt.</p><div class="quiz-options"><h3>Schwierigkeit</h3>${levelControl(state.quizLevel,'quiz-level')}<h3>Rundenlänge</h3><div class="segmented">${[10,20].map(n=>`<button ${action('quiz-size',n)} class="${state.quizSize===n?'active':''}" aria-pressed="${state.quizSize===n}">${n} Fragen</button>`).join('')}</div><h3><label for="quiz-category">Thema</label></h3><select id="quiz-category">${categories.map(c=>`<option ${state.quizCategory===c?'selected':''}>${esc(c)}</option>`).join('')}</select><p class="pool-note">${available} Fragen in dieser Auswahl.${available<state.quizSize?` Deine Runde enthält alle ${available} Fragen dieser Auswahl.`:''}</p></div><button class="primary-btn" ${action('start-quiz')} ${!count?'disabled':''}>${count} Fragen starten ${icon('arrow',20)}</button></main>`,'quiz-view');
  $('#quiz-category').onchange=e=>{state.quizCategory=e.target.value;renderQuiz()};return;
 }
 if(state.quizDone){
  const pct=Math.round(state.score/state.round.length*100);
  shell(`${topbar('Dein Ergebnis','home')}<main class="quiz-result"><div class="result-circle">${pct}<span>%</span></div><h2>${pct>=80?'Stark gemacht!':pct>=50?'Gut gespielt!':'Wieder etwas gelernt!'}</h2><p>${state.score} von ${state.round.length} Fragen richtig · ${levels[state.quizLevel]}</p><p>Die nächste Runde bevorzugt Fragen, die du noch nicht gesehen hast.</p><div class="result-actions"><button class="primary-btn" ${action('start-quiz')}>Neue Runde ${icon('arrow',20)}</button><button class="text-btn" ${action('quiz-config')}>Stufe oder Thema ändern</button></div><div class="result-art">${imageFor(state.round[0].category)}</div></main>`,'quiz-view');return;
 }
 const q=state.round[state.quizIndex],answered=state.chosen!==null;
 shell(`${topbar('Quiz','quiz-config')}<main class="quiz-play"><div class="quiz-progress"><span>Frage ${state.quizIndex+1} von ${state.round.length}</span><span>${levels[q.level]} · ${q.category}</span></div><div class="progress-track"><i style="width:${(state.quizIndex+1)/state.round.length*100}%"></i></div><figure class="question-figure">${imageFor(q.category,'','eager')}<figcaption>Themenbild · ${q.category}</figcaption></figure><h2>${esc(q.prompt)}</h2><div class="answer-options">${q.options.map((answer,i)=>`<button ${action('answer',i)} class="answer ${answered?(i===q.answer?'correct':i===state.chosen?'incorrect':''):''}" ${answered?'disabled':''}><span class="answer-letter">${'ABCD'[i]}</span><span>${esc(answer)}</span>${answered&&i===q.answer?icon('check',20):''}</button>`).join('')}</div>${answered?`<section class="explanation" aria-live="polite"><div class="explanation-heading">${state.chosen===q.answer?'Richtig!':'Die richtige Antwort: '+esc(q.options[q.answer])}</div><p>${esc(q.explanation)}</p><div class="extra-fact">${icon('spark',18)}<span>${esc(q.extra)}</span></div></section><button class="primary-btn next-btn" ${action('next-question')}>${state.quizIndex===state.round.length-1?'Ergebnis ansehen':'Nächste Frage'} ${icon('arrow',20)}</button>`:''}</main>`,'quiz-view');
}
function answerQuiz(index){if(state.chosen!==null)return;state.chosen=index;const q=state.round[state.quizIndex];if(index===q.answer)state.score++;save('recent-questions',[...new Set([...read('recent-questions',[]),q.id])]);renderQuiz();requestAnimationFrame(()=>$('.explanation')?.scrollIntoView({block:'nearest',behavior:'smooth'}))}
function nextQuestion(){if(state.chosen===null)return;if(state.quizIndex===state.round.length-1)state.quizDone=true;else{state.quizIndex++;state.chosen=null}renderQuiz();window.scrollTo(0,0)}
const factPool=()=>facts.filter(f=>state.factCategory==='Alle'||f.category===state.factCategory);
function modal(content,title){return `<div class="detail-backdrop" data-backdrop="true"><section class="detail-sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-top"><span>${esc(title)}</span><button id="close-modal" ${action('close-modal')} aria-label="Schließen">${icon('close',23)}</button></div>${content}</section></div>`}
function renderFacts(){
 const pool=factPool();if(!pool.some(f=>f.id===state.factId))state.factId=pool[0].id;
 const f=facts[state.factId],saved=state.savedFacts.includes(f.id),position=pool.findIndex(x=>x.id===f.id);
 const modalHTML=state.modal==='detail'?modal(`<h2>${esc(f.title)}</h2><p>${esc(f.detail)}</p><div class="sheet-extra">${icon('spark',21)}<span>${esc(f.extra)}</span></div><button class="primary-btn" ${action('fact-next',1)}>Weiter entdecken ${icon('arrow',20)}</button>`,'Wissen kompakt'):state.modal==='saved'?modal(`<h2>Deine Merkliste</h2>${state.savedFacts.length?`<div class="saved-list">${state.savedFacts.map(id=>facts[id]).filter(Boolean).map(f=>`<button ${action('open-fact',f.id)}>${imageFor(f.category)}<span>${esc(f.title)}</span>${icon('arrow',18)}</button>`).join('')}</div>`:'<p>Tippe bei einem Fakt auf das Herz. Hier findest du ihn später wieder.</p>'}`,'Gemerkt'):'';
 shell(`<header class="brandbar facts-brand"><div class="brand">WISSENWELT<span class="brand-rays">✦</span></div><button class="saved-counter" ${action('saved-list')} aria-label="Merkliste öffnen">${icon('heart',18)} ${state.savedFacts.length}</button></header><div class="fact-filter"><label for="fact-category">Entdecken</label><select id="fact-category">${['Alle',...new Set(facts.map(f=>f.category))].map(c=>`<option ${c===state.factCategory?'selected':''}>${esc(c)}</option>`).join('')}</select><span>${position+1} / ${pool.length}</span></div><main class="facts-main"><div class="fact-photo" id="fact-swipe" aria-label="Auf dem Bild nach oben oder unten wischen">${f.id===0?'<img src="assets/saturn.webp" alt="Illustration der Saturnringe" width="768" height="512">':imageFor(f.category,'','eager')}<span class="image-caption">Themenillustration</span></div><article class="fact-card"><div class="fact-label">${f.category}</div><h1>${esc(f.title)}</h1><p>${esc(f.short)}</p><div class="fact-actions"><button class="primary-btn" ${action('fact-detail')}>Mehr erfahren ${icon('arrow',20)}</button><button class="save-btn ${saved?'saved':''}" ${action('save-fact')} aria-label="${saved?'Fakt aus Merkliste entfernen':'Fakt merken'}" aria-pressed="${saved}">${icon('heart',22)}</button></div><div class="feed-controls"><button ${action('fact-next',-1)} aria-label="Vorheriger Fakt">${icon('back',18)}</button><span>Auf dem Bild wischen<br>oder weiterblättern</span><button ${action('fact-next',1)} aria-label="Nächster Fakt">${icon('arrow',18)}</button></div></article></main>${modalHTML}`,'facts-view');
 $('#fact-category').onchange=e=>{state.factCategory=e.target.value;state.factId=factPool()[0].id;renderFacts()};
 let origin=null;const swipe=$('#fact-swipe');swipe.onpointerdown=e=>{origin={x:e.clientX,y:e.clientY};swipe.setPointerCapture(e.pointerId)};swipe.onpointerup=e=>{if(origin){const dy=e.clientY-origin.y,dx=e.clientX-origin.x;if(Math.abs(dy)>50&&Math.abs(dy)>Math.abs(dx))changeFact(dy<0?1:-1);origin=null}};swipe.onpointercancel=()=>origin=null;
}
function changeFact(delta){const pool=factPool(),i=pool.findIndex(f=>f.id===state.factId);state.factId=pool[(i+delta+pool.length)%pool.length].id;state.modal=null;renderFacts();window.scrollTo(0,0)}
function toast(text){$('.toast')?.remove();const node=document.createElement('div');node.className='toast';node.setAttribute('role','status');node.textContent=text;document.body.append(node);setTimeout(()=>node.remove(),3000)}
function render(){({home:renderHome,puzzles:renderPuzzles,puzzle:renderPuzzle,quiz:renderQuiz,facts:renderFacts})[state.view]()}
app.addEventListener('click',event=>{
 if(event.target.dataset.backdrop){state.modal=null;renderFacts();return}
 const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
 const name=button.dataset.action,value=button.dataset.value;
 switch(name){
  case 'nav':if(value==='quiz-config')quizConfig();else navigate(value);break;
  case 'puzzle-level':state.puzzleLevel=value;state.puzzlePage=0;save('puzzle-level',value);renderPuzzles();break;
  case 'puzzle-page':state.puzzlePage+=Number(value);renderPuzzles();window.scrollTo(0,0);break;
  case 'open-puzzle':openPuzzle(Number(value));break;
  case 'cell':selectCell(value);break;
  case 'word':state.selectedWord=Number(value);state.selectedCell=0;renderPuzzle();break;
  case 'slot':state.selectedCell=Number(value);renderPuzzle();break;
  case 'letter':enterLetters(value);break;
  case 'backspace':eraseLetter();break;
  case 'reveal-letter':revealLetter();break;
  case 'reveal-word':revealWord();break;
  case 'check':checkPuzzle();break;
  case 'next-word':state.selectedWord=(state.selectedWord+1)%state.puzzle.words.length;state.selectedCell=0;renderPuzzle();break;
  case 'reset-puzzle':if(confirm('Alle Einträge und Hilfen dieses Rätsels zurücksetzen?')){state.entries={};state.hints={letters:0,words:0};state.checked=false;persistPuzzle();renderPuzzle()}break;
  case 'quiz-level':state.quizLevel=value;save('quiz-level',value);renderQuiz();break;
  case 'quiz-size':state.quizSize=Number(value);renderQuiz();break;
  case 'quiz-config':quizConfig();break;
  case 'start-quiz':startQuiz();break;
  case 'answer':answerQuiz(Number(value));break;
  case 'next-question':nextQuestion();break;
  case 'fact-next':changeFact(Number(value));break;
  case 'fact-detail':state.modal='detail';renderFacts();break;
  case 'close-modal':state.modal=null;renderFacts();break;
  case 'saved-list':state.modal='saved';renderFacts();break;
  case 'save-fact':state.savedFacts=state.savedFacts.includes(state.factId)?state.savedFacts.filter(id=>id!==state.factId):[...state.savedFacts,state.factId];save('savedFacts',state.savedFacts);renderFacts();break;
  case 'open-fact':state.factCategory='Alle';state.factId=Number(value);state.modal=null;renderFacts();window.scrollTo(0,0);break;
 }
});
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&state.modal){state.modal=null;renderFacts();return}
 if(state.modal&&e.key==='Tab'){
  const elements=[...document.querySelectorAll('.detail-sheet button,.detail-sheet a')],first=elements[0],last=elements.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}return;
 }
 if(e.metaKey||e.ctrlKey||e.altKey||['SELECT','INPUT','TEXTAREA'].includes(e.target.tagName))return;
 if(state.view==='puzzle'){
  if(/^[a-zA-ZäöüÄÖÜßẞ]$/.test(e.key)){e.preventDefault();enterLetters(e.key)}
  else if(e.key==='Backspace'){e.preventDefault();eraseLetter()}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();state.selectedCell=Math.max(0,Math.min(selected().word.length-1,state.selectedCell+(e.key==='ArrowRight'?1:-1)));renderPuzzle()}
 }else if(state.view==='facts'&&!state.modal&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();changeFact(e.key==='ArrowDown'?1:-1)}
});
window.addEventListener('resize',()=>{if(state.view==='puzzle')renderPuzzle()});
render();
