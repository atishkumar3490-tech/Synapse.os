/* ============================================================================
   MODULE 1: SILICON FPGA // GATE-LEVEL LOGIC & ALU SIMULATOR
   Powered by LEGEND Architecture — Real-time Logic Gates + Digital Oscilloscope
   ============================================================================ */

window.SiliconFPGA = (() => {
    let animId = null;
    let clockHz = 4;
    let clkState = 0;
    let regA = [1, 0, 1, 0]; // Binary 5 (LSB first: A0..A3)
    let regB = [1, 1, 0, 0]; // Binary 3
    let mode = 'ADD';        // ADD, XOR, AND, SUB
    let pulseOffset = 0;
    const historyLen = 120;
    const waveHistory = {
        CLK: Array(historyLen).fill(0),
        A0: Array(historyLen).fill(1),
        B0: Array(historyLen).fill(1),
        SUM0: Array(historyLen).fill(0),
        COUT: Array(historyLen).fill(0)
    };

    function computeALU() {
        const valA = regA[0] + (regA[1] << 1) + (regA[2] << 2) + (regA[3] << 3);
        const valB = regB[0] + (regB[1] << 1) + (regB[2] << 2) + (regB[3] << 3);
        let res = 0;
        if (mode === 'ADD') res = valA + valB;
        else if (mode === 'XOR') res = valA ^ valB;
        else if (mode === 'AND') res = valA & valB;
        else if (mode === 'SUB') res = Math.max(0, valA - valB);

        const outBits = [
            (res >> 0) & 1,
            (res >> 1) & 1,
            (res >> 2) & 1,
            (res >> 3) & 1
        ];
        const carry = (res >> 4) & 1;
        return { valA, valB, res, outBits, carry };
    }

    function mount(container) {
        // Ensure PC never shows portrait guard even if window is resized narrow
        const guard = document.getElementById('rotate-guard');
        if (guard && window.matchMedia('(pointer: fine)').matches) {
            guard.style.display = 'none';
        }

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:10px;font-family:'Share Tech Mono',monospace;">
                
                <!-- Top Control Bar -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:#040811;padding:8px 12px;border:1px solid rgba(0,240,255,0.25);border-radius:4px;">
                    <div style="display:flex;gap:6px;align-items:center;">
                        <span style="color:#00f0ff;font-family:'Orbitron',sans-serif;font-size:0.72rem;">ALU MODE:</span>
                        <button class="fpga-mode-btn" data-m="ADD" style="background:#00f0ff;color:#000;border:1px solid #00f0ff;padding:3px 8px;font-size:0.7rem;cursor:pointer;font-weight:bold;">FULL ADDER</button>
                        <button class="fpga-mode-btn" data-m="XOR" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:3px 8px;font-size:0.7rem;cursor:pointer;">XOR CIPHER</button>
                        <button class="fpga-mode-btn" data-m="AND" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:3px 8px;font-size:0.7rem;cursor:pointer;">AND MASK</button>
                        <button class="fpga-mode-btn" data-m="SUB" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:3px 8px;font-size:0.7rem;cursor:pointer;">SUBTRACTOR</button>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;font-size:0.75rem;">
                        <span>CLK: <b id="fpga-clk-readout" style="color:#00ff9d;">4.0 MHz</b></span>
                        <input type="range" id="fpga-clk-slider" min="1" max="16" value="4" style="width:70px;accent-color:#00f0ff;">
                        <span id="fpga-hex-out" style="background:#081526;border:1px solid #00f0ff;padding:2px 8px;color:#00ff9d;font-family:'Orbitron',sans-serif;font-weight:bold;">HEX: 0x08</span>
                    </div>
                </div>

                <!-- Middle Section: GPIO Input Pins + Silicon Die Canvas -->
                <div style="display:flex;gap:10px;flex:1;min-height:160px;">
                    
                    <!-- Left: GPIO Pin Toggles -->
                    <div style="width:155px;background:#040811;border:1px solid rgba(0,240,255,0.22);padding:8px;display:flex;flex-direction:column;justify-content:space-between;border-radius:4px;">
                        <div>
                            <div style="font-size:0.68rem;color:#00f0ff;margin-bottom:6px;font-family:'Orbitron',sans-serif;">REGISTER A (4-BIT)</div>
                            <div id="fpga-reg-a" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;"></div>
                        </div>
                        <div>
                            <div style="font-size:0.68rem;color:#00ff9d;margin-bottom:6px;font-family:'Orbitron',sans-serif;">REGISTER B (4-BIT)</div>
                            <div id="fpga-reg-b" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;"></div>
                        </div>
                        <div style="background:#020409;padding:6px;border-left:2px solid #00f0ff;font-size:0.68rem;line-height:1.4;">
                            <div>DEC A: <b id="dec-a" style="color:#00f0ff">5</b> | DEC B: <b id="dec-b" style="color:#00ff9d">3</b></div>
                            <div>ALU OUT: <b id="dec-out" style="color:#ffb800">8 (01000₂)</b></div>
                        </div>
                    </div>

                    <!-- Center: Live Silicon Gate Routing Canvas -->
                    <div style="flex:1;background:#03060c;border:1px solid rgba(0,240,255,0.25);border-radius:4px;position:relative;overflow:hidden;">
                        <canvas id="fpga-die-canvas" style="width:100%;height:100%;display:block;"></canvas>
                        <div style="position:absolute;top:6px;right:8px;font-size:0.65rem;color:#64829e;">LUT-64 SILICON DIE // LIVE ELECTRON FLOW</div>
                    </div>
                </div>

                <!-- Bottom: Real-time Digital Logic Analyzer (Oscilloscope) -->
                <div style="height:92px;background:#020408;border:1px solid rgba(0,240,255,0.28);border-radius:4px;position:relative;overflow:hidden;">
                    <canvas id="fpga-scope-canvas" style="width:100%;height:100%;display:block;"></canvas>
                    <div style="position:absolute;top:4px;left:8px;font-size:0.62rem;color:#00f0ff;font-family:'Orbitron',sans-serif;">
                        OSCILLOSCOPE // 5-CHANNEL LOGIC ANALYZER (CLK, A0, B0, SUM0, CARRY)
                    </div>
                </div>
            </div>
        `;

        const regAContainer = container.querySelector('#fpga-reg-a');
        const regBContainer = container.querySelector('#fpga-reg-b');

        function renderSwitches() {
            regAContainer.innerHTML = '';
            regBContainer.innerHTML = '';
            for (let i = 3; i >= 0; i--) {
                const btnA = document.createElement('button');
                btnA.innerText = `A${i}\n${regA[i]}`;
                btnA.style.cssText = `padding:5px 2px;font-size:0.68rem;cursor:pointer;border:1px solid #00f0ff;background:${regA[i] ? '#00f0ff' : '#050b14'};color:${regA[i] ? '#000' : '#00f0ff'};font-weight:bold;`;
                btnA.onclick = () => {
                    regA[i] = regA[i] ? 0 : 1;
                    if (window.Kernel) Kernel.playTone(regA[i] ? 1100 : 550, 0.04, 'square');
                    renderSwitches();
                };
                regAContainer.appendChild(btnA);

                const btnB = document.createElement('button');
                btnB.innerText = `B${i}\n${regB[i]}`;
                btnB.style.cssText = `padding:5px 2px;font-size:0.68rem;cursor:pointer;border:1px solid #00ff9d;background:${regB[i] ? '#00ff9d' : '#050b14'};color:${regB[i] ? '#000' : '#00ff9d'};font-weight:bold;`;
                btnB.onclick = () => {
                    regB[i] = regB[i] ? 0 : 1;
                    if (window.Kernel) Kernel.playTone(regB[i] ? 1250 : 600, 0.04, 'square');
                    renderSwitches();
                };
                regBContainer.appendChild(btnB);
            }

            const { valA, valB, res, outBits, carry } = computeALU();
            container.querySelector('#dec-a').innerText = valA;
            container.querySelector('#dec-b').innerText = valB;
            const binStr = `${carry}${outBits[3]}${outBits[2]}${outBits[1]}${outBits[0]}`;
            container.querySelector('#dec-out').innerText = `${res} (${binStr}₂)`;
            container.querySelector('#fpga-hex-out').innerText = `HEX: 0x${res.toString(16).toUpperCase().padStart(2, '0')}`;
        }

        renderSwitches();

        // Mode switcher
        container.querySelectorAll('.fpga-mode-btn').forEach(btn => {
            btn.onclick = () => {
                mode = btn.getAttribute('data-m');
                container.querySelectorAll('.fpga-mode-btn').forEach(b => {
                    b.style.background = 'transparent';
                    b.style.color = '#00f0ff';
                });
                btn.style.background = '#00f0ff';
                btn.style.color = '#000';
                if (window.Kernel) Kernel.playTone(920, 0.05, 'triangle');
                renderSwitches();
            };
        });

        const slider = container.querySelector('#fpga-clk-slider');
        const clkReadout = container.querySelector('#fpga-clk-readout');
        slider.oninput = () => {
            clockHz = Number(slider.value);
            clkReadout.innerText = `${clockHz}.0 MHz`;
        };

        const dieCanvas = container.querySelector('#fpga-die-canvas');
        const scopeCanvas = container.querySelector('#fpga-scope-canvas');
        const dieCtx = dieCanvas.getContext('2d');
        const scopeCtx = scopeCanvas.getContext('2d');

        let tickCount = 0;
        if (animId) cancelAnimationFrame(animId);

        function animate() {
            if (!document.body.contains(dieCanvas)) return;

            const dw = dieCanvas.width = dieCanvas.clientWidth;
            const dh = dieCanvas.height = dieCanvas.clientHeight;
            const sw = scopeCanvas.width = scopeCanvas.clientWidth;
            const sh = scopeCanvas.height = scopeCanvas.clientHeight;

            tickCount++;
            pulseOffset = (pulseOffset + clockHz * 0.45) % 40;
            const period = Math.max(4, Math.floor(40 / clockHz));
            if (tickCount % period === 0) clkState = clkState ? 0 : 1;

            const { outBits, carry } = computeALU();

            // Push to logic analyzer buffer
            waveHistory.CLK.push(clkState); waveHistory.CLK.shift();
            waveHistory.A0.push(regA[0]);   waveHistory.A0.shift();
            waveHistory.B0.push(regB[0]);   waveHistory.B0.shift();
            waveHistory.SUM0.push(outBits[0]); waveHistory.SUM0.shift();
            waveHistory.COUT.push(carry);   waveHistory.COUT.shift();

            // --- DRAW SILICON DIE GATES & WIRES ---
            dieCtx.clearRect(0, 0, dw, dh);

            // Background Silicon Grid
            dieCtx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            for (let x = 0; x < dw; x += 20) {
                dieCtx.beginPath(); dieCtx.moveTo(x, 0); dieCtx.lineTo(x, dh); dieCtx.stroke();
            }
            for (let y = 0; y < dh; y += 20) {
                dieCtx.beginPath(); dieCtx.moveTo(0, y); dieCtx.lineTo(dw, y); dieCtx.stroke();
            }

            // Draw 4 Bit Slices across the Silicon Die
            for (let i = 0; i < 4; i++) {
                const y = ((i + 0.8) / 4.6) * dh;
                const xIn = 25;
                const xGate1 = dw * 0.36;
                const xGate2 = dw * 0.64;
                const xOut = dw - 35;

                const bitA = regA[i];
                const bitB = regB[i];
                const bitOut = outBits[i];

                // Input Wire A
                dieCtx.strokeStyle = bitA ? '#00f0ff' : '#182b40';
                dieCtx.lineWidth = bitA ? 2.2 : 1.2;
                dieCtx.beginPath();
                dieCtx.moveTo(xIn, y - 8);
                dieCtx.lineTo(xGate1, y - 5);
                dieCtx.stroke();

                // Input Wire B
                dieCtx.strokeStyle = bitB ? '#00ff9d' : '#182b40';
                dieCtx.lineWidth = bitB ? 2.2 : 1.2;
                dieCtx.beginPath();
                dieCtx.moveTo(xIn, y + 8);
                dieCtx.lineTo(xGate1, y + 5);
                dieCtx.stroke();

                // Gate 1 Box (XOR / LUT)
                dieCtx.fillStyle = '#071222';
                dieCtx.strokeStyle = (bitA || bitB) ? '#00f0ff' : '#25415e';
                dieCtx.lineWidth = 1.5;
                dieCtx.fillRect(xGate1, y - 12, 46, 24);
                dieCtx.strokeRect(xGate1, y - 12, 46, 24);
                dieCtx.fillStyle = '#00f0ff';
                dieCtx.font = '10px Share Tech Mono';
                dieCtx.fillText(`${mode}_${i}`, xGate1 + 6, y + 3);

                // Interconnect Wire
                dieCtx.strokeStyle = bitOut ? '#ffb800' : '#182b40';
                dieCtx.beginPath();
                dieCtx.moveTo(xGate1 + 46, y);
                dieCtx.lineTo(xGate2, y);
                dieCtx.stroke();

                // Gate 2 Box (Flip-Flop Register)
                dieCtx.fillStyle = '#071222';
                dieCtx.strokeStyle = bitOut ? '#00ff9d' : '#25415e';
                dieCtx.fillRect(xGate2, y - 12, 44, 24);
                dieCtx.strokeRect(xGate2, y - 12, 44, 24);
                dieCtx.fillStyle = '#00ff9d';
                dieCtx.fillText(`DFF_${i}`, xGate2 + 6, y + 3);

                // Output Wire + Animated Electron Pulse
                dieCtx.strokeStyle = bitOut ? '#00ff9d' : '#182b40';
                dieCtx.beginPath();
                dieCtx.moveTo(xGate2 + 44, y);
                dieCtx.lineTo(xOut, y);
                dieCtx.stroke();

                if (bitOut) {
                    const px = xGate2 + 44 + ((pulseOffset / 40) * (xOut - (xGate2 + 44)));
                    dieCtx.fillStyle = '#ffffff';
                    dieCtx.beginPath();
                    dieCtx.arc(px, y, 3, 0, Math.PI * 2);
                    dieCtx.fill();
                }

                // Output LED Pad
                dieCtx.fillStyle = bitOut ? '#00ff9d' : '#0b1726';
                dieCtx.beginPath();
                dieCtx.arc(xOut, y, 6, 0, Math.PI * 2);
                dieCtx.fill();
                dieCtx.strokeStyle = '#00f0ff';
                dieCtx.stroke();
            }

            // --- DRAW 5-CHANNEL OSCILLOSCOPE WAVEFORMS ---
            scopeCtx.clearRect(0, 0, sw, sh);
            const channels = [
                { key: 'CLK', color: '#00f0ff', label: 'CLK' },
                { key: 'A0', color: '#38b6ff', label: 'IN_A0' },
                { key: 'B0', color: '#00ff9d', label: 'IN_B0' },
                { key: 'SUM0', color: '#ffb800', label: 'ALU_0' },
                { key: 'COUT', color: '#ff2a54', label: 'CARRY' }
            ];

            const rowH = (sh - 18) / channels.length;
            channels.forEach((ch, idx) => {
                const baseY = 20 + idx * rowH + rowH * 0.75;
                const highY = baseY - rowH * 0.55;
                const data = waveHistory[ch.key];

                scopeCtx.fillStyle = ch.color;
                scopeCtx.font = '9px Share Tech Mono';
                scopeCtx.fillText(ch.label, 6, baseY - 2);

                scopeCtx.strokeStyle = ch.color;
                scopeCtx.lineWidth = 1.4;
                scopeCtx.beginPath();

                const startX = 48;
                const stepX = (sw - startX - 8) / historyLen;

                for (let k = 0; k < data.length; k++) {
                    const x = startX + k * stepX;
                    const y = data[k] ? highY : baseY;
                    if (k === 0) scopeCtx.moveTo(x, y);
                    else {
                        const prevY = data[k - 1] ? highY : baseY;
                        if (prevY !== y) scopeCtx.lineTo(x, prevY);
                        scopeCtx.lineTo(x, y);
                    }
                }
                scopeCtx.stroke();
            });

            animId = requestAnimationFrame(animate);
        }

        animate();
    }

    return { mount };
})();
