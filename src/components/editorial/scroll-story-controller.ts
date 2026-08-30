// Operator-approved homepage story. Native scroll, no wheel/touch interception.
export function sceneAtProgress(progress:number) {
  const p=Number.isFinite(progress) ? Math.max(0,Math.min(1,progress)) : 0
  return p<.25 ? 0 : p<.5 ? 1 : p<.8 ? 2 : 3
}

export function installScrollStory(root:HTMLElement) {
  const hero=root.closest<HTMLElement>('.hero-scroll')
  const scenes=Array.from(root.querySelectorAll<HTMLElement>('.scene'))
  const chapters=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-scene]'))
  const status=root.querySelector<HTMLElement>('#story-status')
  if(!hero || !status || scenes.length!==4) return ()=>{}
  const room=matchMedia('(min-width: 981px) and (min-height: 660px)')
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  const abort=new AbortController(), options={signal:abort.signal}
  let frame=0, manualAt:number|null=null, selected=-1
  const scrollEnabled=()=>room.matches && !reduced.matches
  function show(index:number) {
    if(index===selected) return
    selected=index
    scenes.forEach((scene,i)=>{scene.hidden=i!==index;scene.classList.toggle('active',i===index)})
    chapters.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.scene)===index)))
  }
  function update() {
    frame=0
    if(!scrollEnabled() || document.hidden) return
    // A chosen chapter stays put until a deliberate page scroll. No jump on click.
    if(manualAt!==null) {
      if(Math.abs(window.scrollY-manualAt)<24) return
      manualAt=null
    }
    const rect=hero!.getBoundingClientRect()
    const travel=Math.max(1,rect.height-root.offsetHeight-48)
    show(sceneAtProgress(-rect.top/travel))
  }
  function schedule() {
    if(scrollEnabled() && !document.hidden && !frame) frame=requestAnimationFrame(update)
  }
  function configure() {
    cancelAnimationFrame(frame);frame=0;manualAt=null
    hero!.dataset.scrollEnabled=String(scrollEnabled())
    status!.textContent=scrollEnabled()
      ? 'Scroll to connect the details. Or choose a chapter.'
      : 'Choose a detail. No playback to wait for.'
    // Changing viewport must not trap the page in an obsolete sticky layout.
    if(scrollEnabled()) schedule()
  }
  chapters.forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.scene)
    if(!Number.isInteger(index)||index<0||index>=scenes.length)return
    manualAt=window.scrollY;show(index)
    status!.textContent=scrollEnabled()
      ? 'Chapter selected. Scroll when you’re ready to continue.'
      : 'Chapter selected. Explore at your own pace.'
  },options))
  window.addEventListener('scroll',schedule,{...options,passive:true})
  window.addEventListener('resize',configure,options)
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()
  },options)
  room.addEventListener('change',configure,options)
  reduced.addEventListener('change',configure,options)
  show(0);configure()
  return ()=>{abort.abort();cancelAnimationFrame(frame);delete hero.dataset.scrollEnabled}
}
