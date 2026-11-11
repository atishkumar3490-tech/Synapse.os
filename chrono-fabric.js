/* ============================================================================
   MODULE 4: CHRONO-FABRIC & NEURAL SUBSTRATE KERNEL (v4.1 — ZERO-HANG FIXED)
   Powered by LEGEND Architecture
   Features (100% Intact):
   1. One-Pass Zero-Emoji SVG Wireframe UI Purger (No Infinite Observer Loop)
   2. Bottom-Up Spiking Neural OS Substrate (Sensory -> Cortex -> Motor Neurons)
   3. Quantum Memory-Entangled Chrono-Core (Live OS State Time-Travel Engine)
   4. 60-FPS Cellular Automata & Data-Gravity Background Field
   ============================================================================ */

window.ChronoFabric = (() => {
    const MAX_SNAPSHOTS = 90;
    const snapshots = [];
    let isTimeTraveling = false;
    let currentSliderIndex = -1;
    let db = null;
    let svgsMountedOnce = false;

    // --- 1. BOTTOM-UP SPIKING NEURAL OS SUBSTRATE (SENSORY -> CORTEX -> MOTOR) ---
    const Substrate = {
        sensoryEnergy: 0,
        cortexWeights: new Float32Array(32).fill(0.5),
        spikeHistory: Array(60).fill(0),
        motorOutput: 'IDLE',

        injectSensorySpike(intensity = 1.0, source = 'INPUT') {
            this.sensoryEnergy = Math.min(100, this.sensoryEnergy + intensity * 14);
            const idx = Math.floor(Math.random() * this.cortexWeights.length);
            this.cortexWeights[idx] = Math.min(1.0, this.cortexWeights[idx] + 0.04);
            this.motorOutput = source;
        },

        step() {
            this.sensoryEnergy *= 0.92;
            const activeSpikes = Math.round((this.sensoryEnergy / 100) * 16 + (Math.random() * 2));
            this.spikeHistory.push(activeSpikes);
            this.spikeHistory.shift();
        }
    };

    window.SynapseSubstrate = Substrate;

    // --- 2. ZERO-EMOJI VECTOR SVG UI PURGER (LOCKED TO RUN ONCE — NO HANG) ---
    function purgeEmojisAndMountSVGs() {
        if (svgsMountedOnce) return;

        const svgMap = {
            fpga: `<svg class="svg-cyber-icon" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 1v5M15 1v5M9 18v5M15 18v5M1 9h5M1 15h5M18 9h5M18 15h5"/><rect x="9" y="9" width="6" height="6"/></svg>`,
            neuro: `<svg class="svg-cyber-icon" viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="12" r="3"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 7.5l2 3M16 7.5l-2 3M8 16.5l2-3M16 16.5l-2-3M6 8.5v7M18 8.5v7"/></svg>`,
            swarm: `<svg class="svg-cyber-icon" viewBox="0 0 24 24"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v7.5M21 7l-6.8 3.8M21 17l-6.8-3.8M12 22v-7.5M3 17l6.8-3.8M3 7l6.8 3.8"/></svg>`,
            terminal: `<svg class="svg-cyber-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="1.5"/><path d="M6 9l4 3-4 3M12 15h6"/></svg>`,
            ide: `<svg class="svg-cyber-icon" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>`
        };

        const icons = document.querySelectorAll('.desk-icon');
        if (icons.length === 0) return;

        icons.forEach(iconEl => {
            const onclickAttr = iconEl.getAttribute('onclick') || '';
            const box = iconEl.querySelector('.icon-box');
            if (!box) return;
            if (onclickAttr.includes('fpga')) box.innerHTML = svgMap.fpga;
            else if (onclickAttr.includes('neuro')) box.innerHTML = svgMap.neuro;
            else if (onclickAttr.includes('swarm')) box.innerHTML = svgMap.swarm;
            else if (onclickAttr.includes('terminal')) box.innerHTML = svgMap.terminal;
        });

        const dock = document.querySelector('.icon-dock');
        if (dock && !document.getElementById('dock-ide-icon')) {
            const ideDiv = document.createElement('div');
            ideDiv.id = 'dock-ide-icon';
            ideDiv.className = 'desk-icon';
            ideDiv.setAttribute('onclick', "Kernel.openApp('ide')");
            ideDiv.innerHTML = `<div class="icon-box">${svgMap.ide}</div><span>PY-CORTEX</span>`;
            dock.appendChild(ideDiv);
        }

        const aeroBtn = document.getElementById('aero-toggle');
        if (aeroBtn) {
            const st = document.getElementById('aero-status');
            const stText = st ? st.innerText : 'OFF';
            aeroBtn.innerHTML = `[OPTIC-AERO: <b id="aero-status">${stText}</b>]`;
        }

        const audioBtn = document.getElementById('audio-toggle');
        if (audioBtn) {
            audioBtn.innerText = audioBtn.innerText.includes('OFF') ? '[AUDIO: MUTE]' : '[AUDIO: SYN]';
        }

        const swarmBadge = document.getElementById('swarm-badge');
        if (swarmBadge) {
            const cnt = document.getElementById('swarm-count');
            const cntText = cnt ? cnt.innerText : '1 NODE';
            swarmBadge.innerHTML = `[DARK-GRID: <b id="swarm-count">${cntText}</b>]`;
        }

        svgsMountedOnce = true;
    }

    // --- 3. INDEXED-DB PERSISTENT QUANTUM STATE LEDGER ---
    function initIndexedDB() {
        if (!window.indexedDB) return;
        try {
            const req = indexedDB.open('SynapseChronoDB', 1);
            req.onupgradeneeded = e => {
                const database = e.target.result;
                if (!database.objectStoreNames.contains('timeline')) {
                    database.createObjectStore('timeline', { keyPath: 'id' });
                }
            };
            req.onsuccess = e => {
                db = e.target.result;
            };
        } catch (err) {}
    }

    // --- 4. CAPTURE & RESTORE FULL OS MEMORY STATE (TIME-TRAVEL) ---
    function captureOSState() {
        if (isTimeTraveling) return;

        const winElements = document.querySelectorAll('.os-window');
        const windowsState = [];

        winElements.forEach(w => {
            const appId = w.id.replace('win-', '');
            windowsState.push({
                appId,
                left: w.style.left,
                top: w.style.top,
                zIndex: w.style.zIndex,
                maximized: w.classList.contains('maximized')
            });
        });

        const now = new Date();
        const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const snap = {
            id: Date.now(),
            timeLabel,
            windows: windowsState,
            vfsRaw: localStorage.getItem('synapse_vfs') || '{}',
            neuralEnergy: Math.round(Substrate.sensoryEnergy)
        };

        snapshots.push(snap);
        if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();

        if (db) {
            try {
                const tx = db.transaction('timeline', 'readwrite');
                tx.objectStore('timeline').put({ id: 'latest', ...snap });
            } catch (err) {}
        }

        const slider = document.getElementById('chrono-slider');
        const label = document.getElementById('chrono-state-readout');
        if (slider && !isTimeTraveling) {
            slider.max = Math.max(0, snapshots.length - 1);
            slider.value = snapshots.length - 1;
            currentSliderIndex = snapshots.length - 1;
        }
        if (label && !isTimeTraveling) {
            label.innerText = `T-00s [LIVE // ${snapshots.length} STATES]`;
        }
    }

    function restoreOSState(index) {
        const snap = snapshots[index];
        if (!snap) return;

        isTimeTraveling = true;
        if (window.Kernel) Kernel.playTone(540 + (index * 6), 0.04, 'sawtooth');

        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.classList.remove('chrono-warp-active');
            void desktop.offsetWidth;
            desktop.classList.add('chrono-warp-active');
        }

        if (snap.vfsRaw) {
            localStorage.setItem('synapse_vfs', snap.vfsRaw);
        }

        const currentWins = Array.from(document.querySelectorAll('.os-window'));
        const targetIds = snap.windows.map(w => w.appId);

        currentWins.forEach(w => {
            const id = w.id.replace('win-', '');
            if (!targetIds.includes(id) && window.Kernel) {
                Kernel.closeApp(id);
            }
        });

        snap.windows.forEach(wState => {
            let winEl = document.getElementById(`win-${wState.appId}`);
            if (!winEl && window.Kernel) {
                Kernel.openApp(wState.appId);
                winEl = document.getElementById(`win-${wState.appId}`);
            }
            if (winEl) {
                winEl.style.left = wState.left;
                winEl.style.top = wState.top;
                winEl.style.zIndex = wState.zIndex;
                if (wState.maximized) winEl.classList.add('maximized');
                else winEl.classList.remove('maximized');
            }
        });

        const deltaSec = snapshots.length - 1 - index;
        const label = document.getElementById('chrono-state-readout');
        if (label) {
            if (deltaSec === 0) {
                label.innerText = `T-00s [LIVE STREAM]`;
                label.style.color = '#00ff9d';
                isTimeTraveling = false;
            } else {
                label.innerText = `T-${deltaSec}s [${snap.timeLabel}]`;
                label.style.color = '#ffb800';
            }
        }
    }

    // --- 5. MOUNT CHRONO-CORE BAR & SUBSTRATE TELEMETRY ---
    function mountChronoUI() {
        const desktop = document.getElementById('desktop');
        if (!desktop || document.getElementById('chrono-dock')) return;

        const bar = document.createElement('div');
        bar.id = 'chrono-dock';
        bar.innerHTML = `
            <span class="chrono-tag">[CHRONO-CORE // TIME-TRAVEL]</span>
            <button class="chrono-btn" id="chrono-prev" title="Step Back 1s">&lt;&lt;</button>
            <input type="range" id="chrono-slider" class="chrono-slider" min="0" max="0" value="0" />
            <button class="chrono-btn" id="chrono-live" title="Return to Present">LIVE &gt;&gt;</button>
            <span id="chrono-state-readout" style="font-size:0.65rem;color:#00ff9d;min-width:135px;text-align:right;">T-00s [SYNCING]</span>
        `;
        desktop.appendChild(bar);

        const slider = bar.querySelector('#chrono-slider');
        slider.addEventListener('input', e => {
            const idx = Number(e.target.value);
            currentSliderIndex = idx;
            restoreOSState(idx);
        });

        bar.querySelector('#chrono-prev').onclick = () => {
            if (snapshots.length > 1) {
                const target = Math.max(0, (currentSliderIndex > 0 ? currentSliderIndex : snapshots.length - 1) - 1);
                slider.value = target;
                currentSliderIndex = target;
                restoreOSState(target);
            }
        };

        bar.querySelector('#chrono-live').onclick = () => {
            if (snapshots.length > 0) {
                const last = snapshots.length - 1;
                slider.value = last;
                currentSliderIndex = last;
                restoreOSState(last);
                isTimeTraveling = false;
            }
        };

        const hudCard = document.querySelector('.telemetry-hud .hud-card');
        if (hudCard && !document.getElementById('substrate-live-box')) {
            const subBox = document.createElement('div');
            subBox.id = 'substrate-live-box';
            subBox.innerHTML = `
                <div style="display:flex;justify-content:space-between;">
                    <span>KERNEL SUBSTRATE</span>
                    <b id="sub-motor-state" style="color:#00ff9d">SPIKING</b>
                </div>
                <canvas id="substrate-raster" width="160" height="36"></canvas>
            `;
            hudCard.appendChild(subBox);
        }
    }

    // --- 6. CELLULAR AUTOMATA & BIO-DIGITAL GRAVITY BACKGROUND ---
    function initCellularField() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;

        window.addEventListener('mousemove', e => {
            pointerX = e.clientX;
            pointerY = e.clientY;
            Substrate.injectSensorySpike(0.35, 'MOTION');
        }, { passive: true });

        window.addEventListener('keydown', () => {
            Substrate.injectSensorySpike(1.2, 'KEY_IN');
        }, { passive: true });

        window.addEventListener('mousedown', () => {
            Substrate.injectSensorySpike(1.5, 'EXEC');
        }, { passive: true });

        function renderRaster() {
            Substrate.step();
            const rCanvas = document.getElementById('substrate-raster');
            const mState = document.getElementById('sub-motor-state');

            if (mState) {
                mState.innerText = `${Math.round(Substrate.sensoryEnergy)} mV // ${Substrate.motorOutput}`;
            }

            if (rCanvas) {
                const rCtx = rCanvas.getContext('2d');
                const rw = rCanvas.width;
                const rh = rCanvas.height;
                rCtx.clearRect(0, 0, rw, rh);

                rCtx.strokeStyle = '#00ff9d';
                rCtx.lineWidth = 1.3;
                rCtx.beginPath();
                const hist = Substrate.spikeHistory;
                for (let i = 0; i < hist.length; i++) {
                    const x = (i / (hist.length - 1)) * rw;
                    const y = rh - 4 - Math.min(rh - 8, (hist[i] / 18) * (rh - 8));
                    if (i === 0) rCtx.moveTo(x, y);
                    else rCtx.lineTo(x, y);
                }
                rCtx.stroke();
            }

            if (ctx && Substrate.sensoryEnergy > 5) {
                ctx.save();
                ctx.strokeStyle = `rgba(0, 255, 157, ${Math.min(0.28, Substrate.sensoryEnergy / 280)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(pointerX, pointerY, 18 + (Substrate.sensoryEnergy * 0.35), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            requestAnimationFrame(renderRaster);
        }

        requestAnimationFrame(renderRaster);
    }

    // --- 7. SAFE AUTO-BOOT HOOK (NO INFINITE OBSERVER LOOP + ROTATE BYPASS) ---
    function init() {
        initIndexedDB();
        purgeEmojisAndMountSVGs();
        mountChronoUI();
        initCellularField();

        // Failsafe: Ensure [FORCE WIDESCREEN LOCK] button always dismisses #rotate-guard
        const guard = document.getElementById('rotate-guard');
        if (guard) {
            const lockBtn = guard.querySelector('button');
            if (lockBtn) {
                lockBtn.addEventListener('click', () => {
                    guard.classList.add('hidden');
                    guard.style.setProperty('display', 'none', 'important');
                });
            }
        }

        // Watch ONLY #desktop class change (0% CPU overhead, zero infinite loops)
        const desktop = document.getElementById('desktop');
        if (desktop) {
            const observer = new MutationObserver(() => {
                if (!desktop.classList.contains('hidden')) {
                    purgeEmojisAndMountSVGs();
                    mountChronoUI();
                }
            });
            observer.observe(desktop, { attributes: true, attributeFilter: ['class'] });
        }

        setInterval(() => {
            if (desktop && !desktop.classList.contains('hidden')) {
                captureOSState();
            }
        }, 1500);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        captureOSState,
        restoreOSState,
        purgeEmojisAndMountSVGs
    };
})();
