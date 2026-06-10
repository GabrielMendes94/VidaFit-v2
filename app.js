// VidaFit - app.js (MVP)
// Armazenamento simples em localStorage. Todos os dados salvos localmente por usuário.

const $ = (sel) => document.querySelector(sel);

const authSection = $('#auth');
const appSection = $('#app');
const userArea = $('#userArea');

const loginForm = $('#loginForm');
const signupForm = $('#signupForm');
const logoutBtn = $('#logoutBtn');

const workoutForm = $('#workoutForm');
const waterForm = $('#waterForm');
const goalsForm = $('#goalsForm');
const workoutList = $('#workoutList');
const waterList = $('#waterList');

const todayWaterEl = $('#todayWater');
const weekWorkoutsEl = $('#weekWorkouts');

let currentUser = null;

// Validação rápida: garantir que elementos essenciais existam
;(function validateDom(){
  const required = {authSection, appSection, userArea, loginForm, signupForm, logoutBtn, workoutForm, waterForm, goalsForm, workoutList, waterList, todayWaterEl, weekWorkoutsEl};
  for(const [name,el] of Object.entries(required)){
    if(!el){
      console.error('Elemento DOM faltando:', name, el);
      // Mostra mensagem simples no body para o estudante identificar o problema
      document.body.innerHTML = `<div style="padding:24px;font-family:Inter,Segoe UI,Arial;">Erro crítico: elemento DOM faltando (${name}). Abra o console para detalhes.</div>`;
      throw new Error('Elemento DOM faltando: ' + name);
    }
  }
})();

function loadUsers(){
  const raw = localStorage.getItem('vf_users');
  if(!raw) return {};
  try{
    const parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  }catch(e){
    console.error('vf_users inválido no localStorage:', e, raw);
    return {};
  }
}
function saveUsers(users){
  try{ localStorage.setItem('vf_users', JSON.stringify(users)); }
  catch(e){ console.error('Falha ao salvar vf_users:', e); }
}

// Reset manual via botão visível (adicionado em index.html)
document.addEventListener('DOMContentLoaded', ()=>{
  const r = document.getElementById('resetBtn');
  if(r) r.addEventListener('click', ()=>{
    if(confirm('Limpar dados do VidaFit no navegador? Isso removerá todas as contas locais.')){
      localStorage.removeItem('vf_users'); localStorage.removeItem('vf_current'); location.reload();
    }
  });
});

function hashPW(pw){
  // hash trivial (não seguro) apenas para separar senhas no storage
  let h=0; for(let i=0;i<pw.length;i++) h=(h*31+pw.charCodeAt(i))|0; return String(h);
}

function showApp(){
  // garantir que a tela de autenticação não esteja centralizada
  document.querySelector('.container')?.classList.remove('center');
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  userArea.innerHTML = `<strong>${currentUser.name}</strong>`;
  renderSummary();
  setupCharts();
  // preencher inputs de metas com os valores do usuário
  try{
    $('#goalWater').value = currentUser.goals?.water || '';
    $('#goalWorkouts').value = currentUser.goals?.workoutsPerWeek || '';
    $('#reminderInterval').value = currentUser.goals?.reminderInterval || '';
  }catch(e){/* ignore */}
  // iniciar lembretes
  startReminders();
  // renderizar listas
  renderWorkouts(); renderWater();
}

function logout(){
  currentUser=null; localStorage.removeItem('vf_current');
  // centralizar o container para o formulário de login/registro
  document.querySelector('.container')?.classList.add('center');
  authSection.classList.remove('hidden'); appSection.classList.add('hidden'); userArea.innerHTML='';
}

function saveCurrent(){
  const users = loadUsers();
  users[currentUser.email]=currentUser; saveUsers(users); localStorage.setItem('vf_current', currentUser.email);
}

// Debug panel helper
function updateDebug(msg){
  const d = document.getElementById('debug');
  if(!d) return;
  const users = localStorage.getItem('vf_users');
  const cur = localStorage.getItem('vf_current');
  d.innerHTML = `<strong>Debug</strong>
    <div style="margin:8px 0"><button id="debugReset" class="btn-small">Resetar dados</button> <button id="debugReload" class="btn-small">Recarregar</button></div>
    <pre>${msg||''}\n\nvf_users: ${users}\n\nvf_current: ${cur}</pre>`;
  document.getElementById('debugReset').onclick = ()=>{
    if(confirm('Limpar dados do VidaFit no navegador? Isso removerá todas as contas locais.')){
      localStorage.removeItem('vf_users'); localStorage.removeItem('vf_current'); location.reload();
    }
  };
  document.getElementById('debugReload').onclick = ()=>{ location.reload(); };
}

