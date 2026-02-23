"use client";
import { useState, useRef } from "react";

const STYLES = {
  "Nordic Minimal":    "scandinavian minimal interior, white walls, oak floor, soft light, clean lines, empty room, no furniture",
  "Japandi Warm":      "japandi interior, warm earth tones, natural wood, wabi-sabi, golden light, empty room, no furniture",
  "Modern Industrial": "modern industrial loft, concrete walls, steel accents, large windows, empty room, no furniture",
  "Coastal Bright":    "coastal interior, bright airy, light blue accents, white walls, empty room, no furniture",
  "Luxury Dark":       "luxury dark interior, marble floor, moody ambient light, dramatic shadows, empty room, no furniture",
};

const ROOMS  = ["Kitchen", "Living Room", "Dining Room", "Utility Room", "Open Plan"];
const TIMES  = ["Dawn", "Morning", "Midday", "Dusk", "Night"];
const LENSES = ["24mm Wide Angle", "35mm Standard", "50mm Normal", "85mm Portrait"];

const TIME_DESC = {
  Dawn:    "pre-dawn blue hour, very soft cool light",
  Morning: "bright morning sunlight, warm golden rays",
  Midday:  "bright midday light, high key, sharp shadows",
  Dusk:    "warm dusk golden hour, orange amber tones",
  Night:   "night interior, warm artificial lighting",
};

