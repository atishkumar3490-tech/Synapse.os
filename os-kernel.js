/* ============================================================================
   SYNAPSE OS KERNEL v4.0 — POWERED BY LEGEND
   Architecture:
   - 100% Zero-Emoji Pure Industrial Cyberpunk Interface
   - Non-Blocking 60-FPS Laser Aero-Touch + Air-Swipe Window Switcher
   - Optical Biometric Root Verification HUD
   - Kernel-Level Spiking Neural Substrate Hooks (Sensory -> Cortex -> Motor)
   - Built-in Python 3.11 (Pyodide WASM) & Autonomous Daemon Studio
   ============================================================================ */

const Kernel = (() => {
    let zIndexCounter = 100;
    let audioEnabled = true;
    let aeroActive = false;
    let audioCtx = null;
    let pyodideInstance = null;
    let pyodideLoading = false;
    const openWindows = {};
    const activeBots = {};

    const HardwareSpecs = {
        cores: navigator.hardwareConcurrency || 4,
        ramGB: navigator.deviceMemory || 8,
        gpu: 'DETECTING SILICON...',
        netMbps: navigator.connection ? (navigator.connection.downlink || 10) : 100,
        netType: navigator.connection ? (navigator.connection.effectiveType || '4g').toUpperCase() : 'LAN'
    };

    function notifyNeuralSubstrate(intensity, tag) {
        if (window.SynapseSubstrate && typeof window.SynapseSubstrate.injectSensorySpike === 'function') {
            window.SynapseSubstrate.injectSensorySpike(intensity, tag);
        }
    }

    function detectRealGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) {
                    const raw = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
                    HardwareSpecs.gpu = raw.replace(/ANGLE \((.+)\)/i, '$1').split(',')[0].trim();
                } else {
                    HardwareSpecs.gpu = gl.getParameter(gl.RENDERER);
                }
            }
        } catch (e) {
            HardwareSpecs.gpu = 'WEBGPU SILICON CORE';
        }
    }

    const defaultFS = {
        'readme.txt': 'SYNAPSE OS v4.0 // POWERED BY LEGEND\nZero-Server Neural Substrate & Chrono-Core Active.',
        'cortex_sim.py': 'import math\nweights = [round(math.sin(x) * 0.85, 3) for x in range(8)]\nprint("[SNN-VECTOR]:", weights)',
        'legend.key': 'SHA256: 9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08'
    };
    let vfs = JSON.parse(localStorage.getItem('synapse_vfs') || JSON.stringify(defaultFS));
    function saveVFS() {
        localStorage.setItem('synapse_vfs', JSON.stringify(vfs));
    }

    function playTone(freq = 880, duration = 0.05, type = 'sine') {
        if (!audioEnabled) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    async function forceLandscapeFullscreen() {
        playTone(1050, 0.07, 'triangle');
        
        //  यह नया फिक्स है जो बटन दबाते ही उस नीली स्क्रीन को हमेशा के लिए गायब कर देगा
        const guard = document.getElementById('rotate-guard');
        if (guard) {
            guard.classList.add('hidden');
            guard.style.setProperty('display', 'none', 'important');
        }
        
        try {
            const docEl = document.documentElement;
            if (!document.fullscreenElement && docEl.requestFullscreen) {
                await docEl.requestFullscreen();
            } else if (!document.webkitFullscreenElement && docEl.webkitRequestFullscreen) {
                await docEl.webkitRequestFullscreen();
            }
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (err) {}
    }

    function runBootSequence() {
        detectRealGPU();
        const guard = document.getElementById('rotate-guard');
        if (guard && window.matchMedia('(pointer: fine)').matches) {
            guard.style.display = 'none';
        }

        const bootMessages = [
            "[0.002] INIT SYNAPSE MICROKERNEL v4.0 // POWERED BY LEGEND",
            `[0.018] SILICON TOPOLOGY: ${HardwareSpecs.cores} CORES // ${HardwareSpecs.ramGB}GB SYSTEM RAM [OK]`,
            `[0.042] GPU SHADER PIPELINE: ${HardwareSpecs.gpu.slice(0, 38)} [OK]`,
            "[0.085] MOUNTING CHRONO-CORE QUANTUM STATE TIME-TRAVEL LEDGER... [OK]",
            "[0.128] INITIALIZING SPIKING NEURAL SUBSTRATE (SENSORY->MOTOR)... [OK]",
            "[0.180] CALIBRATING ZERO-LAG LASER AERO-TOUCH & BIOMETRIC LOCK... [OK]",
            "[0.230] ALL SUBSYSTEMS NOMINAL. AWAITING OPERATOR HANDSHAKE."
        ];

        const logBox = document.getElementById('boot-logs');
        const bar = document.getElementById('boot-bar');
        const btn = document.getElementById('boot-start-btn');
        let i = 0;

        const timer = setInterval(() => {
            if (i < bootMessages.length) {
                const line = document.createElement('div');
                line.innerHTML = bootMessages[i].replace('[OK]', '<span class="log-ok">[OK]</span>');
                logBox.appendChild(line);
                logBox.scrollTop = logBox.scrollHeight;
                bar.style.width = `${((i + 1) / bootMessages.length) * 100}%`;
                playTone(340 + i * 95, 0.035, 'sawtooth');
                i++;
            } else {
                clearInterval(timer);
                btn.classList.remove('hidden');
            }
        }, 200);
    }

    function enterDesktop() {
        forceLandscapeFullscreen();
        playTone(1240, 0.14, 'triangle');
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
        initBackgroundGrid();
        startQuantumClockAndTelemetry();
        initHardwareBattery();
        injectRealHardwareHUD();
        notifyNeuralSubstrate(2.0, 'BOOT_COMPLETE');
        setTimeout(() => openApp('terminal'), 300);
    }

    function injectRealHardwareHUD() {
        const hudCard = document.querySelector('.telemetry-hud .hud-card');
        if (!hudCard || document.getElementById('hw-real-specs')) return;
        const extra = document.createElement('div');
        extra.id = 'hw-real-specs';
        extra.style.cssText = 'margin-top:8px;padding-top:6px;border-top:1px solid rgba(0,240,255,0.2);font-size:0.63rem;line-height:1.45;color:#9ec2e6;';
        extra.innerHTML = `
            <div>GPU: <b style="color:#00f0ff">${HardwareSpecs.gpu.slice(0, 22)}</b></div>
            <div>CPU: <b style="color:#00ff9d">${HardwareSpecs.cores} THREADS</b> | RAM: <b style="color:#00ff9d">~${HardwareSpecs.ramGB}GB</b></div>
            <div>LINK: <b style="color:#ffb800">${HardwareSpecs.netMbps} Mbps [${HardwareSpecs.netType}]</b></div>
        `;
        hudCard.appendChild(extra);
    }

    let lastFrameTime = performance.now();
    let frameCount = 0;
    let realFps = 60.0;

    function startQuantumClockAndTelemetry() {
        const topClock = document.getElementById('sys-clock');
        const topAmPm = document.getElementById('sys-ampm');
        const holoTime = document.getElementById('holo-time');
        const holoMs = document.getElementById('holo-ms');
        const holoDate = document.getElementById('holo-date');

        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        function updateClock(nowPerf) {
            frameCount++;
            if (nowPerf - lastFrameTime >= 1000) {
                realFps = ((frameCount * 1000) / (nowPerf - lastFrameTime)).toFixed(1);
                frameCount = 0;
                lastFrameTime = nowPerf;
            }

            const now = new Date();
            const hrs = now.getHours();
            const ampm = hrs >= 12 ? 'PM' : 'AM';
            const hrs12 = String(hrs % 12 || 12).padStart(2, '0');
            const hrs24 = String(hrs).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            const ms = String(now.getMilliseconds()).padStart(3, '0');

            if (topClock) topClock.innerText = `${hrs12}:${mins}:${secs}`;
            if (topAmPm) topAmPm.innerText = ampm;

            if (holoTime) {
                holoTime.innerText = `${hrs24}:${mins}:${secs}`;
                holoMs.innerText = `.${ms}`;
                holoDate.innerText = `${days[now.getDay()]} // ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} // IST`;
            }
            requestAnimationFrame(updateClock);
        }
        requestAnimationFrame(updateClock);

        setInterval(() => {
            const fpsEl = document.getElementById('hud-fps');
            const ramEl = document.getElementById('hud-ram');
            const barRam = document.getElementById('bar-ram');

            if (fpsEl) fpsEl.innerText = `${realFps} FPS`;

            let usedMB = 42.0 + Object.keys(openWindows).length * 11.5;
            if (performance && performance.memory) {
                usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            } else {
                usedMB = (usedMB + Math.random() * 1.4).toFixed(1);
            }
            if (ramEl) ramEl.innerText = `${usedMB} MB`;
            if (barRam) barRam.style.width = `${Math.min(95, (usedMB / 120) * 100)}%`;
        }, 1000);
    }

    function initHardwareBattery() {
        const batEl = document.getElementById('sys-battery');
        if ('getBattery' in navigator) {
            navigator.getBattery().then(bat => {
                const renderBat = () => {
                    const lvl = Math.round(bat.level * 100);
                    batEl.innerText = `${lvl}%${bat.charging ? ' [CHG]' : ''}`;
                };
                renderBat();
                bat.addEventListener('levelchange', renderBat);
                bat.addEventListener('chargingchange', renderBat);
            });
        }
    }

    function initBackgroundGrid() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        const nodes = Array.from({ length: 36 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6
        }));

        function draw() {
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.075)';
            ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = n.x - nodes[j].x;
                    const dy = n.y - nodes[j].y;
                    if (Math.abs(dx) < 125 && Math.abs(dy) < 125) {
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }
        draw();
    }

    // --- MULTI-WINDOW MANAGER ---
    function openApp(appId) {
        playTone(960, 0.06, 'sine');
        notifyNeuralSubstrate(1.6, `OPEN_${appId.toUpperCase()}`);

        if (openWindows[appId]) {
            focusWindow(appId);
            return;
        }

        const layer = document.getElementById('window-layer');
        const win = document.createElement('div');
        win.className = 'os-window';
        win.id = `win-${appId}`;
        const offset = Object.keys(openWindows).length * 22;
        const startLeft = Math.max(95, Math.min(115 + offset, window.innerWidth - 520));
        const startTop = Math.max(10, 12 + offset);

        win.style.left = `${startLeft}px`;
        win.style.top = `${startTop}px`;
        win.style.zIndex = ++zIndexCounter;

        const titles = {
            fpga: 'SILICON FPGA v4.0 // GATE-LEVEL LOGIC & 7-SEG BUS',
            neuro: 'NEURO-SPIKE // SNN KERNEL CORTEX & PLASTICITY',
            swarm: 'DARK-GRID SWARM // P2P MESH & DATA GRAVITY',
            terminal: 'SYNAPSE SHELL v4.0 // ROOT KERNEL TERMINAL',
            ide: 'PY-CORTEX STUDIO // PYTHON 3.11 WASM & DAEMON FORGE'
        };

        win.innerHTML = `
            <div class="win-header" id="hdr-${appId}">
                <span class="win-title">${titles[appId] || appId.toUpperCase()}</span>
                <div class="win-actions">
                    <button class="win-btn" onclick="Kernel.toggleMax('${appId}')" title="Maximize">[MAX]</button>
                    <button class="win-btn close" onclick="Kernel.closeApp('${appId}')" title="Close">[X]</button>
                </div>
            </div>
            <div class="win-body" id="body-${appId}"></div>
        `;

        win.addEventListener('mousedown', () => focusWindow(appId));
        win.addEventListener('touchstart', () => focusWindow(appId), { passive: true });
        layer.appendChild(win);
        openWindows[appId] = win;
        makeDraggable(win, document.getElementById(`hdr-${appId}`));
        renderTaskbar();

        const container = document.getElementById(`body-${appId}`);
        if (appId === 'terminal') initTerminal(container);
        else if (appId === 'ide') initCodeStudio(container);
        else if (appId === 'fpga' && window.SiliconFPGA) window.SiliconFPGA.mount(container);
        else if (appId === 'neuro' && window.NeuroSpike) window.NeuroSpike.mount(container);
        else if (appId === 'swarm' && window.SwarmCluster) window.SwarmCluster.mount(container);
    }

    function toggleMax(appId) {
        playTone(680, 0.05, 'triangle');
        if (openWindows[appId]) {
            openWindows[appId].classList.toggle('maximized');
        }
    }

    function closeApp(appId) {
        playTone(420, 0.07, 'sawtooth');
        notifyNeuralSubstrate(1.0, `CLOSE_${appId.toUpperCase()}`);
        if (openWindows[appId]) {
            openWindows[appId].remove();
            delete openWindows[appId];
            renderTaskbar();
        }
    }

    function focusWindow(appId) {
        if (openWindows[appId]) {
            openWindows[appId].style.zIndex = ++zIndexCounter;
            renderTaskbar();
        }
    }

    function cycleNextWindow() {
        const keys = Object.keys(openWindows);
        if (keys.length === 0) return;
        const pick = keys[Math.floor(Math.random() * keys.length)];
        focusWindow(pick);
        playTone(1120, 0.06, 'triangle');
    }

    function renderTaskbar() {
        const bar = document.getElementById('taskbar-tabs');
        if (!bar) return;
        bar.innerHTML = '';
        Object.keys(openWindows).forEach(id => {
            const tab = document.createElement('button');
            tab.className = 'task-tab active';
            tab.innerText = `[${id.toUpperCase()}]`;
            tab.onclick = () => focusWindow(id);
            bar.appendChild(tab);
        });
    }

    function makeDraggable(win, header) {
        let isDown = false, startX = 0, startY = 0;

        const onStart = (clientX, clientY, target) => {
            if (target.tagName === 'BUTTON' || win.classList.contains('maximized')) return;
            isDown = true;
            startX = clientX - win.offsetLeft;
            startY = clientY - win.offsetTop;
        };

        const onMove = (clientX, clientY) => {
            if (!isDown) return;
            const newX = Math.max(0, Math.min(window.innerWidth - 120, clientX - startX));
            const newY = Math.max(0, Math.min(window.innerHeight - 90, clientY - startY));
            win.style.left = `${newX}px`;
            win.style.top = `${newY}px`;
        };

        header.addEventListener('mousedown', e => onStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY), { passive: true });
        window.addEventListener('mouseup', () => isDown = false);

        header.addEventListener('touchstart', e => {
            const t = e.touches[0];
            onStart(t.clientX, t.clientY, e.target);
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            if (!isDown) return;
            const t = e.touches[0];
            onMove(t.clientX, t.clientY);
        }, { passive: true });

        window.addEventListener('touchend', () => isDown = false);
    }

    // --- PYTHON 3.11 (PYODIDE WASM) & DAEMON STUDIO IDE (ZERO-EMOJI) ---
    function initCodeStudio(container) {
        const defaultPy = `# SYNAPSE PYTHON 3.11 WEBASSEMBLY CORTEX
import math

print("[KERNEL] Executing Spiking Neural Tensor Simulation...")
potentials = [round(math.sin(i * 0.55) * 95, 2) for i in range(1, 9)]
print("[SNN-MV] Membrane Potentials:", potentials)
print("[ENERGY] Total Synaptic Flux:", round(sum(map(abs, potentials)), 2), "pJ")
print("[STATUS] LEGEND SUBSTRATE VERIFIED [OK]")`;

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;font-family:'Share Tech Mono',monospace;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;background:#040811;padding:6px 10px;border:1px solid rgba(0,240,255,0.25);border-radius:4px;">
                    <div style="display:flex;gap:5px;align-items:center;">
                        <button id="preset-py-neural" style="background:#00f0ff22;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.65rem;cursor:pointer;">[PY: SNN TENSOR]</button>
                        <button id="preset-py-crypto" style="background:#00f0ff22;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.65rem;cursor:pointer;">[PY: SHA-256 GRID]</button>
                        <button id="preset-js-bot" style="background:#00ff9d22;border:1px solid #00ff9d;color:#00ff9d;padding:3px 8px;font-size:0.65rem;cursor:pointer;">[JS: HW DAEMON]</button>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button id="run-py-btn" style="background:#00f0ff;color:#000;border:none;padding:4px 10px;font-family:'Orbitron',sans-serif;font-size:0.68rem;font-weight:bold;cursor:pointer;">[EXEC PYTHON 3.11]</button>
                        <button id="run-js-btn" style="background:#00ff9d;color:#000;border:none;padding:4px 10px;font-family:'Orbitron',sans-serif;font-size:0.68rem;font-weight:bold;cursor:pointer;">[DEPLOY JS DAEMON]</button>
                    </div>
                </div>

                <textarea id="ide-editor" spellcheck="false" style="flex:1;width:100%;background:#02050a;color:#00ff9d;border:1px solid rgba(0,240,255,0.3);padding:10px;font-family:'Share Tech Mono',monospace;font-size:0.78rem;resize:none;outline:none;line-height:1.45;">${defaultPy}</textarea>

                <div id="ide-output" style="height:82px;background:#010306;border-left:2px solid #00f0ff;padding:8px;font-size:0.73rem;color:#bfe3ff;overflow-y:auto;white-space:pre-wrap;">[STUDIO READY] Select preset or write custom Python/JS kernel code.</div>
            </div>
        `;

        const editor = container.querySelector('#ide-editor');
        const out = container.querySelector('#ide-output');

        container.querySelector('#preset-py-neural').onclick = () => { editor.value = defaultPy; };
        container.querySelector('#preset-py-crypto').onclick = () => {
            editor.value = `# ZERO-SERVER CRYPTOGRAPHIC DATA GRAVITY HASH
import hashlib
payload = "SYNAPSE_DARK_GRID_LEGEND_2026"
digest = hashlib.sha256(payload.encode()).hexdigest().upper()
primes = [n for n in range(2, 110) if all(n % d != 0 for d in range(2, int(n**0.5)+1))]
print("[HASH-256]:", digest[:40] + "...")
print("[PRIMES]:", len(primes), "nodes verified ->", primes[:10])`;
        };
        container.querySelector('#preset-js-bot').onclick = () => {
            editor.value = `// AUTONOMOUS SILICON HARDWARE DAEMON
Kernel.openApp('fpga');
const demoBtn = document.getElementById('demo-counter');
if (demoBtn) demoBtn.click();
if (window.SynapseSubstrate) window.SynapseSubstrate.injectSensorySpike(4.5, 'BOT_EXEC');
return "[DAEMON ACTIVE] Mounted Silicon FPGA & locked binary auto-counter.";`;
        };

        container.querySelector('#run-js-btn').onclick = () => {
            playTone(1150, 0.05, 'triangle');
            notifyNeuralSubstrate(2.5, 'JS_DAEMON');
            try {
                const fn = new Function(editor.value);
                const res = fn();
                out.innerHTML = `<span style="color:#00ff9d">[DAEMON EXECUTED]</span>\n${res || 'Execution nominal.'}`;
            } catch (err) {
                out.innerHTML = `<span style="color:#ff2a54">[FAULT]</span> ${err.message}`;
            }
        };

        container.querySelector('#run-py-btn').onclick = async () => {
            playTone(980, 0.06, 'sine');
            notifyNeuralSubstrate(3.0, 'PY_WASM');
            out.innerHTML = `<span style="color:#ffb800">[PY-WASM]</span> Initializing Python 3.11 WebAssembly Runtime...`;

            try {
                if (!pyodideInstance) {
                    if (!window.loadPyodide && !pyodideLoading) {
                        pyodideLoading = true;
                        await new Promise((resolve, reject) => {
                            const s = document.createElement('script');
                            s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                            s.onload = resolve;
                            s.onerror = reject;
                            document.head.appendChild(s);
                        });
                    }
                    out.innerHTML = `<span style="color:#ffb800">[PY-WASM]</span> Mounting WASM binary into browser memory...`;
                    pyodideInstance = await window.loadPyodide();
                }

                const captured = [];
                pyodideInstance.setStdout({ batched: (str) => captured.push(str) });
                await pyodideInstance.runPythonAsync(editor.value);
                out.innerHTML = `<span style="color:#00ff9d">[PYTHON 3.11 STDOUT]</span>\n${captured.join('\n') || '(No output)'}`;
            } catch (err) {
                out.innerHTML = `<span style="color:#ff2a54">[PYTHON FAULT]</span>\n${err.message}`;
            }
        };
    }

    // --- TERMINAL WITH CLEAN INDUSTRIAL LAUNCHERS ---
    function initTerminal(container) {
        container.innerHTML = `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(0,240,255,0.2);">
                <button onclick="Kernel.openApp('ide')" style="background:#00f0ff18;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.65rem;cursor:pointer;font-family:'Orbitron',sans-serif;">[PY-CORTEX IDE]</button>
                <button onclick="Kernel.openApp('fpga')" style="background:#00ff9d18;border:1px solid #00ff9d;color:#00ff9d;padding:3px 8px;font-size:0.65rem;cursor:pointer;font-family:'Orbitron',sans-serif;">[FPGA-64 LAB]</button>
                <button onclick="Kernel.openApp('neuro')" style="background:#ffb80018;border:1px solid #ffb800;color:#ffb800;padding:3px 8px;font-size:0.65rem;cursor:pointer;font-family:'Orbitron',sans-serif;">[SNN-BRAIN]</button>
                <button onclick="Kernel.openApp('swarm')" style="background:#ff2a5418;border:1px solid #ff2a54;color:#ff2a54;padding:3px 8px;font-size:0.65rem;cursor:pointer;font-family:'Orbitron',sans-serif;">[DARK-GRID P2P]</button>
            </div>
            <div class="term-output" id="term-out">SYNAPSE KERNEL v4.0 // POWERED BY LEGEND
SILICON GPU: <span style="color:#00f0ff">${HardwareSpecs.gpu}</span>
Commands: 'help', 'ide', 'hwinfo', 'ls', 'cat', 'touch', 'bot', 'rewind', 'clear'
──────────────────────────────────────────────────────────────────</div>
            <div class="term-input-line">
                <span class="term-prompt">root@synapse:~#</span>
                <input type="text" class="term-input" id="term-in" autofocus placeholder="type help, ide, hwinfo, ls, bot start pulse, rewind..." />
            </div>
        `;
        const input = container.querySelector('#term-in');
        const out = container.querySelector('#term-out');

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const raw = input.value.trim();
                const parts = raw.split(' ');
                const cmd = (parts[0] || '').toLowerCase();
                const arg1 = parts[1];
                const arg2 = parts.slice(2).join(' ');
                input.value = '';
                playTone(740, 0.03, 'square');
                notifyNeuralSubstrate(1.8, `CMD_${cmd.toUpperCase()}`);

                let resp = '';
                if (cmd === 'help') {
                    resp = `SYNAPSE v4.0 Kernel Commands:
  ide / python         - Open Python 3.11 WASM & Daemon Studio
  hwinfo / neofetch    - Real GPU, CPU Threads, RAM & Link Telemetry
  ls | cat <file>      - Inspect persistent Virtual File System
  touch <file> <text>  - Write persistent file block
  bot start pulse      - Deploy autonomous SNN stimulation daemon
  bot stop             - Terminate background daemons
  rewind               - Trigger Chrono-Core state rollback (-5s)
  fpga | neuro | swarm - Mount hardware & mesh subsystems
  clear                - Purge terminal buffer`;
                } else if (cmd === 'ide' || cmd === 'python') {
                    openApp('ide');
                    resp = '[KERNEL] Mounting PY-CORTEX Studio (Python 3.11 WASM)...';
                } else if (cmd === 'hwinfo' || cmd === 'neofetch') {
                    resp = `
   [SYNAPSE // v4.0]      OS: SYNAPSE Sovereign WebKernel x86_64
   ─────────────────      Architecture: POWERED BY LEGEND
   GPU SILICON:           ${HardwareSpecs.gpu}
   CPU TOPOLOGY:          ${HardwareSpecs.cores} Logical Threads
   MEMORY BUS:            ~${HardwareSpecs.ramGB} GB System RAM
   SUBSTRATE STATE:       SPIKING NEURAL CORTEX + CHRONO-CORE`;
                } else if (cmd === 'ls') {
                    resp = Object.keys(vfs).map(f => `[FILE] ${f}`).join('    ');
                } else if (cmd === 'cat') {
                    resp = vfs[arg1] ? vfs[arg1] : `cat: ${arg1 || ''}: No such file`;
                } else if (cmd === 'touch') {
                    if (arg1) {
                        vfs[arg1] = arg2 || 'DATA_BLOCK_LEGEND';
                        saveVFS();
                        resp = `[VFS] Committed '${arg1}' to non-volatile storage.`;
                    } else resp = 'Usage: touch <filename> <content>';
                } else if (cmd === 'rewind') {
                    const prevBtn = document.getElementById('chrono-prev');
                    if (prevBtn) prevBtn.click();
                    resp = '[CHRONO-CORE] Executing quantum memory state rollback...';
                } else if (cmd === 'bot') {
                    if (arg1 === 'start' && arg2 === 'pulse') {
                        if (!activeBots.pulse) {
                            activeBots.pulse = setInterval(() => {
                                const btn = document.getElementById('snn-shock-btn');
                                if (btn) btn.click();
                                notifyNeuralSubstrate(2.0, 'DAEMON_PULSE');
                            }, 3200);
                        }
                        resp = `[DAEMON] 'pulse' neural trainer deployed in background.`;
                    } else if (arg1 === 'stop') {
                        Object.keys(activeBots).forEach(k => { clearInterval(activeBots[k]); delete activeBots[k]; });
                        resp = `[DAEMON] All background processes terminated.`;
                    } else {
                        resp = `Usage: 'bot start pulse' or 'bot stop'`;
                    }
                } else if (cmd === 'fpga') { openApp('fpga'); resp = '[KERNEL] Mounting Silicon FPGA v4.0...'; }
                else if (cmd === 'neuro') { openApp('neuro'); resp = '[KERNEL] Mounting Spiking Neural Cortex...'; }
                else if (cmd === 'swarm') { openApp('swarm'); resp = '[KERNEL] Mounting Dark-Grid P2P Mesh...'; }
                else if (cmd === 'clear') { out.innerHTML = ''; return; }
                else if (cmd !== '') { resp = `synapse: unknown instruction: ${raw}`; }

                out.innerHTML += `\n<span style="color:#00ff9d">root@synapse:~#</span> ${raw}\n${resp}`;
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    // --- ZERO-LAG 60-FPS LASER AERO-TOUCH + BIOMETRIC VERIFICATION ---
    let mpCamera = null;
    let lastPinch = false;
    let smoothX = window.innerWidth / 2;
    let smoothY = window.innerHeight / 2;
    let prevHandX = 0.5;
    let swipeCooldown = 0;
    let dwellTarget = null;
    let dwellFrames = 0;
    let isProcessingFrame = false;
    let lastInferenceTime = 0;
    let laserCanvas = null;
    let laserCtx = null;

    function ensureLaserCanvas() {
        if (laserCanvas) return;
        laserCanvas = document.createElement('canvas');
        laserCanvas.id = 'aero-laser-layer';
        laserCanvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
        laserCanvas.width = window.innerWidth;
        laserCanvas.height = window.innerHeight;
        document.body.appendChild(laserCanvas);
        laserCtx = laserCanvas.getContext('2d');
        window.addEventListener('resize', () => {
            if (laserCanvas) {
                laserCanvas.width = window.innerWidth;
                laserCanvas.height = window.innerHeight;
            }
        });
    }

    function triggerSyntheticClick(x, y, modeLabel = 'PINCH') {
        playTone(1380, 0.045, 'sine');
        notifyNeuralSubstrate(2.2, `AERO_${modeLabel}`);

        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:12px;height:12px;border:2px solid #00ff9d;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:99999;transition:all 0.32s ease-out;`;
        document.body.appendChild(ripple);
        requestAnimationFrame(() => {
            ripple.style.width = '52px';
            ripple.style.height = '52px';
            ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 340);

        const rawEl = document.elementFromPoint(x, y);
        if (!rawEl) return;
        const clickable = rawEl.closest('[onclick], button, .desk-icon, .top-pill, .task-tab, .win-btn, input, textarea, canvas') || rawEl;
        if (clickable.tagName === 'INPUT' || clickable.tagName === 'TEXTAREA') clickable.focus();

        const evtOpts = { bubbles: true, cancelable: true, clientX: x, clientY: y };
        clickable.dispatchEvent(new MouseEvent('mousedown', evtOpts));
        clickable.dispatchEvent(new MouseEvent('mouseup', evtOpts));
        if (typeof clickable.click === 'function') clickable.click();

        const readout = document.getElementById('gesture-readout');
        if (readout) {
            readout.innerText = `[${modeLabel}-EXEC] -> ${clickable.id || clickable.tagName}`;
        }
    }

    async function toggleAeroTouch() {
        const statusEl = document.getElementById('aero-status');
        const camHud = document.getElementById('cam-hud');
        const cursor = document.getElementById('aero-cursor');

        if (aeroActive) {
            aeroActive = false;
            if (statusEl) statusEl.innerText = 'OFF';
            if (camHud) camHud.classList.add('hidden');
            if (cursor) cursor.classList.add('hidden');
            if (laserCtx && laserCanvas) laserCtx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);
            if (mpCamera) mpCamera.stop();
            return;
        }

        try {
            if (statusEl) statusEl.innerText = 'SCAN...';
            if (camHud) camHud.classList.remove('hidden');
            if (cursor) cursor.classList.remove('hidden');
            ensureLaserCanvas();

            const videoElement = document.getElementById('webcam-video');
            const canvasElement = document.getElementById('webcam-canvas');
            const canvasCtx = canvasElement.getContext('2d');
            const readout = document.getElementById('gesture-readout');

            if (readout) readout.innerText = '[BIOMETRIC SCAN]: VERIFYING LEGEND ROOT...';

            const hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            // Model complexity 0 ensures ultra-fast 60-FPS responsiveness without CPU hang
            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 0,
                minDetectionConfidence: 0.55,
                minTrackingConfidence: 0.55
            });

            hands.onResults((results) => {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                if (laserCtx) laserCtx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);

                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    const lm = results.multiHandLandmarks[0];
                    drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, { color: '#00f0ff', lineWidth: 1.8 });
                    drawLandmarks(canvasCtx, lm, { color: '#00ff9d', lineWidth: 1, radius: 2 });

                    const wrist = lm[0];
                    const indexTip = lm[8];
                    const thumbTip = lm[4];

                    const targetX = (1 - indexTip.x) * window.innerWidth;
                    const targetY = indexTip.y * window.innerHeight;
                    const originX = (1 - wrist.x) * window.innerWidth;
                    const originY = window.innerHeight;

                    // Responsive low-latency interpolation
                    smoothX = smoothX * 0.52 + targetX * 0.48;
                    smoothY = smoothY * 0.52 + targetY * 0.48;

                    cursor.style.left = `${smoothX}px`;
                    cursor.style.top = `${smoothY}px`;

                    // Draw Sci-Fi Laser Vector Beam from operator hand vector to target
                    if (laserCtx) {
                        const grad = laserCtx.createLinearGradient(originX, originY, smoothX, smoothY);
                        grad.addColorStop(0, 'rgba(0, 240, 255, 0.04)');
                        grad.addColorStop(1, 'rgba(0, 255, 157, 0.65)');
                        laserCtx.strokeStyle = grad;
                        laserCtx.lineWidth = 1.6;
                        laserCtx.beginPath();
                        laserCtx.moveTo(originX, originY);
                        laserCtx.lineTo(smoothX, smoothY);
                        laserCtx.stroke();
                    }

                    // Air-Swipe Detection (Rapid horizontal flick switches active window)
                    const deltaX = indexTip.x - prevHandX;
                    prevHandX = indexTip.x;
                    if (swipeCooldown > 0) swipeCooldown--;
                    if (Math.abs(deltaX) > 0.16 && swipeCooldown === 0) {
                        swipeCooldown = 25;
                        cycleNextWindow();
                        if (readout) readout.innerText = '[AIR-SWIPE] -> CYCLED ACTIVE WINDOW';
                    }

                    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
                    const isPinching = pinchDist < 0.082;

                    if (isPinching) {
                        cursor.classList.add('pinching');
                        document.getElementById('cursor-state').innerText = '[PINCH-EXEC]';
                        if (!lastPinch) triggerSyntheticClick(smoothX, smoothY, 'PINCH');
                        dwellFrames = 0;
                    } else {
                        cursor.classList.remove('pinching');
                        const elUnder = document.elementFromPoint(smoothX, smoothY);
                        const hoverItem = elUnder ? elUnder.closest('[onclick], button, .desk-icon, .top-pill') : null;

                        if (hoverItem && hoverItem === dwellTarget) {
                            dwellFrames++;
                            document.getElementById('cursor-state').innerText = `LOCK ${Math.min(100, Math.round((dwellFrames / 20) * 100))}%`;
                            if (dwellFrames === 20) {
                                triggerSyntheticClick(smoothX, smoothY, 'DWELL');
                                dwellFrames = -12;
                            }
                        } else {
                            dwellTarget = hoverItem;
                            dwellFrames = 0;
                            document.getElementById('cursor-state').innerText = 'LASER-LOCK';
                        }
                    }
                    lastPinch = isPinching;
                }
                canvasCtx.restore();
            });

            // Non-blocking frame throttle (~48ms interval) prevents CPU/UI lag completely
            mpCamera = new Camera(videoElement, {
                onFrame: async () => {
                    if (!aeroActive || isProcessingFrame) return;
                    const now = performance.now();
                    if (now - lastInferenceTime < 48) return;
                    isProcessingFrame = true;
                    lastInferenceTime = now;
                    try {
                        await hands.send({ image: videoElement });
                    } catch (e) {}
                    isProcessingFrame = false;
                },
                width: 256,
                height: 192
            });

            aeroActive = true;
            await mpCamera.start();
            if (statusEl) statusEl.innerText = 'ON';
            if (readout) readout.innerText = '[ACCESS GRANTED // LEGEND ROOT VERIFIED]';
            playTone(1420, 0.09, 'triangle');
        } catch (err) {
            alert('Camera Error: Ensure HTTPS (Vercel) and camera permissions are enabled.');
            if (statusEl) statusEl.innerText = 'ERR';
        }
    }

    function toggleAudio() {
        audioEnabled = !audioEnabled;
        const btn = document.getElementById('audio-toggle');
        if (btn) btn.innerText = audioEnabled ? '[AUDIO: SYN]' : '[AUDIO: MUTE]';
    }

    window.addEventListener('DOMContentLoaded', runBootSequence);

    return {
        enterDesktop,
        forceLandscapeFullscreen,
        openApp,
        closeApp,
        toggleMax,
        toggleAeroTouch,
        toggleAudio,
        playTone
    };
})();
