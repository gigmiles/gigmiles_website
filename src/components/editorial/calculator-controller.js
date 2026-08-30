import {calcRealNet,calcDefaults,defaultCostPerMile,parseCalcParams,buildCalcParams} from '@/lib/calculatorMath';

// Native-form enhancement of the approved markup. The original shared engine
// remains the only math source, including result-card and e-bike preset parity.
export function installCalculator(root){
 const q=s=>root.querySelector(s),form=q('#calc-form'),vehicle=()=>form.elements.vehicle.value;
 const fields={gross:q('#gross'),miles:q('#miles'),hours:q('#hours'),costPerMile:q('#rate')};
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 const results=['net','vehicle-cost','se-tax','hourly'].map(id=>q('#'+id));
 const status=q('#calc-status'),share=q('#share'),area=q('#share-area');
 const abort=new AbortController(),options={signal:abort.signal};let calculated=false;
 function clear(){results.forEach(e=>e.textContent='—');share.disabled=true;area.hidden=true;}
 function state(){return {vehicle:vehicle(),...Object.fromEntries(Object.entries(fields).map(([k,e])=>[k,e.valueAsNumber]))};}
 function valid(){return Object.values(fields).every(e=>e.value!==''&&e.validity.valid&&Number.isFinite(e.valueAsNumber));}
 function calculate(){if(!valid()){clear();status.textContent='Complete the fields with valid, non-negative numbers.';return false;}const s=state(),r=calcRealNet(s);q('#net').textContent=money(r.net);q('#vehicle-cost').textContent=money(r.vehicleCost);q('#se-tax').textContent=money(r.seTax);q('#hourly').textContent=s.hours>0?money(r.hourly):'—';share.disabled=false;status.textContent=s.hours>0?'Estimate updated. See the model limits below.':'Estimate updated. Enter hours above zero for an hourly estimate.';calculated=true;return true;}
 function fill(s){form.elements.vehicle.value=s.vehicle;for(const [k,e] of Object.entries(fields))e.value=s[k];}
 form.addEventListener('submit',e=>{e.preventDefault();calculate();},options);
 function onEdit(e){area.hidden=true;if(e.target.name==='vehicle')fields.costPerMile.value=defaultCostPerMile(vehicle());if(calculated)calculate();}
 form.addEventListener('input',onEdit,options);form.addEventListener('change',onEdit,options);
 form.addEventListener('invalid',()=>{clear();status.textContent='Complete the fields with valid, non-negative numbers.';},{...options,capture:true});
 q('#example').addEventListener('click',()=>{fill(calcDefaults(vehicle()));calculate();status.textContent='Optional example. Replace it with your own figures.';},options);
 q('#reset').addEventListener('click',()=>{form.reset();for(const e of Object.values(fields))e.value='';fields.costPerMile.value=defaultCostPerMile('car');calculated=false;clear();const url=new URL(location.href);for(const key of ['g','mi','h','v','r'])url.searchParams.delete(key);history.replaceState(null,'',url.pathname+url.search);status.textContent='Enter your figures or load an optional example.';},options);
 share.addEventListener('click',()=>{if(!calculate())return;const query=buildCalcParams(state());history.replaceState(null,'','/calculator?'+query);q('#share-link').value=location.origin+'/calculator?'+query;area.hidden=false;q('#share-link').select();},options);
 fields.costPerMile.value=defaultCostPerMile('car');
 const params=new URLSearchParams(location.search);
 if(['g','mi','h','v','r'].some(key=>params.has(key))){fill(parseCalcParams(params));calculate();}
 return ()=>abort.abort();
}
