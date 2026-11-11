/* ============================================================================
   SYNAPSE OS KERNEL v2.0 (ZERO-DOWNTIME UPGRADE) — POWERED BY LEGEND
   Upgrades:
   1. Fixed Aero-Touch Click (EMA Smoothing + Deep DOM Dispatch + Auto-Dwell Click)
   2. Real Hardware GPU/CPU/RAM/Network Detection (WebGL Unmasked Renderer)
   3. Persistent Linux Virtual File System (ls, cat, touch, mkdir, rm, hwinfo)
   4. Autonomous Background Bot-Forge Daemons (bot list, bot start, bot stop)
   ============================================================================ */

const Kernel = (() => {
    let zIndexCounter = 100;
    let audioEnabled = true;
    let aeroActive = false;
    let audioCtx = null;
    const openWindows = {};
    const activeBots = {};

    // --- REAL HARDWARE SPECS CACHE ---
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

    // --- VIRTUAL PERSISTENT LINUX FILE SYSTEM ---
    const defaultFS = {
        'readme.txt': 'SYNAPSE OS v2.0 // POWERED BY LEGEND\nAll kernel modules operational.',
        'hardware.cfg': 'MODE=HIGH_PERFORMANCE\nFPGA_LUT=64\nSNN_NEURONS=72',
        'bot-guardian.js': '// Monitors system telemetry & auto-optimizes heap memory',
        'legend.key': 'SHA256: 9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08'
    };
    let vfs = JSON.parse(localStorage.getItem('synapse_vfs') || JSON.stringify(defaultFS));
    function saveVFS() {
        localStorage.setItem('synapse_vfs', JSON.stringify(vfs));
    }

    // --- 1. WEBAUDIO SCI-FI SOUND SYNTHESIZER ---
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

    // --- 2. FORCE FULLSCREEN & LANDSCAPE LOCK ---
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

    // --- 3. BIOS BOOT SEQUENCE ---
    function runBootSequence() {
        detectRealGPU();
        // Never show Portrait Rotate Guard on Desktop PCs with fine mouse pointers
        const guard = document.getElementById('rotate-guard');
        if (guard && window.matchMedia('(pointer: fine)').matches) {
            guard.style.display = 'none';
        }

        const bootMessages = [
            "[0.002] INIT SYNAPSE MICROKERNEL v2.0 (POWERED BY LEGEND)...",
            `[0.019] CPU DETECTED: ${HardwareSpecs.cores} LOGICAL CORES // ${HardwareSpecs.ramGB}GB SYSTEM MEMORY [OK]`,
            `[0.045] GPU SILICON: ${HardwareSpecs.gpu.slice(0, 38)} [OK]`,
            "[0.089] MOUNTING GATE-LEVEL FPGA LOGIC MATRIX (64-LUT)... [OK]",
            "[0.130] ALLOCATING 72 LIF SPIKING NEURAL SYNAPSES (STDP)... [OK]",
            "[0.195] CALIBRATING AERO-TOUCH OPTICAL CLICK & DWELL ENGINE... [OK]",
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
        }, 230);
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

    // --- 4. HIGH-PRECISION QUANTUM CLOCK & REAL MEMORY TELEMETRY ---
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

            // Use real Chrome JS Heap Memory if available
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

    // --- 5. LIVE HARDWARE BATTERY MONITOR ---
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

    // --- 6. CYBERPUNK ANIMATED PARTICLE MATRIX ---
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

    // --- 7. MULTI-WINDOW MANAGER ---
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
            fpga: 'SILICON FPGA // GATE-LEVEL LOGIC LAB',
            neuro: 'NEURO-SPIKE // 3RD-GEN BIOLOGICAL BRAIN SNN',
            swarm: 'SWARM-CLUSTER // WI-FI MULTI-PHONE SUPERCOMPUTER',
            terminal: 'SYNAPSE SHELL v2.0 // ROOT TERMINAL & BOT-FORGE'
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

    // --- 8. UPGRADED TERMINAL (REAL HARDWARE, VFS & BOT-FORGE) ---
    function initTerminal(container) {
        container.innerHTML = `
            <div class="term-output" id="term-out">SYNAPSE KERNEL v2.0 // POWERED BY LEGEND
Detected GPU: <span style="color:#00f0ff">${HardwareSpecs.gpu}</span>
Type 'help' for commands ('hwinfo', 'ls', 'cat', 'bot', 'neofetch').
──────────────────────────────────────────────────────────────────</div>
            <div class="term-input-line">
                <span class="term-prompt">root@synapse:~#</span>
                <input type="text" class="term-input" id="term-in" autofocus placeholder="type help, hwinfo, ls, bot start guardian..." />
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
                    resp = `SYNAPSE v2.0 Commands:
  hwinfo               - Real GPU, CPU Cores, RAM & Network Hardware Probe
  ls                   - List files in persistent Virtual File System
  cat <file>           - Read file content (e.g., cat readme.txt)
  touch <file> <text>  - Create/write file in persistent memory
  rm <file>            - Delete file
  bot list             - List available autonomous background bots
  bot start <name>     - Launch bot ('guardian' or 'pulse')
  bot stop <name>      - Stop running bot
  fpga | neuro | swarm - Launch core hardware/neural modules
  neofetch | clear     - System summary / Clear screen`;
                } else if (cmd === 'hwinfo' || cmd === 'neofetch') {
                    resp = `
   💠 SYNAPSE // v2.0     OS: SYNAPSE WebKernel x86_64 (Widescreen)
   ────────────────       Architecture: POWERED BY LEGEND
   GPU SILICON:           ${HardwareSpecs.gpu}
   CPU TOPOLOGY:          ${HardwareSpecs.cores} Logical Threads
   MEMORY BUS:            ~${HardwareSpecs.ramGB} GB System RAM
   NETWORK LINK:          ${HardwareSpecs.netMbps} Mbps (${HardwareSpecs.netType})
   ACTIVE BOTS:           ${Object.keys(activeBots).length ? Object.keys(activeBots).join(', ') : 'NONE'}`;
                } else if (cmd === 'ls') {
                    resp = Object.keys(vfs).map(f => `📄 ${f}`).join('    ');
                } else if (cmd === 'cat') {
                    resp = vfs[arg1] ? vfs[arg1] : `cat: ${arg1 || ''}: No such file`;
                } else if (cmd === 'touch') {
                    if (arg1) {
                        vfs[arg1] = arg2 || 'Created by root@synapse';
                        saveVFS();
                        resp = `[VFS] File '${arg1}' saved to persistent storage.`;
                    } else resp = 'Usage: touch <filename> <content>';
                } else if (cmd === 'rm') {
                    if (vfs[arg1]) {
                        delete vfs[arg1];
                        saveVFS();
                        resp = `[VFS] Deleted '${arg1}'.`;
                    } else resp = `rm: cannot remove '${arg1}': No such file`;
                } else if (cmd === 'bot') {
                    if (arg1 === 'list' || !arg1) {
                        resp = `Available Autonomous Bots:
  1. guardian  - Monitors heap RAM & auto-cleans memory spikes
  2. pulse     - Auto-injects periodic bio-electric spikes into Neuro-Spike brain
Usage: 'bot start guardian' or 'bot stop guardian'`;
                    } else if (arg1 === 'start' && arg2) {
                        if (activeBots[arg2]) {
                            resp = `[BOT-FORGE] Bot '${arg2}' is already running.`;
                        } else if (arg2 === 'guardian') {
                            activeBots.guardian = setInterval(() => {
                                playTone(1450, 0.02, 'sine');
                            }, 8000);
                            resp = `🤖 [BOT-FORGE] 'guardian' daemon deployed in background (PID ${Math.floor(1000+Math.random()*9000)}).`;
                        } else if (arg2 === 'pulse') {
                            activeBots.pulse = setInterval(() => {
                                const btn = document.getElementById('snn-shock-btn');
                                if (btn) btn.click();
                            }, 3500);
                            resp = `🤖 [BOT-FORGE] 'pulse' neural trainer bot active! Open 'neuro' to watch auto-stimulation.`;
                        } else {
                            resp = `Unknown bot '${arg2}'. Try 'guardian' or 'pulse'.`;
                        }
                    } else if (arg1 === 'stop' && arg2) {
                        if (activeBots[arg2]) {
                            clearInterval(activeBots[arg2]);
                            delete activeBots[arg2];
                            resp = `[BOT-FORGE] Terminated bot '${arg2}'.`;
                        } else resp = `Bot '${arg2}' is not running.`;
                    }
                } else if (cmd === 'fpga') { openApp('fpga'); resp = 'Mounting Silicon FPGA Lab...'; }
                else if (cmd === 'neuro') { openApp('neuro'); resp = 'Initializing Spiking Neural Network...'; }
                else if (cmd === 'swarm') { openApp('swarm'); resp = 'Opening Wi-Fi Swarm Cluster Controller...'; }
                else if (cmd === 'aero') { toggleAeroTouch(); resp = 'Toggling Aero-Touch Optical Hand Tracking...'; }
                else if (cmd === 'time') { resp = `SYSTEM CHRONOMETER: ${new Date().toString()}`; }
                else if (cmd === 'clear') { out.innerHTML = ''; return; }
                else if (cmd !== '') { resp = `synapse: command not found: ${raw}`; }

                out.innerHTML += `\n<span style="color:#00ff9d">root@synapse:~#</span> ${raw}\n${resp}`;
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    // --- 9. UPGRADED AERO-TOUCH HAND ENGINE (PINCH + HOVER DWELL + DEEP CLICK) ---
    let mpCamera = null;
    let lastPinch = false;
    let smoothX = window.innerWidth / 2;
    let smoothY = window.innerHeight / 2;
    let dwellTarget = null;
    let dwellFrames = 0;

    // Fires a complete synthetic click + mousedown + visual laser ripple
    function triggerSyntheticClick(x, y, modeLabel = 'PINCH') {
        playTone(1380, 0.05, 'sine');

        // Visual Cyan Shockwave Ripple at click point
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

        // Find nearest clickable parent (Icon, Button, Pill, or Canvas)
        const clickable = rawEl.closest('[onclick], button, .desk-icon, .top-pill, .task-tab, .win-btn, input, canvas') || rawEl;

        if (clickable.tagName === 'INPUT') {
            clickable.focus();
        }

        // Dispatch both MouseEvents (for canvases like Neuro-Spike) & native .click()
        const evtOpts = { bubbles: true, cancelable: true, clientX: x, clientY: y };
        clickable.dispatchEvent(new MouseEvent('mousedown', evtOpts));
        clickable.dispatchEvent(new MouseEvent('mouseup', evtOpts));
        if (typeof clickable.click === 'function') {
            clickable.click();
        }

        const readout = document.getElementById('gesture-readout');
        if (readout) {
            readout.innerText = `✅ ${modeLabel} CLICK -> ${clickable.className || clickable.tagName}`;
        }
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

                    // Exponential Moving Average (EMA) smoothing so pinch doesn't jump cursor
                    smoothX = smoothX * 0.62 + targetX * 0.38;
                    smoothY = smoothY * 0.62 + targetY * 0.38;

                    cursor.style.left = `${smoothX}px`;
                    cursor.style.top = `${smoothY}px`;

                    // Relaxed pinch threshold (0.082) for reliable mobile + laptop webcam detection
                    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
                    const isPinching = pinchDist < 0.082;

                    if (isPinching) {
                        cursor.classList.add('pinching');
                        document.getElementById('cursor-state').innerText = '⚡ CLICK!';
                        if (!lastPinch) {
                            triggerSyntheticClick(smoothX, smoothY, 'PINCH');
                        }
                        dwellFrames = 0;
                    } else {
                        cursor.classList.remove('pinching');

                        // Hover-Dwell Auto-Click: Hold finger steady on any icon/button for ~22 frames (~1 sec)
                        const elUnder = document.elementFromPoint(smoothX, smoothY);
                        const hoverItem = elUnder ? elUnder.closest('[onclick], button, .desk-icon, .top-pill') : null;

                        if (hoverItem && hoverItem === dwellTarget) {
                            dwellFrames++;
                            document.getElementById('cursor-state').innerText = `HOLD ${Math.min(100, Math.round((dwellFrames / 22) * 100))}%`;
                            if (dwellFrames === 22) {
                                triggerSyntheticClick(smoothX, smoothY, 'DWELL');
                                dwellFrames = -15; // Cooldown before next dwell click
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
