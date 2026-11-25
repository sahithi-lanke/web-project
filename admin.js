// SoundWaves Admin - standalone demo dashboard.
// Data is saved in this browser's localStorage and is NOT connected to app.js.
const DEFAULT_SONGS = [
  {id:1,title:"Leno Waves Intro",artist:"SoundWaves Studio",album:"Leno Sessions Vol. 1",genre:"Electronic",duration:144,url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",cover:"https://picsum.photos/200/200?random=10",rating:4.9},
  {id:2,title:"Neon Horizon",artist:"SynthWave Leno",album:"Cyber Dreams",genre:"Electronic",duration:210,url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",cover:"https://picsum.photos/200/200?random=11",rating:4.7},
  {id:3,title:"Midnight Flow",artist:"Leno Chillhop",album:"Deep Focus",genre:"Lo-Fi",duration:180,url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",cover:"https://picsum.photos/200/200?random=12",rating:4.8},
  {id:4,title:"Celestial Drift",artist:"Astro Ambient",album:"Starlight",genre:"Ambient",duration:240,url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",cover:"https://picsum.photos/200/200?random=13",rating:4.6},
  {id:5,title:"Leno Jazz Groove",artist:"Velvet Quartet",album:"Midnight Lounge",genre:"Jazz",duration:195,url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",cover:"https://picsum.photos/200/200?random=14",rating:4.9}
];
const SAMPLE_REVIEWS = [{user:"LenoFan",songId:1,rating:5,text:"Clean sound design and crisp stream!"}];
const STORAGE_KEY = "soundwaves_admin_songs_v1";
let songs = loadSongs();

function loadSongs(){
  try { const saved=localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : DEFAULT_SONGS.map(s=>({...s})); }
  catch { return DEFAULT_SONGS.map(s=>({...s})); }
}
function saveSongs(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(songs)); }
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function durationText(seconds){const n=Number(seconds)||0;return `${Math.floor(n/60)}:${String(n%60).padStart(2,"0")}`;}
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2400);}
function getReviews(){return SAMPLE_REVIEWS.map(r=>({...r,song:songs.find(s=>s.id===r.songId)}));}

function render(){
  const genres=[...new Set(songs.map(s=>s.genre).filter(Boolean))].sort();
  document.getElementById("songCount").textContent=songs.length;
  document.getElementById("genreCount").textContent=genres.length;
  document.getElementById("reviewCount").textContent=SAMPLE_REVIEWS.length;
  const avg=songs.length?songs.reduce((sum,s)=>sum+Number(s.rating||0),0)/songs.length:0;
  document.getElementById("averageRating").textContent=avg.toFixed(1);
  document.getElementById("recentSongs").innerHTML=songs.slice(-5).reverse().map(song=>`<tr><td>${trackCell(song)}</td><td>${escapeHTML(song.artist)}</td><td>${escapeHTML(song.genre)}</td><td class="rating">★ ${Number(song.rating).toFixed(1)}</td><td>${durationText(song.duration)}</td></tr>`).join("") || `<tr><td colspan="5">No songs added yet.</td></tr>`;
  const filter=document.getElementById("genreFilter"), selected=filter.value;
  filter.innerHTML='<option value="">All genres</option>'+genres.map(g=>`<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join("");
  filter.value=genres.includes(selected)?selected:"";
  renderSongs();renderReviews();
}
function trackCell(song){return `<div class="track-cell"><img src="${escapeHTML(song.cover)}" alt="" onerror="this.src='https://picsum.photos/200/200?blur=2'"><div><b>${escapeHTML(song.title)}</b><small>${escapeHTML(song.album)}</small></div></div>`;}
function renderSongs(){
  const query=document.getElementById("songSearch").value.trim().toLowerCase(),genre=document.getElementById("genreFilter").value;
  const list=songs.filter(s=>(!genre||s.genre===genre)&&[s.title,s.artist,s.album].some(v=>String(v).toLowerCase().includes(query)));
  document.getElementById("songsTable").innerHTML=list.map(s=>`<tr><td>${trackCell(s)}</td><td>${escapeHTML(s.artist)}</td><td>${escapeHTML(s.album)}</td><td>${escapeHTML(s.genre)}</td><td class="rating">★ ${Number(s.rating).toFixed(1)}</td><td><div class="actions"><button class="action-btn" title="Edit" onclick="editSong(${s.id})"><i class="fa-solid fa-pen"></i></button><button class="action-btn delete" title="Delete" onclick="deleteSong(${s.id})"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join("");
  document.getElementById("emptySongs").classList.toggle("hidden",list.length>0);
}
function renderReviews(){
  const reviews=getReviews();
  document.getElementById("reviewsTable").innerHTML=reviews.map(r=>`<tr><td>${escapeHTML(r.user)}</td><td>${escapeHTML(r.song?.title||"Deleted track")}</td><td class="rating">★ ${r.rating}/5</td><td>${escapeHTML(r.text)}</td></tr>`).join("");
  document.getElementById("emptyReviews").classList.toggle("hidden",reviews.length>0);
}
function openModal(song){
  document.getElementById("songForm").reset();
  document.getElementById("songId").value=song?song.id:"";
  document.getElementById("modalTitle").textContent=song?"Edit song":"Add a song";
  ["title","artist","album","genre","duration","url","cover","rating"].forEach(key=>document.getElementById(key).value=song?song[key]:"");
  if(!song)document.getElementById("rating").value="4.5";
  document.getElementById("songModal").classList.remove("hidden");
}
function closeModal(){document.getElementById("songModal").classList.add("hidden");}
function editSong(id){const song=songs.find(s=>s.id===id);if(song)openModal(song);}
function deleteSong(id){
  const song=songs.find(s=>s.id===id);if(!song)return;
  if(confirm(`Delete "${song.title}" from this admin library?`)){songs=songs.filter(s=>s.id!==id);saveSongs();render();showToast("Song deleted.");}
}
document.getElementById("songForm").addEventListener("submit",event=>{
  event.preventDefault();
  const id=document.getElementById("songId").value;
  const song={id:id?Number(id):Date.now(),title:document.getElementById("title").value.trim(),artist:document.getElementById("artist").value.trim(),album:document.getElementById("album").value.trim(),genre:document.getElementById("genre").value.trim(),duration:Number(document.getElementById("duration").value),url:document.getElementById("url").value.trim(),cover:document.getElementById("cover").value.trim(),rating:Number(document.getElementById("rating").value)};
  if(id){songs=songs.map(s=>s.id===Number(id)?song:s);showToast("Song updated.");}else{songs.push(song);showToast("Song added.");}
  saveSongs();closeModal();render();
});
document.getElementById("addSongBtn").addEventListener("click",()=>openModal());
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("cancelModal").addEventListener("click",closeModal);
document.getElementById("songModal").addEventListener("click",e=>{if(e.target.id==="songModal")closeModal();});
document.getElementById("songSearch").addEventListener("input",renderSongs);
document.getElementById("genreFilter").addEventListener("change",renderSongs);

function switchView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(name+"View").classList.add("active");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  document.getElementById("pageTitle").textContent=({overview:"Overview",songs:"Manage Songs",reviews:"Reviews"})[name];
  document.getElementById("sidebar").classList.remove("open");
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.go)));
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
render();
