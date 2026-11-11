/* ============================================================================
   SYNAPSE OS KERNEL v1.0 — POWERED BY LEGEND
   Handles: Bootloader, WebAudio Synth, Draggable Windows, Terminal & Aero-Touch
   ============================================================================ */

const Kernel = (() => {
    let zIndexCounter = 100;
    let audioEnabled = true;
    let aeroActive = false;
    let audioCtx = null;
    const openWindows = {};

    // --- 1. WEBAUDIO SCI-FI SOUND SYNTHESIZER (Zero external MP3 needed) ---
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

    // --- 2. BIOS BOOT SEQUENCE ---
    const bootMessages = [
        "[0.002] INIT SYNAPSE MICROKERNEL v4.9.0 (POWERED BY LEGEND)...",
        "[0.018] CPU0: VIRTUAL SILICON CORTEX // WEBGPU & WASM VECTOR [OK]",
        "[0.042] ALLOCATING 256 SPIKING NEURAL NETWORK SYNAPSES... [OK]",
        "[0.089] MOUNTING GATE-LEVEL FPGA LOGIC MATRIX (64-LUT)... [OK]",
        "[0.130] INITIALIZING LOCAL WI-FI WEBRTC SWARM BROKER... [OK]",
        "[0.195] CALIBRATING MEDIAPIPE AERO-TOUCH OPTICAL ENGINE... [OK]",
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
        }, 280);
    }

    function enterDesktop() {
        playTone(1200, 0.15, 'triangle');
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
        initBackgroundGrid();
        startTelemetry();
        // Auto-launch terminal on boot
        setTimeout(() => openApp('terminal'), 300);
    }

    // --- 3. CYBERPUNK ANIMATED PARTICLE MATRIX ---
    function initBackgroundGrid() {
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        const nodes = Array.from({ length: 45 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6
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
                    const dist = Math.hypot(dx, dy);
                    if (dist < 140) {
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

    // --- 4. LIVE CLOCK & TELEMETRY ---
    function startTelemetry() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('sys-clock').innerText = now.toTimeString().split(' ')[0];
            const fps = (58 + Math.random() * 2).toFixed(1);
            const ram = (40 + Object.keys(openWindows).length * 14.2 + Math.random() * 2).toFixed(1);
            document.getElementById('hud-fps').innerText = `${fps} Hz`;
            document.getElementById('hud-ram').innerText = `${ram} MB`;
            document.getElementById('bar-ram').style.width = `${Math.min(95, ram)}%`;
        }, 1000);
    }

    // --- 5. MULTI-WINDOW MANAGER ---
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
        const offset = Object.keys(openWindows).length * 28;
        win.style.left = `${Math.min(140 + offset, window.innerWidth - 700)}px`;
        win.style.top = `${Math.max(20, 40 + offset)}px`;
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
                    <button class="win-btn close" onclick="Kernel.closeApp('${appId}')">✕</button>
                </div>
            </div>
            <div class="win-body" id="body-${appId}"></div>
        `;

        win.addEventListener('mousedown', () => focusWindow(appId));
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
        header.addEventListener('mousedown', e => {
            isDown = true;
            startX = e.clientX - win.offsetLeft;
            startY = e.clientY - win.offsetTop;
        });
        window.addEventListener('mousemove', e => {
            if (!isDown) return;
            win.style.left = `${Math.max(0, e.clientX - startX)}px`;
            win.style.top = `${Math.max(0, e.clientY - startY)}px`;
        });
        window.addEventListener('mouseup', () => isDown = false);
    }

    // --- 6. INTERACTIVE SYNAPSE TERMINAL ---
    function initTerminal(container) {
        container.innerHTML = `
            <div class="term-output" id="term-out">SYNAPSE OS v1.0 // POWERED BY LEGEND
Type 'help' to list available kernel commands.
──────────────────────────────────────────────────</div>
            <div class="term-input-line">
                <span class="term-prompt">root@synapse:~#</span>
                <input type="text" class="term-input" id="term-in" autofocus placeholder="enter command..." />
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
  clear      - Clear terminal buffer`;
                } else if (cmd === 'neofetch') {
                    resp = `
   💠 SYNAPSE // OS       OS: SYNAPSE WebKernel x86_64
   ────────────────       Architecture: POWERED BY LEGEND
   HOST: Browser-V8       Silicon: Virtual 64-Gate FPGA Grid
   NEURAL: 256 SNN        Cluster: Local Wi-Fi WebRTC Mesh
   GESTURE: MediaPipe     Status: UNLOCKED // MAXIMUM PERFORMANCE`;
                } else if (cmd === 'fpga') { openApp('fpga'); resp = 'Mounting Silicon FPGA Lab...'; }
                else if (cmd === 'neuro') { openApp('neuro'); resp = 'Initializing Spiking Neural Network...'; }
                else if (cmd === 'swarm') { openApp('swarm'); resp = 'Opening Wi-Fi Swarm Cluster Controller...'; }
                else if (cmd === 'aero') { toggleAeroTouch(); resp = 'Toggling Aero-Touch Optical Hand Tracking...'; }
                else if (cmd === 'clear') { out.innerHTML = ''; return; }
                else if (cmd !== '') { resp = `synapse: command not found: ${raw}`; }

                out.innerHTML += `\n<span style="color:#00ff9d">root@synapse:~#</span> ${raw}\n${resp}`;
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    // --- 7. AERO-TOUCH HAND GESTURE ENGINE (MediaPipe Hands) ---
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

                    // Index Finger Tip (#8) & Thumb Tip (#4)
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
            alert('Camera Error: Make sure site is on HTTPS (Vercel) and camera permission is allowed.');
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
        openApp,
        closeApp,
        toggleAeroTouch,
        toggleAudio,
        playTone
    };
})();