document.addEventListener('keydown', (e)=>{ if(e.shiftKey && e.key.toLowerCase()==='d'){ const d=document.getElementById('debug'); if(d) d.classList.toggle('hidden'); updateDebug(); } });

// Auth handlers
signupForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#signupName').value.trim();
  const email = $('#signupEmail').value.trim().toLowerCase();
  const pw = $('#signupPassword').value;
  const users = loadUsers();
  if(users[email]){alert('Usuário já existe');return}
  users[email]={name,email,password:hashPW(pw),workouts:[],water:[],goals:{water:2000,workoutsPerWeek:3,reminderInterval:60}};
  saveUsers(users);
  // login automático após cadastro
    currentUser = users[email];
    saveCurrent();
  signupForm.reset();
  alert('Cadastro concluído! Bem-vindo(a), ' + name + '.');
  showApp();
});

loginForm.addEventListener('submit', e=>{
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase();
  const pw = $('#loginPassword').value;
  const users = loadUsers();
    console.log('Tentando login para', email);
  const u = users[email];
  if(!u || u.password !== hashPW(pw)){alert('Email ou senha incorretos');return}
  currentUser = u; localStorage.setItem('vf_current', email);
  loginForm.reset(); showApp();
});

logoutBtn.addEventListener('click', ()=>{ logout(); });

// Restore session
(function(){
  const users = loadUsers();
  const cur = localStorage.getItem('vf_current');
  if(cur && users[cur]){ currentUser = users[cur]; showApp(); }
  else {
    // sem sessão, centralizar container e garantir que auth esteja visível
    document.querySelector('.container')?.classList.add('center');
    authSection.classList.remove('hidden'); appSection.classList.add('hidden');
  }
  // atualizar painel debug inicial
  updateDebug('Inicializado');
})();

// Workouts
workoutForm.addEventListener('submit', e=>{
  e.preventDefault();
  const date = $('#workoutDate').value;
  const type = $('#workoutType').value;
  const duration = Number($('#workoutDuration').value);
  const notes = $('#workoutNotes').value;
  if(!date||!type||!duration) return alert('Preencha os campos do treino');
  // if editing
  const editId = workoutForm.getAttribute('data-edit-id');
  if(editId){
    const idx = currentUser.workouts.findIndex(w=>String(w.id)===editId);
    if(idx>=0){ currentUser.workouts[idx] = {id:Number(editId),date,type,duration,notes}; }
    workoutForm.removeAttribute('data-edit-id');
  } else {
    currentUser.workouts.push({id:Date.now(),date,type,duration,notes});
  }
  saveCurrent();
  workoutForm.reset(); renderSummary(); updateCharts(); renderWorkouts();
});

// Water
waterForm.addEventListener('submit', e=>{
  e.preventDefault();
  const amount = Number($('#waterAmount').value);
  const date = $('#waterDate').value || new Date().toISOString().slice(0,10);
  if(!amount) return alert('Quantidade inválida');
  const editId = waterForm.getAttribute('data-edit-id');
  if(editId){
    const idx = currentUser.water.findIndex(w=>String(w.id)===editId);
    if(idx>=0){ currentUser.water[idx] = {id:Number(editId),date,amount}; }
    waterForm.removeAttribute('data-edit-id');
  } else {
    currentUser.water.push({id:Date.now(),date,amount});
  }
  saveCurrent();
  waterForm.reset(); renderSummary(); updateCharts(); renderWater();
});

