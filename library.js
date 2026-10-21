import {wordBank as originalWords, questions as originalQuestions, facts as originalFacts} from './data.js';
import {addedQuestions, addedWords, addedFacts} from './extra-data.js';

export const levels = {easy:'Einfach',medium:'Mittel',hard:'Schwer'};
export const puzzlesPerLevel = 200;
export const puzzleCount = puzzlesPerLevel * Object.keys(levels).length;
export const questions = [...originalQuestions,...addedQuestions].map((q,index)=>({
 id:index, category:q[0], prompt:q[1], options:q[2], answer:q[3], explanation:q[4], extra:q[5], level:q[6]||'easy'
}));
export const facts = [...originalFacts,...addedFacts].map((f,index)=>({
 id:index,category:f[0],title:f[1],short:f[2],detail:f[3],extra:f[4],theme:f[5]
}));
export const categories = ['Alle',...new Set(questions.map(q=>q.category))];
export const illustrations = {
 'Natur':['natur','Fuchs und Schmetterling im Wald'],
 'Geografie':['erde','Gebirge, Fluss und Globus'],
 'Wissenschaft':['labor','Mikroskop, Prisma und Laborgeräte'],
 'Weltraum':['technik','Teleskop und Satellit'],
 'Geschichte':['kultur','Buch und antike Säule'],
 'Kultur':['kultur','Buch, Violine und Malutensilien'],
 'Technik':['technik','Teleskop, Zahnräder und Elektronik'],
 'Mathematik':['labor','Prisma und wissenschaftliche Instrumente'],
 'Sport':['erde','Landschaft mit Bergen und Fluss']
};
export function hash(n){let x=n+0x9e3779b9;x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);return (x^(x>>>16))>>>0}
export function shuffle(items,seed=Date.now()){
 const a=[...items];let s=hash(seed);
 for(let i=a.length-1;i>0;i--){s=hash(s+i);const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a;
}
export function quizPool(level,category='Alle'){return questions.filter(q=>q.level===level&&(category==='Alle'||q.category===category))}
export function quizRound(pool,size,recent=[],seed=Date.now()){
 const seen=new Set(recent);
 const choices=[...shuffle(pool.filter(q=>!seen.has(q.id)),seed),...shuffle(pool.filter(q=>seen.has(q.id)),seed+1)].slice(0,Math.min(size,pool.length));
 return choices.map((q,i)=>{const correct=q.options[q.answer];const options=shuffle(q.options,seed+i*97+31);return {...q,options,answer:options.indexOf(correct)}});
}
export function puzzleLevel(id){return id<=200?'easy':id<=400?'medium':'hard'}
export function idsForLevel(level){const offset=Object.keys(levels).indexOf(level)*puzzlesPerLevel;return Array.from({length:puzzlesPerLevel},(_,i)=>offset+i+1)}
export function wordCells(w){return [...w.word].map((_,i)=>[w.row+(w.dir==='down'?i:0),w.col+(w.dir==='across'?i:0)])}
export const cellKey=(r,c)=>`${r},${c}`;
export function puzzleSolved(p,entries){return p.grid.every((row,r)=>row.every((letter,c)=>!letter||entries[cellKey(r,c)]===letter))}
export function makePuzzle(id){
 if(!Number.isInteger(id)||id<1||id>puzzleCount)throw new Error('Ungültige Rätselnummer');
 const level=puzzleLevel(id),N=15;
 const bank=level==='easy'?originalWords:addedWords.filter(w=>w[3]===level);
 const unique=[...new Map(bank.map(w=>[w[0],w])).values()];
 const grid=Array.from({length:N},()=>Array(N).fill('')),directions=Array.from({length:N},()=>Array(N).fill(0)),placed=[];
 // The first 200 layouts retain the original seed, bank, order and dimensions.
 const words=shuffle(unique,id*947).slice(0,45),target=level==='easy'?9:level==='medium'?10:11;
 function can(word,row,col,dir){
  const dr=dir==='down'?1:0,dc=dir==='across'?1:0;
  if(row<0||col<0||row+dr*(word.length-1)>=N||col+dc*(word.length-1)>=N)return -1;
  if(grid[row-dr]?.[col-dc]||grid[row+dr*word.length]?.[col+dc*word.length])return -1;
  let cross=0;
  for(let i=0;i<word.length;i++){
   const r=row+dr*i,c=col+dc*i,old=grid[r][c];
   if(old){if(old!==word[i]||(directions[r][c]&(dir==='across'?1:2)))return -1;cross++}
   else if(dir==='across'){if(grid[r-1]?.[c]||grid[r+1]?.[c])return -1}
   else if(grid[r][c-1]||grid[r][c+1])return -1;
  }return cross;
 }
 function put(item,row,col,dir){
  const [word,clue,category]=item;
  for(let i=0;i<word.length;i++){const r=row+(dir==='down'?i:0),c=col+(dir==='across'?i:0);grid[r][c]=word[i];directions[r][c]|=dir==='across'?1:2}
  placed.push({word,clue,category,row,col,dir});
 }
 const first=words.find(w=>w[0].length>=6&&w[0].length<=11)||words[0];put(first,7,Math.floor((N-first[0].length)/2),'across');
 for(const item of words){
  if(item===first||placed.length>=target||placed.some(p=>p.word===item[0]))continue;
  const [word]=item,candidates=[];
  for(let i=0;i<word.length;i++)for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(grid[r][c]===word[i]){
   for(const dir of ['across','down']){const row=r-(dir==='down'?i:0),col=c-(dir==='across'?i:0),cross=can(word,row,col,dir);if(cross>0)candidates.push({row,col,dir,cross,spread:Math.abs(row-7)+Math.abs(col-7)})}
  }
  if(candidates.length){candidates.sort((a,b)=>b.cross-a.cross||a.spread-b.spread);const best=candidates.slice(0,Math.min(4,candidates.length));const pick=best[hash(id*101+placed.length*37)%best.length];put(item,pick.row,pick.col,pick.dir)}
 }
 const minR=Math.min(...placed.map(p=>p.row)),maxR=Math.max(...placed.map(p=>p.row+(p.dir==='down'?p.word.length-1:0)));
 const minC=Math.min(...placed.map(p=>p.col)),maxC=Math.max(...placed.map(p=>p.col+(p.dir==='across'?p.word.length-1:0)));
 placed.forEach(p=>{p.row-=minR;p.col-=minC});
 const starts=[...new Set(placed.map(p=>cellKey(p.row,p.col)))].sort((a,b)=>{const [ar,ac]=a.split(',').map(Number),[br,bc]=b.split(',').map(Number);return ar-br||ac-bc});
 placed.forEach(p=>p.number=starts.indexOf(cellKey(p.row,p.col))+1);
 return {id,level,grid:grid.slice(minR,maxR+1).map(row=>row.slice(minC,maxC+1)),words:placed};
}
