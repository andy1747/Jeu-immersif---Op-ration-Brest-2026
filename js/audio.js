/* ===================================================================
   AUDIO.JS — moteur audio 100% procédural (Web Audio API)
   Aucun fichier son externe : tout est synthétisé en direct.
   Musique d'ambiance par équipe + effets sonores courts par équipe.
=================================================================== */

const AudioFX = (function(){
  let ctx = null;
  let masterGain = null;
  let ambientNodes = [];      // oscillateurs/sources à stopper au changement de thème
  let ambientIntervalIds = []; // setInterval à nettoyer
  let currentTheme = null;
  let muted = (localStorage.getItem("bng_audio_muted") === "1");

  function ensureCtx(){
    if (!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 0.45;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function isMuted(){ return muted; }
  function setMuted(v){
    muted = v;
    localStorage.setItem("bng_audio_muted", v ? "1" : "0");
    if (ctx && masterGain) masterGain.gain.setTargetAtTime(v ? 0 : 0.45, ctx.currentTime, 0.25);
  }
  function toggleMuted(){ setMuted(!muted); return muted; }

  /* ---------------- PRIMITIVES SONORES ---------------- */
  function tone(freq, dur, type, t0, peak, dest){
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "sine";
    const start = c.currentTime + (t0 || 0);
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(peak || 0.15, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g); g.connect(dest || masterGain);
    osc.start(start); osc.stop(start + dur + 0.05);
    return osc;
  }

  function sweep(f1, f2, dur, type, t0, peak, dest){
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "sine";
    const start = c.currentTime + (t0 || 0);
    osc.frequency.setValueAtTime(f1, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(peak || 0.15, start + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g); g.connect(dest || masterGain);
    osc.start(start); osc.stop(start + dur + 0.05);
    return osc;
  }

  function noiseBurst(dur, filterFreq, t0, peak, dest, type){
    const c = ensureCtx();
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filt = c.createBiquadFilter();
    filt.type = type || "bandpass";
    filt.frequency.value = filterFreq || 1000;
    const g = c.createGain();
    const start = c.currentTime + (t0 || 0);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(peak || 0.12, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filt); filt.connect(g); g.connect(dest || masterGain);
    src.start(start);
    return src;
  }

  /* ---------------- AMBIANCES PAR ÉQUIPE ---------------- */
  const AMBIENT = {
    // Harry Potter — nappe magique + carillons aléatoires
    potter(){
      const c = ensureCtx();
      const pad = c.createOscillator(); const pad2 = c.createOscillator();
      const padGain = c.createGain();
      pad.type = "sine"; pad2.type = "sine";
      pad.frequency.value = 220; pad2.frequency.value = 330;
      padGain.gain.value = 0.05;
      const lfo = c.createOscillator(); const lfoGain = c.createGain();
      lfo.type = "sine"; lfo.frequency.value = 0.12; lfoGain.gain.value = 4;
      lfo.connect(lfoGain); lfoGain.connect(pad.frequency);
      pad.connect(padGain); pad2.connect(padGain); padGain.connect(masterGain);
      pad.start(); pad2.start(); lfo.start();
      ambientNodes.push(pad, pad2, lfo);
      const id = setInterval(()=>{
        if (Math.random() < 0.55){
          const notes = [523.25, 587.33, 659.25, 783.99, 880, 987.77];
          tone(notes[Math.floor(Math.random()*notes.length)], 1.6, "sine", 0, 0.05);
        }
      }, 1900);
      ambientIntervalIds.push(id);
    },
    // Casa de Papel — drone tendu + tic-tac de braquage
    casa(){
      const c = ensureCtx();
      const drone = c.createOscillator(); const g = c.createGain();
      drone.type = "sawtooth"; drone.frequency.value = 55;
      const filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 280;
      g.gain.value = 0.045;
      drone.connect(filt); filt.connect(g); g.connect(masterGain);
      drone.start();
      ambientNodes.push(drone);
      const id = setInterval(()=> noiseBurst(0.035, 4200, 0, 0.05, null, "bandpass"), 700);
      ambientIntervalIds.push(id);
    },
    // Batman — sub-bass sombre + boom lointain
    batman(){
      const c = ensureCtx();
      const sub = c.createOscillator(); const g = c.createGain();
      sub.type = "sine"; sub.frequency.value = 46;
      g.gain.value = 0.09;
      sub.connect(g); g.connect(masterGain);
      sub.start();
      ambientNodes.push(sub);
      const id = setInterval(()=>{
        if (Math.random() < 0.3) tone(78, 1.3, "sine", 0, 0.11);
      }, 4200);
      ambientIntervalIds.push(id);
    },
    // Lara Croft / Indiana Jones — arpège d'exploration + légère percussion
    aventuriers(){
      const id = setInterval(()=>{
        const notes = [293.66, 349.23, 392, 440, 523.25];
        if (Math.random() < 0.65) tone(notes[Math.floor(Math.random()*notes.length)], 1.0, "triangle", 0, 0.05);
        if (Math.random() < 0.3) noiseBurst(0.05, 2000, 0, 0.04);
      }, 1500);
      ambientIntervalIds.push(id);
    },
    // Tarzan & Jane — vent/insectes filtrés + oiseaux + percussion douce
    tarzan(){
      const c = ensureCtx();
      const noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const filt = c.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 600; filt.Q.value = 0.5;
      const g = c.createGain(); g.gain.value = 0.022;
      src.connect(filt); filt.connect(g); g.connect(masterGain);
      src.start();
      ambientNodes.push(src);
      const id = setInterval(()=>{
        if (Math.random() < 0.5) sweep(1200, 2200, 0.25, "sine", 0, 0.05);
        if (Math.random() < 0.25) noiseBurst(0.08, 300, 0, 0.06);
      }, 2000);
      ambientIntervalIds.push(id);
    }
  };

  function startAmbient(theme){
    stopAmbient();
    currentTheme = theme;
    ensureCtx();
    if (AMBIENT[theme]) AMBIENT[theme]();
  }
  function stopAmbient(){
    ambientNodes.forEach(n=>{ try{ n.stop(); }catch(e){} });
    ambientNodes = [];
    ambientIntervalIds.forEach(id=> clearInterval(id));
    ambientIntervalIds = [];
    currentTheme = null;
  }

  /* ---------------- EFFETS SONORES COURTS PAR ÉQUIPE ---------------- */
  const SFX = {
    validation(theme){
      if (theme === "potter"){ sweep(440, 1300, 0.5, "sine", 0, 0.15); tone(1600, 0.4, "sine", 0.15, 0.1); }
      else if (theme === "casa"){ tone(220, 0.15, "square", 0, 0.12); tone(440, 0.15, "square", 0.1, 0.12); }
      else if (theme === "batman"){ tone(110, 0.3, "sawtooth", 0, 0.15); sweep(320, 80, 0.4, "sine", 0.05, 0.1); }
      else if (theme === "aventuriers"){ [523.25, 659.25, 783.99].forEach((f,i)=> tone(f, 0.3, "triangle", i*0.08, 0.12)); }
      else if (theme === "tarzan"){ noiseBurst(0.1, 300, 0, 0.15); sweep(800, 1700, 0.3, "sine", 0.05, 0.1); }
      else tone(880, 0.2, "sine", 0, 0.12);
    },
    event(theme){
      if (theme === "potter") sweep(300, 1500, 0.6, "sine", 0, 0.13);
      else if (theme === "casa") { noiseBurst(0.2, 2500, 0, 0.1); tone(200, 0.3, "square", 0.05, 0.1); }
      else if (theme === "batman") sweep(600, 150, 0.5, "sawtooth", 0, 0.13);
      else if (theme === "aventuriers") { tone(392, 0.2, "triangle", 0, 0.1); tone(523.25, 0.3, "triangle", 0.1, 0.1); }
      else if (theme === "tarzan") { sweep(500, 2000, 0.4, "sine", 0, 0.12); noiseBurst(0.1, 500, 0.1, 0.08); }
      else sweep(600, 900, 0.3, "sawtooth", 0, 0.12);
    },
    power(theme){
      if (theme === "potter") { sweep(200, 2000, 0.5, "sine", 0, 0.15); tone(2200, 0.3, "sine", 0.4, 0.08); }
      else if (theme === "casa") { tone(150, 0.4, "sawtooth", 0, 0.15); noiseBurst(0.3, 3000, 0.1, 0.08); }
      else if (theme === "batman") sweep(100, 900, 0.5, "square", 0, 0.14);
      else if (theme === "aventuriers") [261.63,329.63,392,523.25].forEach((f,i)=> tone(f, 0.3, "triangle", i*0.1, 0.1));
      else if (theme === "tarzan") { noiseBurst(0.15, 400, 0, 0.14); sweep(1000, 2500, 0.4, "sine", 0.1, 0.09); }
      else sweep(200, 1000, 0.4, "square", 0, 0.14);
    },
    chest(theme){
      noiseBurst(0.08, 150, 0, 0.14);
      tone(200, 0.3, "triangle", 0.05, 0.1);
      sweep(400, 1200, 0.35, theme==="potter"?"sine":theme==="casa"?"square":theme==="batman"?"sawtooth":"triangle", 0.1, 0.1);
    },
    victory(theme){
      const base = theme==="batman" ? [261.63,329.63,392,523.25] : [523.25,659.25,783.99,1046.5];
      base.forEach((f,i)=> tone(f, 0.55, "triangle", i*0.13, 0.15));
      sweep(200, 1800, 1.0, "sine", 0.1, 0.08);
    }
  };

  function play(type, theme){
    ensureCtx();
    const fn = SFX[type];
    if (fn) fn(theme || currentTheme);
  }

  return { ensureCtx, startAmbient, stopAmbient, isMuted, setMuted, toggleMuted, play };
})();

window.AudioFX = AudioFX;
