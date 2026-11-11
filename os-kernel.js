/* ============================================================================
   SYNAPSE OS KERNEL v1.2 (LANDSCAPE WIDESCREEN EDITION) — POWERED BY LEGEND
   Handles: Fullscreen Landscape Lock, Quantum Clock, Battery API, Touch Windows
   ============================================================================ */

const Kernel = (() => {
    let zIndexCounter = 100;
    let audioEnabled = true;
    let aeroActive = false;
    let audioCtx = null;
    const openWindows = {};

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
        } catch (err) {
            // Browser requires manual rotation if orientation lock is unsupported
        }
    }

    // --- 3. BIOS BOOT SEQUENCE ---
    const bootMessages = [
        "[0.002] INIT SYNAPSE MICROKERNEL v4.9.0 (POWERED BY LEGEND)...",
        "[0.018] CPU0: VIRTUAL SILICON CORTEX // WEBGPU & WASM VECTOR [OK]",
        "[0.042] ALLOCATING 256 SPIKING NEURAL NETWORK SYNAPSES... [OK]",
        "[0.089] MOUNTING GATE-LEVEL FPGA LOGIC MATRIX (64-LUT)... [OK]",
        "[0.130] INITIALIZING LOCAL WI-FI WEBRTC SWARM BROKER... [OK]",
        "[0.195] CALIBRATING WIDESCREEN LANDSCAPE COCKPIT & CHRONOMETER... [OK]",
        "[0.240] ALL SYSTEMS NOMINAL. READY FOR OPERATOR HANDSHAKE."
    ];

    function runBootSequence() {
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
        }, 250);
    }

    function enterDesktop() {
        forceLandscapeFullscreen();
        playTone(1200, 0.15, 'triangle');
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
        initBackgroundGrid();
        startQuantumClockAndTelemetry();
        initHardwareBattery();
        setTimeout(() => openApp('terminal'), 350);
    }

    // --- 4. HIGH-PRECISION QUANTUM CLOCK & TELEMETRY ---
    function startQuantumClockAndTelemetry() {
        const topClock = document.getElementById('sys-clock');
        const topAmPm = document.getElementById('sys-ampm');
        const holoTime = document.getElementById('holo-time');
        const holoMs = document.getElementById('holo-ms');
        const holoDate = document.getElementById('holo-date');

        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        // 60FPS Millisecond Precision Clock Loop
        function updateClock() {
            const now = new Date();
            let hrs = now.getHours();
            const ampm = hrs >= 12 ? 'PM' : 'AM';
            const hrs12 = String(hrs % 12 || 12).padStart(2, '0');
            const hrs24 = String(hrs).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            const ms = String(now.getMilliseconds()).padStart(3, '0');

            topClock.innerText = `${hrs12}:${mins}:${secs}`;
            topAmPm.innerText = ampm;

            if (holoTime) {
                holoTime.innerText = `${hrs24}:${mins}:${secs}`;
                holoMs.innerText = `.${ms}`;
                holoDate.innerText = `${days[now.getDay()]} // ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} // IST`;
            }
            requestAnimationFrame(updateClock);
        }
        requestAnimationFrame(updateClock);

        // 1-Second Kernel Telemetry Loop
        setInterval(() => {
            const fps = (58.5 + Math.random() * 1.5).toFixed(1);
            const ram = (42 + Object.keys(openWindows).length * 14.5 + Math.random() * 2).toFixed(1);
            document.getElementById('hud-fps').innerText = `${fps} Hz`;
            document.getElementById('hud-ram').innerText = `${ram} MB`;
            document.getElementById('bar-ram').style.width = `${Math.min(95, ram)}%`;
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

    // --- 7. MULTI-WINDOW MANAGER (WITH MOBILE TOUCH + MOUSE DRAG) ---
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
            terminal: 'SYNAPSE SHELL // ROOT TERMINAL'
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
        else {
            container.innerHTML = `<div style="padding:20px;color:#00f0ff;">[MODULE READY TO MOUNT IN NEXT BATCH: ${appId.toUpperCase()}]</div>`;
        }
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

    // Supports both Desktop Mouse & Mobile Landscape Finger Dragging
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

    // --- 8. INTERACTIVE SYNAPSE TERMINAL ---
    function initTerminal(container) {
        container.innerHTML = `
            <div class="term-output" id="term-out">SYNAPSE OS v1.2 (WIDESCREEN COCKPIT) // POWERED BY LEGEND
Type 'help' to list available kernel commands.
──────────────────────────────────────────────────────────</div>
            <div class="term-input-line">
                <span class="term-prompt">root@synapse:~#</span>
                <input type="text" class="term-input" id="term-in" autofocus placeholder="type command (help, neofetch, fpga, neuro, swarm, time)..." />
            </div>
        `;
        const input = container.querySelector('#term-in');
        const out = container.querySelector('#term-out');

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const raw = input.value.trim();
                const cmd = raw.toLowerCase();
                input.value = '';
                playTone(720, 0.03, 'square');

                let resp = '';
                if (cmd === 'help') {
                    resp = `Available Commands:
  neofetch   - Display SYNAPSE hardware & LEGEND architecture specs
  fpga       - Launch Virtual Silicon FPGA Logic Simulator
  neuro      - Launch 3rd-Gen Spiking Neural Brain Engine
  swarm      - Launch Multi-Phone Wi-Fi Supercomputer Cluster
  aero       - Toggle Camera Hand-Gesture Control
  time       - Show high-precision system timestamp
  clear      - Clear terminal buffer`;
                } else if (cmd === 'neofetch') {
                    resp = `
   💠 SYNAPSE // OS       OS: SYNAPSE WebKernel x86_64 (Landscape)
   ────────────────       Architecture: POWERED BY LEGEND
   HOST: Browser-V8       Silicon: Virtual 64-Gate FPGA Grid
   NEURAL: 256 SNN        Cluster: Local Wi-Fi WebRTC Mesh
   GESTURE: MediaPipe     Status: UNLOCKED // MAXIMUM PERFORMANCE`;
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

    // --- 9. AERO-TOUCH HAND GESTURE ENGINE (MediaPipe Hands) ---
    let mpCamera = null;
    let lastPinch = false;

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
                minDetectionConfidence: 0.65,
                minTrackingConfidence: 0.65
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

                    const screenX = (1 - indexTip.x) * window.innerWidth;
                    const screenY = indexTip.y * window.innerHeight;

                    cursor.style.left = `${screenX}px`;
                    cursor.style.top = `${screenY}px`;

                    const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
                    const isPinching = pinchDist < 0.055;

                    if (isPinching) {
                        cursor.classList.add('pinching');
                        document.getElementById('cursor-state').innerText = 'PINCH [CLICK]';
                        if (!lastPinch) {
                            playTone(1350, 0.04, 'sine');
                            const target = document.elementFromPoint(screenX, screenY);
                            if (target) target.click();
                        }
                    } else {
                        cursor.classList.remove('pinching');
                        document.getElementById('cursor-state').innerText = 'TRACKING';
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
