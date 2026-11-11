/* ============================================================================
   MODULE 2: NEURO-SPIKE // 3RD-GEN NEUROMORPHIC SPIKING NEURAL NETWORK (SNN)
   Powered by LEGEND — Leaky Integrate-and-Fire Neurons + Live STDP Learning
   ============================================================================ */

window.NeuroSpike = (() => {
    let animId = null;

    function mount(container) {
        container.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;font-family:'Share Tech Mono',monospace;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:#040811;padding:7px 12px;border:1px solid rgba(0,240,255,0.25);border-radius:4px;">
                    <div style="display:flex;gap:12px;font-size:0.74rem;">
                        <span>CORTEX: <b style="color:#00f0ff">72 LIF NEURONS</b></span>
                        <span>PLASTICITY: <b style="color:#00ff9d">STDP ACTIVE</b></span>
                        <span>SPIKE RATE: <b id="snn-hz" style="color:#ffb800">0 Hz</b></span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button id="snn-shock-btn" style="background:rgba(0,240,255,0.15);border:1px solid #00f0ff;color:#00f0ff;padding:3px 10px;font-size:0.7rem;cursor:pointer;font-family:'Orbitron',sans-serif;">⚡ INJECT DOPAMINE SURGE</button>
                        <button id="snn-reset-btn" style="background:rgba(255,42,84,0.15);border:1px solid #ff2a54;color:#ff2a54;padding:3px 10px;font-size:0.7rem;cursor:pointer;font-family:'Orbitron',sans-serif;">REWIRE SYNAPSES</button>
                    </div>
                </div>

                <div style="flex:1;position:relative;background:#02050a;border:1px solid rgba(0,240,255,0.28);border-radius:4px;overflow:hidden;">
                    <canvas id="snn-canvas" style="width:100%;height:100%;display:block;cursor:crosshair;"></canvas>
                    <div style="position:absolute;bottom:6px;left:8px;font-size:0.65rem;color:#64829e;pointer-events:none;">
                        CLICK / TOUCH ANYWHERE ON CORTEX TO INJECT BIO-ELECTRIC ACTION POTENTIAL
                    </div>
                </div>
            </div>
        `;

        const canvas = container.querySelector('#snn-canvas');
        const ctx = canvas.getContext('2d');
        const hzEl = container.querySelector('#snn-hz');

        let w = canvas.width = canvas.clientWidth || 560;
        let h = canvas.height = canvas.clientHeight || 260;

        let neurons = [];
        let synapses = [];
        let pulses = [];
        let spikeCounter = 0;

        function buildBrain() {
            w = canvas.width = canvas.clientWidth || 560;
            h = canvas.height = canvas.clientHeight || 260;
            neurons = [];
            synapses = [];
            pulses = [];

            const count = 68;
            for (let i = 0; i < count; i++) {
                neurons.push({
                    id: i,
                    x: 30 + Math.random() * (w - 60),
                    y: 25 + Math.random() * (h - 50),
                    v: Math.random() * 0.4,       // Membrane potential
                    threshold: 1.0,
                    refractory: 0,
                    lastFire: 0
                });
            }

            // Connect nearby neurons with plastic synapses
            neurons.forEach((n1, i) => {
                neurons.forEach((n2, j) => {
                    if (i !== j) {
                        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                        if (dist < 95 && Math.random() < 0.42) {
                            synapses.push({
                                from: i,
                                to: j,
                                weight: 0.25 + Math.random() * 0.45,
                                dist
                            });
                        }
                    }
                });
            });
        }

        buildBrain();

        function triggerBurst(cx, cy, radius = 90) {
            if (window.Kernel) Kernel.playTone(1040, 0.05, 'sine');
            neurons.forEach(n => {
                if (Math.hypot(n.x - cx, n.y - cy) < radius) {
                    n.v = 1.25;
                }
            });
        }

        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            triggerBurst(e.clientX - rect.left, e.clientY - rect.top, 85);
        });

        canvas.addEventListener('touchstart', e => {
            const rect = canvas.getBoundingClientRect();
            const t = e.touches[0];
            triggerBurst(t.clientX - rect.left, t.clientY - rect.top, 85);
        }, { passive: true });

        container.querySelector('#snn-shock-btn').onclick = () => {
            triggerBurst(w / 2, h / 2, w);
        };

        container.querySelector('#snn-reset-btn').onclick = () => {
            if (window.Kernel) Kernel.playTone(520, 0.08, 'sawtooth');
            buildBrain();
        };

        if (animId) cancelAnimationFrame(animId);

        let frame = 0;
        function stepBrain() {
            if (!document.body.contains(canvas)) return;
            frame++;

            if (canvas.clientWidth !== w || canvas.clientHeight !== h) {
                w = canvas.width = canvas.clientWidth;
                h = canvas.height = canvas.clientHeight;
            }

            ctx.fillStyle = 'rgba(2, 5, 10, 0.32)';
            ctx.fillRect(0, 0, w, h);

            // Spontaneous thalamic pacemaker input
            if (Math.random() < 0.18 && neurons.length > 0) {
                const pick = neurons[Math.floor(Math.random() * neurons.length)];
                pick.v += 0.65;
            }

            // Draw Synapses
            synapses.forEach(syn => {
                const n1 = neurons[syn.from];
                const n2 = neurons[syn.to];
                ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(0.45, syn.weight * 0.35)})`;
                ctx.lineWidth = syn.weight * 1.6;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
            });

            // Update Traveling Action Potential Spikes
            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += 0.065;
                const n1 = neurons[p.from];
                const n2 = neurons[p.to];
                const px = n1.x + (n2.x - n1.x) * p.progress;
                const py = n1.y + (n2.y - n1.y) * p.progress;

                ctx.fillStyle = '#00ff9d';
                ctx.beginPath();
                ctx.arc(px, py, 2.4, 0, Math.PI * 2);
                ctx.fill();

                if (p.progress >= 1) {
                    if (n2.refractory <= 0) {
                        n2.v += p.weight * 0.55;
                        // STDP Hebbian Reinforcement: strengthen active synapse
                        p.syn.weight = Math.min(1.2, p.syn.weight + 0.015);
                    }
                    pulses.splice(i, 1);
                }
            }

            // Update LIF Neurons
            neurons.forEach((n, idx) => {
                if (n.refractory > 0) {
                    n.refractory--;
                    n.v = 0.1;
                } else {
                    n.v *= 0.965; // Membrane leak
                    if (n.v >= n.threshold) {
                        n.v = 0;
                        n.refractory = 14;
                        n.lastFire = frame;
                        spikeCounter++;

                        // Emit spikes along outgoing axons
                        synapses.forEach(syn => {
                            if (syn.from === idx && pulses.length < 260) {
                                pulses.push({
                                    from: syn.from,
                                    to: syn.to,
                                    weight: syn.weight,
                                    syn,
                                    progress: 0
                                });
                            }
                        });
                    }
                }

                const firedRecently = (frame - n.lastFire) < 8;
                const radius = firedRecently ? 6.5 : 3.5 + n.v * 2;
                ctx.fillStyle = firedRecently ? '#ffffff' : (n.v > 0.6 ? '#00ff9d' : '#00f0ff');
                ctx.beginPath();
                ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
                ctx.fill();

                if (firedRecently) {
                    ctx.strokeStyle = 'rgba(0, 255, 157, 0.7)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 11, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            if (frame % 30 === 0) {
                hzEl.innerText = `${spikeCounter * 2} Spikes/s`;
                const synHud = document.getElementById('hud-syn');
                if (synHud) synHud.innerText = `${synapses.length} ACTIVE`;
                spikeCounter = 0;
            }

            animId = requestAnimationFrame(stepBrain);
        }

        stepBrain();
    }

    return { mount };
})();