export default function Page() {
  const [apiKey,      setApiKey]      = useState("");
  const [keyInput,    setKeyInput]    = useState("");
  const [keySet,      setKeySet]      = useState(false);
  const [productImg,  setProductImg]  = useState(null);
  const [roomPhotos,  setRoomPhotos]  = useState([]);
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [generating,  setGenerating]  = useState(false);
  const [genStatus,   setGenStatus]   = useState("");
  const [error,       setError]       = useState("");
  const [scale,       setScale]       = useState(1);
  const [posX,        setPosX]        = useState(50);
  const [shadow,      setShadow]      = useState(true);
  const [reflection,  setReflection]  = useState(false);
  const [compLock,    setCompLock]    = useState(true);
  const [dragOver,    setDragOver]    = useState(false);
  const [regenCount,  setRegenCount]  = useState(0);
  const [params, setParams] = useState({
    style: "Nordic Minimal",
    room:  "Kitchen",
    time:  "Morning",
    lens:  "35mm Standard",
    count: "3",
  });
  const fileRef = useRef();

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setProductImg(e.target.result);
    reader.readAsDataURL(file);
  };

  const buildPrompt = () => {
    const styleDesc = STYLES[params.style] || params.style;
    const timeDesc  = TIME_DESC[params.time] || params.time;
    return `Photorealistic interior photograph, ${params.room.toLowerCase()}, ${styleDesc}, ${timeDesc}, ${params.lens} lens, professional architectural photography, hyperrealistic, 8k, no people`;
  };

  const generateRooms = async () => {
    if (!apiKey) { setError("API key girilmedi"); return; }
    setGenerating(true);
    setError("");
    setRoomPhotos([]);
    const count = parseInt(params.count) || 3;
    const prompt = buildPrompt();
    const results = [];

    try {
      for (let i = 0; i < count; i++) {
        setGenStatus(`Oda ${i + 1} / ${count} üretiliyor…`);
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, apiKey }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.url) results.push({ url: data.url, label: `${params.style} · ${params.room} · ${params.time}` });
      }
      if (results.length === 0) throw new Error("Hiç görüntü üretilemedi");
      setRoomPhotos(results);
      setActiveIdx(0);
      setRegenCount(c => c + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
      setGenStatus("");
    }
  };

  const activeRoom = roomPhotos[activeIdx];

  return (
    <div style={{ height:"100vh", background:"#0c0c0e", color:"#e0d8c8", fontFamily:"'DM Mono',monospace", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .btn-gold { border:none; cursor:pointer; font-family:inherit; letter-spacing:0.1em; text-transform:uppercase; border-radius:2px; background:#c8a060; color:#0c0c0e; font-size:10px; font-weight:600; padding:10px 18px; transition:all 0.18s; }
        .btn-gold:hover    { background:#d4b070; }
        .btn-gold:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-sm { border:1px solid #252520; cursor:pointer; font-family:inherit; letter-spacing:0.1em; text-transform:uppercase; border-radius:2px; background:transparent; color:#806858; font-size:8px; padding:4px 10px; transition:all 0.18s; }
        .btn-sm:hover { border-color:#c8a060; color:#c8a060; }
        .lbl { font-size:8px; letter-spacing:0.14em; text-transform:uppercase; color:#584840; margin-bottom:5px; }
        .sel { background:#161618; color:#c8b8a0; border:1px solid #252520; border-radius:2px; padding:6px 9px; font-family:inherit; font-size:9px; width:100%; appearance:none; cursor:pointer; }
        .sel:focus { outline:none; border-color:#c8a060; }
        .inp { background:#161618; color:#c8b8a0; border:1px solid #252520; border-radius:2px; padding:7px 10px; font-family:inherit; font-size:9px; width:100%; }
        .inp:focus { outline:none; border-color:#c8a060; }
        .inp::placeholder { color:#333028; }
        .tog { width:30px; height:16px; border-radius:8px; border:none; cursor:pointer; position:relative; transition:background 0.2s; flex-shrink:0; }
        .overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:rgba(12,12,14,0.92); backdrop-filter:blur(8px); z-index:20; animation:fadeIn 0.2s; }
        .spinner { width:36px; height:36px; border:2px solid #252520; border-top-color:#c8a060; border-radius:50%; animation:spin 0.8s linear infinite; }
      `}</style>

      <div style={{ background:"#0e0e10", borderBottom:"1px solid #1c1c1e", padding:"11px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:28, height:28, background:"#c8a060", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#0c0c0e", fontWeight:800 }}>⬡</div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:13, fontWeight:800, letterSpacing:"0.06em" }}>SCENE BUILDER</div>
            <div style={{ fontSize:8, color:"#484038", letterSpacing:"0.14em" }}>AI PRODUCT PLACEMENT · fal.ai + Flux Schnell</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:compLock?"#3a9a4a":"#9a4a3a", animation:compLock?"pulse 2s infinite":"none" }} />
            <span style={{ color:compLock?"#3a9a4a":"#9a4a3a", letterSpacing:"0.1em" }}>{compLock?"COMPLIANCE LOCKED":"LOCK OFF"}</span>
          </div>
          <button className="btn-sm" onClick={() => setCompLock(l=>!l)}>{compLock?"🔒 Unlock":"🔓 Lock"}</button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <div style={{ width:230, background:"#0e0e10", borderRight:"1px solid #1c1c1e", display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 }}>
          <div style={{ padding:14, borderBottom:"1px solid #1c1c1e" }}>
            <div className="lbl">fal.ai API Key</div>
            {keySet ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:8, color:"#3a9a4a" }}>✓ KEY ACTIVE</div>
                <button className="btn-sm" onClick={() => { setApiKey(""); setKeySet(false); }}>Remove</button>
              </div>
            ) : (
              <>
                <input className="inp" type="password" placeholder="fal.ai key…" value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&keyInput.trim()){setApiKey(keyInput.trim());setKeySet(true);setKeyInput("");} }} />
                <button className="btn-gold" style={{ width:"100%", marginTop:6 }}
                  onClick={() => { const k=keyInput.trim(); if(k){setApiKey(k);setKeySet(true);setKeyInput("");} }}>
                  Set Key
                </button>
                <div style={{ marginTop:6, fontSize:7, color:"#383028", lineHeight:1.9 }}>fal.ai/dashboard → API Keys → Add key</div>
              </>
            )}
          </div>

          <div style={{ padding:14, borderBottom:"1px solid #1c1c1e" }}>
            <div className="lbl">Beyaz Eşya PNG</div>
            <div onClick={() => fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);loadFile(e.dataTransfer.files[0]);}}
              style={{ border:`1px dashed ${dragOver?"#c8a060":productImg?"#3a9a4a":"#252520"}`, borderRadius:3, padding:"14px 10px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, minHeight:88, justifyContent:"center", transition:"all 0.2s" }}>
              {productImg
                ? <><img src={productImg} alt="" style={{ maxHeight:68, maxWidth:"100%", objectFit:"contain" }} /><span style={{ fontSize:8, color:"#3a9a4a" }}>✓ LOADED</span></>
                : <><div style={{ fontSize:26, opacity:0.15 }}>⬡</div><span style={{ fontSize:8, color:"#484038", textAlign:"center" }}>PNG sürükle / tıkla</span></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>loadFile(e.target.files[0])} />
            {productImg && (
              <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
                <div>
                  <div className="lbl">Boyut — {Math.round(scale*100)}%</div>
                  <input type="range" min={0.3} max={2.5} step={0.05} value={scale} onChange={e=>setScale(parseFloat(e.target.value))} style={{ width:"100%", accentColor:"#c8a060" }} />
                </div>
                <div>
                  <div className="lbl">Yatay Konum</div>
                  <input type="range" min={15} max={85} step={1} value={posX} onChange={e=>setPosX(parseInt(e.target.value))} style={{ width:"100%", accentColor:"#c8a060" }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:14, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, color:"#484038", letterSpacing:"0.14em" }}>SAHNE PARAMETRELERİ</div>
            {[
              { key:"style", label:"Dekorasyon Stili", opts:Object.keys(STYLES) },
              { key:"room",  label:"Oda Tipi",          opts:ROOMS },
              { key:"time",  label:"Işık / Vakit",      opts:TIMES },
              { key:"lens",  label:"Lens",              opts:LENSES },
              { key:"count", label:"Kaç Varyasyon",     opts:["1","2","3","4","5"] },
            ].map(({key,label,opts}) => (
              <div key={key}>
                <div className="lbl">{label}</div>
                <div style={{ position:"relative" }}>
                  <select className="sel" value={params[key]} onChange={e=>setParams({...params,[key]:e.target.value})}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                  <div style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:8, color:"#484038", pointerEvents:"none" }}>▾</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height:1, background:"#1c1c1e" }} />

          <div style={{ padding:14 }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, color:"#484038", letterSpacing:"0.14em", marginBottom:10 }}>KOMPOZİSYON</div>
            {[{l:"Contact Shadow",v:shadow,s:setShadow},{l:"Yansıma",v:reflection,s:setReflection}].map(({l,v,s})=>(
              <div key={l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #181818" }}>
                <span style={{ fontSize:9, color:"#908070" }}>{l}</span>
                <button className="tog" style={{ background:v?"#3a9a4a":"#252520" }} onClick={()=>s(x=>!x)}>
                  <div style={{ position:"absolute", top:2, left:v?16:2, width:12, height:12, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ flex:1 }} />

          <div style={{ padding:14, borderTop:"1px solid #1c1c1e" }}>
            {error && <div style={{ fontSize:8, color:"#c85040", marginBottom:8, lineHeight:1.6 }}>{error}</div>}
            {regenCount>0 && <div style={{ fontSize:8, color:"#484038", marginBottom:6 }}>↺ {regenCount} — ürün değişmedi</div>}
            <button className="btn-gold" style={{ width:"100%" }} onClick={generateRooms} disabled={generating||!keySet}>
              {generating ? "Üretiliyor…" : "✦ Oda Üret"}
            </button>
            {!keySet && <div style={{ marginTop:5, fontSize:7, color:"#484038", textAlign:"center" }}>Önce API key gir</div>}
            {compLock && <div style={{ marginTop:4, fontSize:7, color:"#3a9a4a", textAlign:"center" }}>✓ Ürün geometrisi kilitli</div>}
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", padding:16, gap:12 }}>
          <div style={{ flex:1, borderRadius:4, overflow:"hidden", position:"relative", border:"1px solid #1c1c1e", minHeight:0, background:"#111113" }}>
            {activeRoom
              ? <img src={activeRoom.url} alt="room" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
              : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <div style={{ fontSize:48, opacity:0.07 }}>⬡</div>
                  <div style={{ fontSize:9, color:"#484038", letterSpacing:"0.14em", textAlign:"center", lineHeight:2 }}>
                    {keySet ? "Parametreleri seç → Oda Üret" : "fal.ai API key'ini gir"}<br/>
                    <span style={{ fontSize:7, color:"#333028" }}>Flux Schnell · Fotorealistik iç mekan</span>
                  </div>
                </div>
            }
            {activeRoom && <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 45%)", pointerEvents:"none" }} />}
            {productImg && (
              <div style={{ position:"absolute", bottom:activeRoom?"8%":"25%", left:`${posX}%`, transform:`translateX(-50%) scale(${scale})`, transformOrigin:"bottom center", display:"flex", flexDirection:"column", alignItems:"center", zIndex:5, pointerEvents:"none" }}>
                <img src={productImg} alt="product" style={{ maxHeight:240, maxWidth:320, width:"auto", height:"auto", objectFit:"contain", display:"block", filter:"drop-shadow(0 20px 60px rgba(0,0,0,0.65)) drop-shadow(0 4px 16px rgba(0,0,0,0.45))" }} />
                {shadow && <div style={{ width:180, height:20, marginTop:-4, background:"radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 70%)", filter:"blur(10px)", flexShrink:0 }} />}
                {reflection && <img src={productImg} alt="" aria-hidden style={{ maxHeight:65, maxWidth:320, objectFit:"contain", transform:"scaleY(-1)", opacity:0.09, display:"block", filter:"blur(3px)", maskImage:"linear-gradient(to bottom,black,transparent)", WebkitMaskImage:"linear-gradient(to bottom,black,transparent)" }} />}
              </div>
            )}
            {compLock && productImg && (
              <div style={{ position:"absolute", top:10, right:10, background:"rgba(58,154,74,0.15)", border:"1px solid rgba(58,154,74,0.3)", borderRadius:2, padding:"3px 8px", fontSize:7, color:"#3a9a4a", letterSpacing:"0.12em", zIndex:10 }}>🔒 GEOMETRY PROTECTED</div>
            )}
            {activeRoom && (
              <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(12,12,14,0.78)", backdropFilter:"blur(8px)", padding:"5px 10px", borderRadius:2, fontSize:8, color:"#c8a060", letterSpacing:"0.12em", border:"1px solid rgba(200,160,96,0.15)", zIndex:10 }}>
                {activeRoom.label}
              </div>
            )}
            {generating && (
              <div className="overlay">
                <div className="spinner" />
                <div style={{ fontSize:10, color:"#c8a060", letterSpacing:"0.12em" }}>{genStatus||"Başlatılıyor…"}</div>
                <div style={{ fontSize:8, color:"#585038" }}>Flux Schnell · fotorealistik iç mekan</div>
                <div style={{ fontSize:7, color:"#383028" }}>Ürün geometrisi kilitli</div>
              </div>
            )}
          </div>
          {roomPhotos.length > 0 && (
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
              <button className="btn-sm" style={{ padding:"6px 10px" }} onClick={()=>setActiveIdx(i=>Math.max(0,i-1))}>◂</button>
              <div style={{ flex:1, display:"flex", gap:6 }}>
                {roomPhotos.map((r,i)=>(
                  <div key={i} onClick={()=>setActiveIdx(i)} style={{ flex:1, aspectRatio:"16/9", borderRadius:3, cursor:"pointer", position:"relative", overflow:"hidden", background:"#161618", border:`1.5px solid ${i===activeIdx?"#c8a060":"#1c1c1e"}`, transform:i===activeIdx?"translateY(-3px)":"none", transition:"all 0.18s", boxShadow:i===activeIdx?"0 4px 16px rgba(200,160,96,0.25)":"none" }}>
                    <img src={r.url} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent 50%)" }} />
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"3px 6px", fontSize:6, color:"#c8a060", textAlign:"center" }}>VARYASYON {i+1}</div>
                  </div>
                ))}
              </div>
              <button className="btn-sm" style={{ padding:"6px 10px" }} onClick={()=>setActiveIdx(i=>Math.min(roomPhotos.length-1,i+1))}>▸</button>
            </div>
          )}
          {roomPhotos.length===0 && !generating && (
            <div style={{ flexShrink:0, display:"flex", gap:6 }}>
              {[1,2,3].map(i=>(
                <div key={i} style={{ flex:1, aspectRatio:"16/9", borderRadius:3, background:"#111113", border:"1px solid #1c1c1e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"#252520" }}>VARYASYON {i}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width:195, background:"#0e0e10", borderLeft:"1px solid #1c1c1e", display:"flex", flexDirection:"column", flexShrink:0 }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1c1c1e" }}>
            <span style={{ fontFamily:"Syne,sans-serif", fontSize:9, fontWeight:700, color:"#484038", letterSpacing:"0.14em" }}>INSPECTOR</span>
          </div>
          <div style={{ padding:14, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div className="lbl" style={{ marginBottom:8 }}>Aktif Sahne</div>
              <div style={{ background:"#141416", borderRadius:2, padding:10, fontSize:8, lineHeight:2 }}>
                <div style={{ color:"#484038" }}>MODEL</div><div style={{ color:"#c8a060" }}>Flux Schnell</div>
                <div style={{ color:"#484038", marginTop:3 }}>STİL</div><div style={{ color:"#c0b0a0" }}>{params.style}</div>
                <div style={{ color:"#484038", marginTop:3 }}>ODA</div><div style={{ color:"#c0b0a0" }}>{params.room}</div>
                <div style={{ color:"#484038", marginTop:3 }}>IŞIK</div><div style={{ color:"#c0b0a0" }}>{params.time}</div>
                {activeRoom && <><div style={{ color:"#484038", marginTop:3 }}>DURUM</div><div style={{ color:"#3a9a4a" }}>✓ RENDER TAMAM</div></>}
              </div>
            </div>
            <div>
              <div className="lbl" style={{ marginBottom:6 }}>Prompt</div>
              <div style={{ background:"#141416", borderRadius:2, padding:10, fontSize:7, color:"#504840", lineHeight:1.8 }}>
                {buildPrompt().slice(0,200)}…
              </div>
            </div>
            <div style={{ background:compLock?"rgba(58,154,74,0.07)":"rgba(154,74,58,0.07)", border:`1px solid ${compLock?"rgba(58,154,74,0.18)":"rgba(154,74,58,0.18)"}`, borderRadius:2, padding:10 }}>
              <div style={{ fontSize:7, color:compLock?"#3a9a4a":"#9a4a3a", letterSpacing:"0.12em", marginBottom:5 }}>COMPLIANCE</div>
              <div style={{ fontSize:8, color:"#806858", lineHeight:1.7 }}>
                {compLock?"Ürün geometrisi kilitli. Sadece çevre değişiyor.":"Kilit kapalı."}
              </div>
              {regenCount>0 && <div style={{ marginTop:6, fontSize:7, color:"#484038" }}>↺ {regenCount} regen — ürün unchanged</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
