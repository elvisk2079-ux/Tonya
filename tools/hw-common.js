/* Shared homework helpers: sound with fallback, answer checking with hints */
const $=id=>document.getElementById(id);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const norm=s=>(s||'').toLowerCase().replace(/[’`]/g,"'").replace(/[.!?,;:]+/g,' ').replace(/\s+/g,' ').trim();

const TTS={voice:null,keep:[],audio:new Audio(),token:0,ready:false};
function pickVoice(){try{const vs=speechSynthesis.getVoices();const en=vs.filter(v=>/^en[-_]/i.test(v.lang)||v.lang==='en');TTS.voice=en.find(v=>/en[-_]GB/i.test(v.lang)&&/google|natural|online/i.test(v.name))||en.find(v=>/en[-_]GB/i.test(v.lang))||en.find(v=>/google|natural|online/i.test(v.name))||en[0]||null;TTS.ready=vs.length>0}catch(e){}}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function chunks(t){return (t.replace(/\s+/g,' ').match(/[^.!?]+[.!?’']*/g)||[t]).map(s=>s.trim()).filter(Boolean)}
function onlineSay(parts,rate){let i=0;const tok=TTS.token;const a=TTS.audio;const next=()=>{if(tok!==TTS.token||i>=parts.length)return;a.src='https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&ttsspeed='+(rate<.75?'0.4':'0.8')+'&q='+encodeURIComponent(parts[i++].slice(0,190));a.onended=next;a.play().catch(()=>{})};next()}
function say(t,rate){rate=rate||.8;const tok=++TTS.token;const parts=chunks(t);try{TTS.audio.pause()}catch(e){}
 if(!('speechSynthesis' in window)){onlineSay(parts,rate);return}
 if(!TTS.voice)pickVoice();
 if(TTS.ready&&!TTS.voice){onlineSay(parts,rate);return}
 const start=()=>{if(tok!==TTS.token)return;let started=false;TTS.keep=[];
  parts.forEach(p=>{const u=new SpeechSynthesisUtterance(p);u.lang='en-GB';u.rate=rate;if(TTS.voice)u.voice=TTS.voice;u.onstart=()=>{started=true};TTS.keep.push(u);speechSynthesis.speak(u)});
  try{speechSynthesis.resume()}catch(e){}
  setTimeout(()=>{if(tok===TTS.token&&!started&&!speechSynthesis.speaking){try{speechSynthesis.cancel()}catch(e){}onlineSay(parts,rate)}},1200)};
 if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();setTimeout(start,150)}else start()}

/* Stars */
const STARS={total:0,done:new Set(),onChange:null};
function win(key){if(STARS.done.has(key))return;STARS.done.add(key);const t=document.querySelector('[data-task="'+key+'"]');if(t)t.classList.add('done');STARS.onChange&&STARS.onChange()}
function say_fb(id,cls,msg){const f=$(id);f.className='feedback '+cls;f.textContent=msg}

/* A typed answer: first mistake -> first letter hint, second -> more letters, "show" reveals */
function typed(input,answers,opts){opts=opts||{};const acc=(Array.isArray(answers)?answers:[answers]).map(norm);let tries=0;
 const main=acc[0];
 input.addEventListener('input',()=>{input.classList.remove('right','wrong')});
 return function check(){const v=norm(input.value);if(!v){input.classList.remove('right','wrong');return false}
  if(acc.includes(v)){input.classList.add('right');input.classList.remove('wrong');input.readOnly=true;if(opts.hintEl)opts.hintEl.textContent='';return true}
  tries++;input.classList.add('wrong');
  if(opts.hintEl){const n=Math.min(tries,main.length-1);opts.hintEl.textContent=tries>=3?('Answer: '+main):('Hint: '+main.slice(0,n)+'…')}
  return false}}