function renderWorkouts(){
  workoutList.innerHTML='';
  if(!currentUser) return;
  // ordenar decrescente por data
  const items = currentUser.workouts.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  for(const w of items){
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${w.type}</strong> <small>${w.date}</small> — ${w.duration} min`;
    const actions = document.createElement('div'); actions.className='actions';
    const btnEdit = document.createElement('button'); btnEdit.className='btn-small'; btnEdit.textContent='Editar';
    const btnDel = document.createElement('button'); btnDel.className='btn-small'; btnDel.textContent='Excluir';
    btnEdit.onclick = ()=>{ $('#workoutDate').value=w.date; $('#workoutType').value=w.type; $('#workoutDuration').value=w.duration; $('#workoutNotes').value=w.notes||''; workoutForm.setAttribute('data-edit-id', String(w.id)); };
    btnDel.onclick = ()=>{ if(confirm('Excluir treino?')){ currentUser.workouts = currentUser.workouts.filter(x=>x.id!==w.id); saveCurrent(); renderWorkouts(); renderSummary(); updateCharts(); }};
    actions.appendChild(btnEdit); actions.appendChild(btnDel);
    li.appendChild(left); li.appendChild(actions); workoutList.appendChild(li);
  }
}

function renderWater(){
  waterList.innerHTML='';
  if(!currentUser) return;
  const items = currentUser.water.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  for(const w of items){
    const li = document.createElement('li');
    const left = document.createElement('div'); left.textContent = `${w.amount} ml — ${w.date}`;
    const actions = document.createElement('div'); actions.className='actions';
    const btnEdit = document.createElement('button'); btnEdit.className='btn-small'; btnEdit.textContent='Editar';
    const btnDel = document.createElement('button'); btnDel.className='btn-small'; btnDel.textContent='Excluir';
    btnEdit.onclick = ()=>{ $('#waterAmount').value=w.amount; $('#waterDate').value=w.date; waterForm.setAttribute('data-edit-id', String(w.id)); };
    btnDel.onclick = ()=>{ if(confirm('Excluir registro de água?')){ currentUser.water = currentUser.water.filter(x=>x.id!==w.id); saveCurrent(); renderWater(); renderSummary(); updateCharts(); }};
    actions.appendChild(btnEdit); actions.appendChild(btnDel);
    li.appendChild(left); li.appendChild(actions); waterList.appendChild(li);
  }
}

// Goals
goalsForm.addEventListener('submit', e=>{
  e.preventDefault();
  const gw = Number($('#goalWater').value) || currentUser.goals.water;
  const gtw = Number($('#goalWorkouts').value) || currentUser.goals.workoutsPerWeek;
  const ri = Number($('#reminderInterval').value) || currentUser.goals.reminderInterval;
  currentUser.goals = {water:gw,workoutsPerWeek:gtw,reminderInterval:ri}; saveCurrent();
  alert('Metas salvas');
});

function formatDate(d){ return d.slice(0,10); }

function renderSummary(){
  if(!currentUser) return;
  const today = new Date().toISOString().slice(0,10);
  const waterToday = currentUser.water.filter(w=>formatDate(w.date)===today).reduce((s,i)=>s+i.amount,0);
  todayWaterEl.textContent = waterToday;

  // workouts this week
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate()-now.getDay()); // domingo
  const weekWorkouts = currentUser.workouts.filter(w=>{ const d=new Date(w.date); return d>=start && d<=now; }).length;
  weekWorkoutsEl.textContent = weekWorkouts;
}

// Charts
let waterChart, workoutChart;
function setupCharts(){
  const ctxW = document.getElementById('waterChart').getContext('2d');
  const ctxT = document.getElementById('workoutChart').getContext('2d');
  waterChart = new Chart(ctxW, {type:'bar',data:{labels:[],datasets:[{label:'Água (ml)',data:[],backgroundColor:'#2b8aef'}]}, options:{responsive:true,maintainAspectRatio:false}});
  workoutChart = new Chart(ctxT, {type:'line',data:{labels:[],datasets:[{label:'Duração treino (min)',data:[],borderColor:'#4caf50',fill:false}]}, options:{responsive:true,maintainAspectRatio:false}});
  updateCharts();
}

function updateCharts(){
  if(!currentUser || !waterChart) return;
  // last 7 days
  const days = [];
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(d.toISOString().slice(0,10)); }
  const waterData = days.map(day=> currentUser.water.filter(w=>formatDate(w.date)===day).reduce((s,i)=>s+i.amount,0));
  const workoutData = days.map(day=> currentUser.workouts.filter(w=>formatDate(w.date)===day).reduce((s,i)=>s+i.duration,0));
  waterChart.data.labels = days; waterChart.data.datasets[0].data = waterData; waterChart.update();
  workoutChart.data.labels = days; workoutChart.data.datasets[0].data = workoutData; workoutChart.update();
}

// render lists when app loads
document.addEventListener('DOMContentLoaded', ()=>{ if(currentUser){ renderWorkouts(); renderWater(); } });

// update lists when window focus
window.addEventListener('focus', ()=>{ if(currentUser){ renderWorkouts(); renderWater(); } });

// Reminders (Notification API)
function askNotification(){ if(!('Notification' in window)) return; if(Notification.permission==='default') Notification.requestPermission(); }
askNotification();

let reminderTimer = null;
function startReminders(){
  if(reminderTimer) clearInterval(reminderTimer);
  const mins = (currentUser?.goals?.reminderInterval) || 60;
  reminderTimer = setInterval(()=>{
    if(Notification.permission==='granted') new Notification('VidaFit', {body:'Hora de se mexer! Registre seu treino ou beba água.'});
  }, mins*60*1000);
}

// Start reminders when app shown
(function(){
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible' && currentUser) startReminders(); });
})();

// Update charts when window focus
window.addEventListener('focus', ()=>{ if(currentUser) { const users=loadUsers(); currentUser=users[currentUser.email]; renderSummary(); updateCharts(); startReminders(); } });
