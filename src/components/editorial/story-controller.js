export const DURATION=16000;
export function advance(elapsed,delta){const next=Math.min(DURATION,elapsed+Math.max(0,delta));return {elapsed:next,scene:next<4000?0:next<8000?1:next<13000?2:3,done:next===DURATION};}

export function installStory(root){
 const scenes=[...root.querySelectorAll('.scene')],chapters=[...root.querySelectorAll('[data-scene]')];
 const play=root.querySelector('#play'),status=root.querySelector('#story-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 720px)');
 const abort=new AbortController(),options={signal:abort.signal};
 let elapsed=0,running=false,frame=0,previous=0,autoplayUsed=false,selected=0;
 function show(index){selected=index;scenes.forEach((scene,i)=>{scene.hidden=i!==index;scene.classList.toggle('active',i===index);});chapters.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));}
 function label(){const text=running?'Pause':elapsed>=DURATION?'Replay':'Play story';play.textContent=text;play.setAttribute('aria-label',running?'Pause story':text==='Replay'?'Replay story':'Play story');}
 function stop(message='Paused. Choose any detail or continue the story.'){running=false;cancelAnimationFrame(frame);previous=0;label();status.textContent=message;}
 function tick(now){if(!running)return;const step=advance(elapsed,previous?now-previous:0);previous=now;elapsed=step.elapsed;if(step.scene!==selected)show(step.scene);if(step.done){stop('Your details, connected. Replay or explore any chapter.');return;}frame=requestAnimationFrame(tick);}
 function start(){if(running)return;autoplayUsed=true;if(elapsed>=DURATION)elapsed=0;show(advance(elapsed,0).scene);running=true;previous=0;label();status.textContent='One short story. Pause or choose a chapter at any time.';frame=requestAnimationFrame(tick);}
 chapters.forEach(button=>button.addEventListener('click',()=>{autoplayUsed=true;const index=Number(button.dataset.scene);elapsed=[0,4000,8000][index];stop('Chapter selected. Explore at your own pace.');show(index);},options));
 play.addEventListener('click',()=>running?stop():start(),options);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop('Paused while you were away.');},options);
 reduced.addEventListener('change',()=>{if(reduced.matches&&running)stop('Reduced motion enabled. Explore chapters at your own pace.');},options);
 mobile.addEventListener('change',()=>{if(mobile.matches&&running)stop('Explore each detail at your own pace.');},options);
 const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(!visible&&running)stop('Paused while the story is off screen.');if(visible&&!autoplayUsed&&!reduced.matches&&!mobile.matches&&!document.hidden)start();},{threshold:.6});
 observer?.observe(root);show(0);label();
 return ()=>{abort.abort();observer?.disconnect();running=false;cancelAnimationFrame(frame);};
}
