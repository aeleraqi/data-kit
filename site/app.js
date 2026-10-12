let SRC=[];
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const grid=document.getElementById("grid"),det=document.getElementById("det");let open=null;
const BADGE={key:"مفتاح",account:"حساب",manual:"يدوي"};
fetch("catalogue.json").then(r=>r.json()).then(c=>{SRC=c.sources.map(s=>[s.short,s.topicAr,s.access==="open"?(s.cors===false?"خادم":""):BADGE[s.access],s.request||s.documentationUrl,s.tip+" · "+s.operator+" · "+(s.lastTested?"اختُبر "+s.lastTested:"لم يُختبر هنا")]);renderSources();}).catch(()=>{grid.textContent="تعذّر تحميل قائمة المصادر. افتح data/catalogue.json على GitHub.";});

function renderSources(){SRC.forEach((s,i)=>{
  const b=document.createElement("button");b.className="s";b.type="button";b.id="s"+i;b.setAttribute("aria-expanded","false");
  b.innerHTML=`<b>${s[0]}</b><span>${s[1]}</span>${s[2]?`<em class="k${s[2]==="يدوي"?" m":""}" style="font-style:normal">${s[2]}</em>`:'<span class="k" aria-hidden="true" style="border:0;background:none">↗</span>'}`;
  b.addEventListener("click",()=>{
    if(open===i){det.hidden=true;b.setAttribute("aria-expanded","false");open=null;return;}
    if(open!==null)document.getElementById("s"+open).setAttribute("aria-expanded","false");
    open=i;b.setAttribute("aria-expanded","true");det.hidden=false;
    det.innerHTML=`<b>${ar(i+1)}. ${s[0]}</b><span class="small">${s[4]}</span><div class="code mono"></div><span class="small">التفاصيل الكاملة في القسم ${ar(i+1)} من SKILL.md</span>`;
    det.querySelector(".code").textContent=s[3];
  });
  grid.appendChild(b);
});}
function bars(el,rows,max){rows.forEach(r=>{const d=document.createElement("div");d.className="br";
  d.innerHTML=`<span>${r.l}</span><span class="tr"><span class="fl${r.lt?" lt":""}" style="width:${(r.v/max*100).toFixed(1)}%"></span></span><span class="v num">${ar(r.v.toFixed(1)).replace(".","٫")}٪${r.f?'<span class="flag">B</span>':""}</span>`;el.appendChild(d);});}
bars(document.getElementById("b1"),[{l:"مصر ٢٢",v:13.90,lt:1},{l:"مصر ٢٣",v:33.88},{l:"مصر ٢٤",v:28.27},{l:"مصر ٢٥",v:14.07,lt:1},{l:"الأردن ٢٥",v:1.77,lt:1},{l:"المغرب ٢٥",v:0.70,lt:1}],35);
bars(document.getElementById("b3"),[{l:"البنك ٢٣",v:33.88},{l:"الصندوق ٢٣",v:24.4,lt:1},{l:"البنك ٢٤",v:28.27},{l:"الصندوق ٢٤",v:33.3,lt:1},{l:"البنك ٢٥",v:14.07},{l:"الصندوق ٢٥",v:20.4,lt:1}],35);
bars(document.getElementById("b2"),[{l:"٢٠٢٠",v:17.436,lt:1},{l:"٢٠٢١",v:17.619,lt:1},{l:"٢٠٢٢",v:18.871,lt:1},{l:"٢٠٢٣",v:16.912,lt:1},{l:"٢٠٢٤",v:15.254,f:1}],20);

const tc=document.getElementById("tab-claude"),tx=document.getElementById("tab-codex"),ip=document.getElementById("instPath"),ih=document.getElementById("instHint");
function setTab(c){tc.setAttribute("aria-selected",c);tx.setAttribute("aria-selected",!c);
  ip.textContent=c?".claude/skills/data-kit/SKILL.md":".agents/skills/data-kit/SKILL.md";
  ih.textContent=c?"ثم اسأل مباشرة: «كم بلغ التضخم في مصر والأردن والمغرب منذ ٢٠٢٢؟»":"ثم اكتب $data-kit متبوعًا بسؤالك.";}
tc.onclick=()=>setTab(true);tx.onclick=()=>setTab(false);
const cb=document.getElementById("copyBtn"),cm=document.getElementById("copyMsg");let txt=null;
fetch("SKILL.md").then(r=>r.ok?r.text():null).then(t=>txt=t).catch(()=>{});
cb.addEventListener("click",()=>{if(!txt){cm.textContent="لم يُحمَّل الملف بعد. استخدم زر «افتح SKILL.md».";return;}
  navigator.clipboard.writeText(txt).then(()=>cm.textContent="نُسخ المحتوى. الصقه في ملف SKILL.md.").catch(()=>cm.textContent="المتصفح منع النسخ. افتح الملف وانسخه يدويًا.");});
