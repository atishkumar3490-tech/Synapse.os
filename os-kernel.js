/* ============================================================================
   SYNAPSE OS KERNEL v3.0 — POWERED BY LEGEND
   Includes:
   - Aero-Touch Hand Tracking (Pinch + Hover-Dwell Auto-Click)
   - Real GPU/CPU/RAM/Network Hardware Detection
   - Built-in Python 3.11 (Pyodide WASM) & Bot-Forge Code Studio IDE
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
        'readme.txt': 'SYNAPSE OS v3.0 // POWERED BY LEGEND\nAll kernel modules & Python WASM ready.',
        'neural_sim.py': 'import math\nweights = [math.sin(x) * 0.8 for x in range(8)]\nprint("SYNAPSE SNN WEIGHT VECTOR:", [round(w, 3) for w in weights])',
        'legend.key': 'SHA256: 9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08'
    };
    let vfs = JSON.parse(localStorage.getItem('synapse_vfs') || JSON.stringify(defaultFS));
    function saveVFS() {
        localStorage.setItem('synapse_vfs', JSON.stringify(vfs));
    }

    function playTone(freq = 880, duration = 0.06, type = 'sine') {
        if (!audioEnabled) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    async function forceLandscapeFullscreen() {
        playTone(1050, 0.08, 'triangle');
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
            "[0.002] INIT SYNAPSE MICROKERNEL v3.0 (POWERED BY LEGEND)...",
            `[0.019] CPU DETECTED: ${HardwareSpecs.cores} LOGICAL CORES // ${HardwareSpecs.ramGB}GB SYSTEM MEMORY [OK]`,
            `[0.045] GPU SILICON: ${HardwareSpecs.gpu.slice(0, 38)} [OK]`,
            "[0.089] MOUNTING GATE-LEVEL FPGA LOGIC MATRIX + 7-SEG DISPLAY... [OK]",
            "[0.130] ALLOCATING 72 LIF SPIKING NEURAL SYNAPSES (STDP)... [OK]",
            "[0.195] LINKING PYTHON 3.11 WEBASSEMBLY & BOT-FORGE STUDIO... [OK]",
            "[0.240] ALL SYSTEMS NOMINAL. READY FOR OPERATOR HANDSHAKE."
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
                playTone(320 + i * 90, 0.04, 'sawtooth');
                i++;
            } else {
                clearInterval(timer);
                btn.classList.remove('hidden');
            }
        }, 220);
    }

    function enterDesktop() {
        forceLandscapeFullscreen();
        playTone(1200, 0.15, 'triangle');
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
        initBackgroundGrid();
        startQuantumClockAndTelemetry();
        initHardwareBattery();
        injectRealHardwareHUD();
        setTimeout(() => openApp('terminal'), 350);
    }

    function injectRealHardwareHUD() {
        const hudCard = document.querySelector('.telemetry-hud .hud-card');
        if (!hudCard) return;
        const extra = document.createElement('div');
        extra.style.cssText = 'margin-top:8px;padding-top:6px;border-top:1px solid rgba(0,240,255,0.2);font-size:0.64rem;line-height:1.45;color:#9ec2e6;';
        extra.innerHTML = `
            <div>GPU: <b style="color:#00f0ff">${HardwareSpecs.gpu.slice(0, 22)}</b></div>
            <div>CPU: <b style="color:#00ff9d">${HardwareSpecs.cores} CORES</b> | RAM: <b style="color:#00ff9d">~${HardwareSpecs.ramGB}GB</b></div>
            <div>NET: <b style="color:#ffb800">${HardwareSpecs.netMbps} Mbps (${HardwareSpecs.netType})</b></div>
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
            let hrs = now.getHours();
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

            let usedMB = 44.2 + Object.keys(openWindows).length * 12.4;
            if (performance && performance.memory) {
                usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            } else {
                usedMB = (usedMB + Math.random() * 1.8).toFixed(1);
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
                    batEl.innerText = `${lvl}%${bat.charging ? '⚡' : ''}`;
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

        const nodes = Array.from({ length: 42 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.65,
            vy: (Math.random() - 0.5) * 0.65
        }));

        function draw() {
            ctx.clearRect(0, 0, w, h);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';

            nodes.forEach((n, idx) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                ctx.fill();

                for (let j = idx + 1; j < nodes.length; j++) {
                    const dx = n.x - nodes[j].x;
                    const dy = n.y - nodes[j].y;
                    if (Math.hypot(dx, dy) < 135) {
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }
        draw();
    }

    // --- MULTI-WINDOW MANAGER ---
    function openApp(appId) {
        playTone(960, 0.07, 'sine');
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
        const startTop = Math.max(10, 14 + offset);

        win.style.left = `${startLeft}px`;
        win.style.top = `${startTop}px`;
        win.style.zIndex = ++zIndexCounter;

        const titles = {
            fpga: 'SILICON FPGA v3.0 // GATE-LEVEL LAB & 7-SEG DISPLAY',
            neuro: 'NEURO-SPIKE // 3RD-GEN BIOLOGICAL BRAIN SNN',
            swarm: 'SWARM-CLUSTER // WI-FI MULTI-PHONE SUPERCOMPUTER',
            terminal: 'SYNAPSE SHELL v3.0 // ROOT TERMINAL',
            ide: 'SYNAPSE CODE STUDIO // PYTHON 3.11 WASM & BOT-FORGE'
        };

        win.innerHTML = `
            <div class="win-header" id="hdr-${appId}">
                <span class="win-title">${titles[appId] || appId.toUpperCase()}</span>
                <div class="win-actions">
                    <button class="win-btn" onclick="Kernel.toggleMax('${appId}')" title="Maximize">□</button>
                    <button class="win-btn close" onclick="Kernel.closeApp('${appId}')" title="Close">✕</button>
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
        playTone(420, 0.08, 'sawtooth');
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

    function renderTaskbar() {
        const bar = document.getElementById('taskbar-tabs');
        bar.innerHTML = '';
        Object.keys(openWindows).forEach(id => {
            const tab = document.createElement('button');
            tab.className = 'task-tab active';
            tab.innerText = id.toUpperCase();
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
            const newY = Math.max(0, Math.min(window.innerHeight - 80, clientY - startY));
            win.style.left = `${newX}px`;
            win.style.top = `${newY}px`;
        };

        header.addEventListener('mousedown', e => onStart(e.clientX, e.clientY, e.target));
        window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
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

    // --- 8. PYTHON 3.11 (PYODIDE WASM) & BOT-FORGE STUDIO IDE ---
    function initCodeStudio(container) {
        const defaultPy = `# SYNAPSE PYTHON 3.11 KERNEL (WebAssembly)
import math, time

print("⚡ Executing Neural Matrix Simulation on SYNAPSE OS...")
neurons = [round(math.sin(i * 0.5) * 100, 2) for i in range(1, 9)]
print("Spike Potentials (mV):", neurons)
print("Total Synaptic Energy:", round(sum(map(abs, neurons)), 2), "pJ")
print("STATUS: LEGEND ARCHITECTURE VERIFIED [OK]")`;

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;font-family:'Share Tech Mono',monospace;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;background:#040811;padding:6px 10px;border:1px solid rgba(0,240,255,0.25);border-radius:4px;">
                    <div style="display:flex;gap:5px;align-items:center;">
                        <button id="preset-py-neural" style="background:#00f0ff22;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.66rem;cursor:pointer;">🐍 PY: NEURAL MATH</button>
                        <button id="preset-py-crypto" style="background:#00f0ff22;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.66rem;cursor:pointer;">🔐 PY: SHA MATRIX</button>
                        <button id="preset-js-bot" style="background:#00ff9d22;border:1px solid #00ff9d;color:#00ff9d;padding:3px 8px;font-size:0.66rem;cursor:pointer;">🤖 JS: AUTO-BOT</button>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button id="run-py-btn" style="background:#00f0ff;color:#000;border:none;padding:4px 12px;font-family:'Orbitron',sans-serif;font-size:0.7rem;font-weight:bold;cursor:pointer;">▶ RUN PYTHON 3.11</button>
                        <button id="run-js-btn" style="background:#00ff9d;color:#000;border:none;padding:4px 12px;font-family:'Orbitron',sans-serif;font-size:0.7rem;font-weight:bold;cursor:pointer;">⚡ RUN JS BOT</button>
                    </div>
                </div>

                <textarea id="ide-editor" spellcheck="false" style="flex:1;width:100%;background:#02050a;color:#00ff9d;border:1px solid rgba(0,240,255,0.3);padding:10px;font-family:'Share Tech Mono',monospace;font-size:0.8rem;resize:none;outline:none;line-height:1.45;">${defaultPy}</textarea>

                <div id="ide-output" style="height:85px;background:#010306;border-left:2px solid #00f0ff;padding:8px;font-size:0.75rem;color:#bfe3ff;overflow-y:auto;white-space:pre-wrap;">[STUDIO READY] Click '▶ RUN PYTHON 3.11' or '⚡ RUN JS BOT' to execute live code.</div>
            </div>
        `;

        const editor = container.querySelector('#ide-editor');
        const out = container.querySelector('#ide-output');

        container.querySelector('#preset-py-neural').onclick = () => { editor.value = defaultPy; };
        container.querySelector('#preset-py-crypto').onclick = () => {
            editor.value = `# PYTHON HASH & PRIME BENCHMARK
import hashlib
msg = "SYNAPSE_POWERED_BY_LEGEND_2026"
digest = hashlib.sha256(msg.encode()).hexdigest()
primes = [n for n in range(2, 120) if all(n % d != 0 for d in range(2, int(n**0.5)+1))]
print("SHA-256:", digest[:36] + "...")
print("Primes Computed:", len(primes), "->", primes[:10])`;
        };
        container.querySelector('#preset-js-bot').onclick = () => {
            editor.value = `// SYNAPSE AUTONOMOUS HARDWARE BOT (JavaScript)
Kernel.openApp('fpga');
const demoBtn = document.getElementById('demo-counter');
if (demoBtn) demoBtn.click();
return "🤖 Bot deployed: Opened Silicon FPGA & triggered Auto-Counter!";`;
        };

        container.querySelector('#run-js-btn').onclick = () => {
            playTone(1150, 0.05, 'triangle');
            try {
                const fn = new Function(editor.value);
                const res = fn();
                out.innerHTML = `<span style="color:#00ff9d">[JS BOT EXECUTED]</span>\n${res || 'Completed successfully.'}`;
            } catch (err) {
                out.innerHTML = `<span style="color:#ff2a54">[JS ERROR]</span> ${err.message}`;
            }
        };

        container.querySelector('#run-py-btn').onclick = async () => {
            playTone(980, 0.06, 'sine');
            out.innerHTML = `<span style="color:#ffb800">[PYTHON WASM]</span> Initializing Python 3.11 Kernel...`;

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
                    out.innerHTML = `<span style="color:#ffb800">[PYTHON WASM]</span> Downloading WebAssembly runtime (first run takes ~3s)...`;
                    pyodideInstance = await window.loadPyodide();
                }

                let captured = [];
                pyodideInstance.setStdout({ batched: (str) => captured.push(str) });
                await pyodideInstance.runPythonAsync(editor.value);
                out.innerHTML = `<span style="color:#00ff9d">[PYTHON 3.11 OUTPUT]</span>\n${captured.join('\n') || '(No stdout)'}`;
            } catch (err) {
                out.innerHTML = `<span style="color:#ff2a54">[PYTHON EXCEPTION]</span>\n${err.message}`;
            }
        };
    }

    // --- 9. TERMINAL WITH 1-CLICK ACTION BUTTONS ---
    function initTerminal(container) {
        container.innerHTML = `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(0,240,255,0.2);">
                <button onclick="Kernel.openApp('ide')" style="background:#00f0ff22;border:1px solid #00f0ff;color:#00f0ff;padding:3px 8px;font-size:0.68rem;cursor:pointer;font-family:'Orbitron',sans-serif;">🐍 PYTHON & BOT IDE</button>
                <button onclick="Kernel.openApp('fpga')" style="background:#00ff9d22;border:1px solid #00ff9d;color:#00ff9d;padding:3px 8px;font-size:0.68rem;cursor:pointer;font-family:'Orbitron',sans-serif;">⚡ FPGA LAB</button>
                <button onclick="Kernel.openApp('neuro')" style="background:#ffb80022;border:1px solid #ffb800;color:#ffb800;padding:3px 8px;font-size:0.68rem;cursor:pointer;font-family:'Orbitron',sans-serif;">🧠 NEURO BRAIN</button>
                <button onclick="Kernel.openApp('swarm')" style="background:#ff2a5422;border:1px solid #ff2a54;color:#ff2a54;padding:3px 8px;font-size:0.68rem;cursor:pointer;font-family:'Orbitron',sans-serif;">🌐 SWARM CLUSTER</button>
            </div>
            <div class="term-output" id="term-out">SYNAPSE KERNEL v3.0 // POWERED BY LEGEND
GPU: <span style="color:#00f0ff">${HardwareSpecs.gpu}</span>
Tap any button above or type 'help', 'ide', 'python', 'hwinfo', 'ls', 'bot'.
──────────────────────────────────────────────────────────────────</div>
            <div class="term-input-line">
                <span class="term-prompt">root@synapse:~#</span>
                <input type="text" class="term-input" id="term-in" autofocus placeholder="type ide, python, hwinfo, ls, bot start pulse..." />
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
                playTone(720, 0.03, 'square');

                let resp = '';
                if (cmd === 'help') {
                    resp = `SYNAPSE v3.0 Commands:
  ide / python         - Open Live Python 3.11 (WASM) & Bot-Forge Code Studio
  hwinfo / neofetch    - Real GPU, CPU Cores, RAM & Network Hardware Probe
  ls | cat <f>         - List / Read files in persistent Virtual File System
  touch <f> <txt>      - Create file in persistent storage
  bot start <name>     - Launch autonomous bot ('guardian' or 'pulse')
  fpga | neuro | swarm - Launch core hardware/neural modules
  clear                - Clear terminal output`;
                } else if (cmd === 'ide' || cmd === 'python') {
                    openApp('ide');
                    resp = 'Launching SYNAPSE Code Studio (Python 3.11 WASM + Bot-Forge)...';
                } else if (cmd === 'hwinfo' || cmd === 'neofetch') {
                    resp = `
   💠 SYNAPSE // v3.0     OS: SYNAPSE WebKernel x86_64 (Widescreen)
   ────────────────       Architecture: POWERED BY LEGEND
   GPU SILICON:           ${HardwareSpecs.gpu}
   CPU TOPOLOGY:          ${HardwareSpecs.cores} Logical Threads
   MEMORY BUS:            ~${HardwareSpecs.ramGB} GB System RAM
   PYTHON ENGINE:         Pyodide 3.11 WebAssembly Ready`;
                } else if (cmd === 'ls') {
                    resp = Object.keys(vfs).map(f => `📄 ${f}`).join('    ');
                } else if (cmd === 'cat') {
                    resp = vfs[arg1] ? vfs[arg1] : `cat: ${arg1 || ''}: No such file`;
                } else if (cmd === 'touch') {
                    if (arg1) {
                        vfs[arg1] = arg2 || 'Created by root@synapse';
                        saveVFS();
                        resp = `[VFS] Saved '${arg1}'.`;
                    } else resp = 'Usage: touch <filename> <content>';
                } else if (cmd === 'bot') {
                    if (arg1 === 'start' && arg2 === 'pulse') {
                        if (!activeBots.pulse) {
                            activeBots.pulse = setInterval(() => {
                                const btn = document.getElementById('snn-shock-btn');
                                if (btn) btn.click();
                            }, 3500);
                        }
                        resp = `🤖 [BOT-FORGE] 'pulse' neural trainer active!`;
                    } else if (arg1 === 'stop') {
                        Object.keys(activeBots).forEach(k => { clearInterval(activeBots[k]); delete activeBots[k]; });
                        resp = `[BOT-FORGE] All background bots stopped.`;
                    } else {
                        resp = `Usage: 'bot start pulse' or 'bot stop' (Or open 'ide' for full JS/Python Bot Studio).`;
                    }
                } else if (cmd === 'fpga') { openApp('fpga'); resp = 'Mounting Silicon FPGA v3.0...'; }
                else if (cmd === 'neuro') { openApp('neuro'); resp = 'Initializing Spiking Neural Network...'; }
                else if (cmd === 'swarm') { openApp('swarm'); resp = 'Opening Wi-Fi Swarm Cluster...'; }
                else if (cmd === 'clear') { out.innerHTML = ''; return; }
                else if (cmd !== '') { resp = `synapse: command not found: ${raw}`; }

                out.innerHTML += `\n<span style="color:#00ff9d">root@synapse:~#</span> ${raw}\n${resp}`;
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    // --- 10. AERO-TOUCH HAND ENGINE (PINCH + HOVER DWELL) ---
    let mpCamera = null;
    let lastPinch = false;
    let smoothX = window.innerWidth / 2;
    let smoothY = window.innerHeight / 2;
    let dwellTarget = null;
    let dwellFrames = 0;

    function triggerSyntheticClick(x, y, modeLabel = 'PINCH') {
        playTone(1380, 0.05, 'sine');
        const ripple = document.createElement('div');
        ripple.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:12px;height:12px;border:2px solid #00ff9d;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:99999;transition:all 0.35s ease-out;`;
        document.body.appendChild(ripple);
        requestAnimationFrame(() => {
            ripple.style.width = '55px';
            ripple.style.height = '55px';
            ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 360);

        const rawEl = document.elementFromPoint(x, y);
        if (!rawEl) return;
        const clickable = rawEl.closest('[onclick], button, .desk-icon, .top-pill, .task-tab, .win-btn, input, canvas') || rawEl;
        if (clickable.tagName === 'INPUT' || clickable.tagName === 'TEXTAREA') clickable.focus();

        const evtOpts = { bubbles: true, cancelable: true, clientX: x, clientY: y };
        clickable.dispatchEvent(new MouseEvent('mousedown', evtOpts));
        clickable.dispatchEvent(new MouseEvent('mouseup', evtOpts));
        if (typeof clickable.click === 'function') clickable.click();
    }

    async function toggleAeroTouch() {
        const statusEl = document.getElementById('aero-status');
        const camHud = document.getElementById('cam-hud');
        const cursor = document.getElementById('aero-cursor');

        if (aeroActive) {
            aeroActive = false;
            statusEl.innerText = 'OFF';
            camHud.classList.add('hidden');
            cursor.classList.add('hidden');
            if (mpCamera) mpCamera.stop();
            return;
        }

        try {
            statusEl.innerText = 'INIT...';
            camHud.classList.remove('hidden');
            cursor.classList.remove('hidden');

            const videoElement = document.getElementById('webcam-video');
            const canvasElement = document.getElementById('webcam-canvas');
            const canvasCtx = canvasElement.getContext('2d');

            const hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.6
            });

            hands.onResults((results) => {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    const lm = results.multiHandLandmarks[0];
                    drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, { color: '#00f0ff', lineWidth: 2 });
                    drawLandmarks(canvasCtx, lm, { color: '#00ff9d', lineWidth: 1, radius: 2 });

                    const indexTip = lm[8];
                    const thumbTip = lm[4];
                    const targetX = (1 - indexTip.x) * window.innerWidth;
                    const targetY = indexTip.y * window.innerHeight;

                    smoothX = smoothX * 0.62 + targetX * 0.38;
                    smoothY = smoothY * 0.62 + targetY * 0.38;

                    cursor.style.left = `${smoothX}px`;
                    cursor.style.top = `${smoothY}px`;

                    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
                    const isPinching = pinchDist < 0.082;

                    if (isPinching) {
                        cursor.classList.add('pinching');
                        document.getElementById('cursor-state').innerText = '⚡ CLICK!';
                        if (!lastPinch) triggerSyntheticClick(smoothX, smoothY, 'PINCH');
                        dwellFrames = 0;
                    } else {
                        cursor.classList.remove('pinching');
                        const elUnder = document.elementFromPoint(smoothX, smoothY);
                        const hoverItem = elUnder ? elUnder.closest('[onclick], button, .desk-icon, .top-pill') : null;

                        if (hoverItem && hoverItem === dwellTarget) {
                            dwellFrames++;
                            document.getElementById('cursor-state').innerText = `HOLD ${Math.min(100, Math.round((dwellFrames / 22) * 100))}%`;
                            if (dwellFrames === 22) {
                                triggerSyntheticClick(smoothX, smoothY, 'DWELL');
                                dwellFrames = -15;
                            }
                        } else {
                            dwellTarget = hoverItem;
                            dwellFrames = 0;
                            document.getElementById('cursor-state').innerText = 'TRACKING';
                        }
                    }
                    lastPinch = isPinching;
                }
                canvasCtx.restore();
            });

            mpCamera = new Camera(videoElement, {
                onFrame: async () => {
                    if (aeroActive) await hands.send({ image: videoElement });
                },
                width: 320,
                height: 240
            });

            aeroActive = true;
            await mpCamera.start();
            statusEl.innerText = 'ON';
        } catch (err) {
            alert('Camera Error: Ensure site is running on HTTPS (Vercel) and permission is granted.');
            statusEl.innerText = 'ERR';
        }
    }

    function toggleAudio() {
        audioEnabled = !audioEnabled;
        document.getElementById('audio-toggle').innerText = audioEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
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
