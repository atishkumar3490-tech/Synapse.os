/* ============================================================================
   MODULE 1: SILICON FPGA v3.0 // INTERACTIVE CHIP LAB + 7-SEGMENT LED + DEMOS
   Powered by LEGEND Architecture — Touch-Friendly Presets & Live Equation HUD
   ============================================================================ */

window.SiliconFPGA = (() => {
    let animId = null;
    let demoTimer = null;
    let clockHz = 4;
    let clkState = 0;
    let regA = [1, 0, 1, 0]; // 5 (LSB first: A0..A3)
    let regB = [1, 1, 0, 0]; // 3
    let mode = 'ADD';        // ADD, XOR, AND, SUB
    let pulseOffset = 0;
    let activeDemo = 'NONE';

    const historyLen = 100;
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
        let sym = '+';
        if (mode === 'ADD') { res = valA + valB; sym = '+'; }
        else if (mode === 'XOR') { res = valA ^ valB; sym = '⊕ (XOR)'; }
        else if (mode === 'AND') { res = valA & valB; sym = '& (AND)'; }
        else if (mode === 'SUB') { res = Math.max(0, valA - valB); sym = '-'; }

        const outBits = [
            (res >> 0) & 1,
            (res >> 1) & 1,
            (res >> 2) & 1,
            (res >> 3) & 1
        ];
        const carry = (res >> 4) & 1;
        return { valA, valB, res, sym, outBits, carry };
    }

    function setNumberToReg(targetReg, num) {
        targetReg[0] = (num >> 0) & 1;
        targetReg[1] = (num >> 1) & 1;
        targetReg[2] = (num >> 2) & 1;
        targetReg[3] = (num >> 3) & 1;
    }

    function mount(container) {
        if (demoTimer) clearInterval(demoTimer);

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;gap:8px;font-family:'Share Tech Mono',monospace;">
                
                <!-- 1. LIVE EQUATION BANNER (Explains exactly what the chip is doing) -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;background:rgba(0,240,255,0.08);border:1px solid #00f0ff;padding:6px 10px;border-radius:4px;">
                    <div id="fpga-live-eq" style="font-size:0.78rem;color:#ffffff;font-family:'Orbitron',sans-serif;">
                        ⚡ CHIP LOGIC: <b style="color:#00f0ff">5</b> + <b style="color:#00ff9d">3</b> = <b style="color:#ffb800">8 (BIN: 01000)</b>
                    </div>
                    <div style="display:flex;gap:5px;align-items:center;">
                        <span style="font-size:0.65rem;color:#9ec2e6;">1-CLICK DEMOS:</span>
                        <button id="demo-counter" style="background:#00ff9d22;border:1px solid #00ff9d;color:#00ff9d;padding:3px 7px;font-size:0.66rem;cursor:pointer;font-weight:bold;">▶ AUTO COUNTER</button>
                        <button id="demo-random" style="background:#ffb80022;border:1px solid #ffb800;color:#ffb800;padding:3px 7px;font-size:0.66rem;cursor:pointer;font-weight:bold;">⚡ STRESS TEST</button>
                        <button id="demo-stop" style="background:#ff2a5422;border:1px solid #ff2a54;color:#ff2a54;padding:3px 7px;font-size:0.66rem;cursor:pointer;">⏹ MANUAL</button>
                    </div>
                </div>

                <!-- 2. ALU MODE + CLOCK SPEED BAR -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;background:#040811;padding:6px 10px;border:1px solid rgba(0,240,255,0.25);border-radius:4px;">
                    <div style="display:flex;gap:5px;align-items:center;">
                        <button class="fpga-mode-btn" data-m="ADD" style="background:#00f0ff;color:#000;border:1px solid #00f0ff;padding:4px 8px;font-size:0.68rem;cursor:pointer;font-weight:bold;">ADDER (+)</button>
                        <button class="fpga-mode-btn" data-m="XOR" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:4px 8px;font-size:0.68rem;cursor:pointer;">XOR (⊕)</button>
                        <button class="fpga-mode-btn" data-m="AND" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:4px 8px;font-size:0.68rem;cursor:pointer;">AND (&)</button>
                        <button class="fpga-mode-btn" data-m="SUB" style="background:transparent;color:#00f0ff;border:1px solid #00f0ff55;padding:4px 8px;font-size:0.68rem;cursor:pointer;">SUB (-)</button>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;font-size:0.72rem;">
                        <span>CLK: <b id="fpga-clk-readout" style="color:#00ff9d;">4 MHz</b></span>
                        <input type="range" id="fpga-clk-slider" min="1" max="16" value="4" style="width:65px;accent-color:#00f0ff;">
                    </div>
                </div>

                <!-- 3. MIDDLE WORKSPACE: TOUCH SWITCHES + SILICON DIE + 7-SEGMENT DISPLAY -->
                <div style="display:flex;gap:8px;flex:1;min-height:135px;">
                    
                    <!-- Left: Big Touch-Friendly Binary Switches -->
                    <div style="width:150px;background:#040811;border:1px solid rgba(0,240,255,0.22);padding:7px;display:flex;flex-direction:column;justify-content:space-between;border-radius:4px;">
                        <div>
                            <div style="font-size:0.63rem;color:#00f0ff;margin-bottom:4px;">INPUT A (TAP TO TOGGLE)</div>
                            <div id="fpga-reg-a" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;"></div>
                        </div>
                        <div>
                            <div style="font-size:0.63rem;color:#00ff9d;margin-bottom:4px;">INPUT B (TAP TO TOGGLE)</div>
                            <div id="fpga-reg-b" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;"></div>
                        </div>
                    </div>

                    <!-- Center: Live Silicon Gate Routing Canvas -->
                    <div style="flex:1;background:#03060c;border:1px solid rgba(0,240,255,0.25);border-radius:4px;position:relative;overflow:hidden;">
                        <canvas id="fpga-die-canvas" style="width:100%;height:100%;display:block;"></canvas>
                    </div>

                    <!-- Right: Hardware 7-Segment LED Readout & LEDs -->
                    <div style="width:105px;background:#040811;border:1px solid rgba(0,240,255,0.28);padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;border-radius:4px;">
                        <div style="font-size:0.58rem;color:#00f0ff;font-family:'Orbitron',sans-serif;">7-SEG OUTPUT</div>
                        <div id="fpga-7seg" style="font-family:'Orbitron',sans-serif;font-size:2.1rem;font-weight:900;color:#00ff9d;text-shadow:0 0 14px #00ff9d;background:#020408;width:100%;text-align:center;padding:4px 0;border:1px solid #00ff9d44;border-radius:4px;">
                            08
                        </div>
                        <div id="fpga-led-strip" style="display:flex;gap:4px;justify-content:center;width:100%;"></div>
                        <div id="fpga-hex-out" style="font-size:0.65rem;color:#ffb800;">HEX: 0x08</div>
                    </div>
                </div>

                <!-- 4. BOTTOM: 5-CHANNEL OSCILLOSCOPE -->
                <div style="height:78px;background:#020408;border:1px solid rgba(0,240,255,0.28);border-radius:4px;position:relative;overflow:hidden;">
                    <canvas id="fpga-scope-canvas" style="width:100%;height:100%;display:block;"></canvas>
                    <div style="position:absolute;top:3px;left:8px;font-size:0.58rem;color:#00f0ff;font-family:'Orbitron',sans-serif;">
                        LIVE LOGIC ANALYZER // VOLTAGE WAVEFORMS (5.0VLOGIC)
                    </div>
                </div>
            </div>
        `;

        const regAContainer = container.querySelector('#fpga-reg-a');
        const regBContainer = container.querySelector('#fpga-reg-b');
        const eqBanner = container.querySelector('#fpga-live-eq');
        const segDisplay = container.querySelector('#fpga-7seg');
        const ledStrip = container.querySelector('#fpga-led-strip');

        function renderSwitches() {
            regAContainer.innerHTML = '';
            regBContainer.innerHTML = '';
            for (let i = 3; i >= 0; i--) {
                const btnA = document.createElement('button');
                btnA.innerHTML = `A${i}<br>${regA[i]}`;
                btnA.style.cssText = `padding:6px 2px;font-size:0.68rem;cursor:pointer;border:1px solid #00f0ff;border-radius:3px;background:${regA[i] ? '#00f0ff' : '#050b14'};color:${regA[i] ? '#000' : '#00f0ff'};font-weight:bold;`;
                btnA.onclick = () => {
                    regA[i] = regA[i] ? 0 : 1;
                    if (window.Kernel) Kernel.playTone(regA[i] ? 1100 : 550, 0.04, 'square');
                    renderSwitches();
                };
                regAContainer.appendChild(btnA);

                const btnB = document.createElement('button');
                btnB.innerHTML = `B${i}<br>${regB[i]}`;
                btnB.style.cssText = `padding:6px 2px;font-size:0.68rem;cursor:pointer;border:1px solid #00ff9d;border-radius:3px;background:${regB[i] ? '#00ff9d' : '#050b14'};color:${regB[i] ? '#000' : '#00ff9d'};font-weight:bold;`;
                btnB.onclick = () => {
                    regB[i] = regB[i] ? 0 : 1;
                    if (window.Kernel) Kernel.playTone(regB[i] ? 1250 : 600, 0.04, 'square');
                    renderSwitches();
                };
                regBContainer.appendChild(btnB);
            }

            const { valA, valB, res, sym, outBits, carry } = computeALU();
            const binA = `${regA[3]}${regA[2]}${regA[1]}${regA[0]}`;
            const binB = `${regB[3]}${regB[2]}${regB[1]}${regB[0]}`;
            const binOut = `${carry}${outBits[3]}${outBits[2]}${outBits[1]}${outBits[0]}`;

            eqBanner.innerHTML = `⚡ CHIP LOGIC: <b style="color:#00f0ff">${valA} (${binA}₂)</b> ${sym} <b style="color:#00ff9d">${valB} (${binB}₂)</b> = <b style="color:#ffb800">${res} (${binOut}₂)</b>`;
            segDisplay.innerText = String(res).padStart(2, '0');
            container.querySelector('#fpga-hex-out').innerText = `HEX: 0x${res.toString(16).toUpperCase().padStart(2, '0')}`;

            // Render 5 physical LED indicators (Carry + 4 bits)
            const allBits = [carry, outBits[3], outBits[2], outBits[1], outBits[0]];
            ledStrip.innerHTML = allBits.map((b, idx) => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                    <div style="width:11px;height:11px;border-radius:50%;background:${b ? (idx === 0 ? '#ff2a54' : '#00ff9d') : '#0b1624'};box-shadow:${b ? '0 0 8px #00ff9d' : 'none'};border:1px solid #00f0ff66;"></div>
                    <span style="font-size:0.5rem;color:#64829e;">${idx === 0 ? 'C' : 'Q' + (4 - idx)}</span>
                </div>
            `).join('');
        }

        renderSwitches();

        // 1-Click Automated Hardware Demos
        let countStep = 0;
        container.querySelector('#demo-counter').onclick = () => {
            if (demoTimer) clearInterval(demoTimer);
            activeDemo = 'COUNTER';
            if (window.Kernel) Kernel.playTone(1300, 0.06, 'triangle');
            demoTimer = setInterval(() => {
                if (!document.body.contains(container)) { clearInterval(demoTimer); return; }
                countStep = (countStep + 1) % 16;
                setNumberToReg(regA, countStep);
                setNumberToReg(regB, 1);
                renderSwitches();
            }, 450);
        };

        container.querySelector('#demo-random').onclick = () => {
            if (demoTimer) clearInterval(demoTimer);
            activeDemo = 'STRESS';
            if (window.Kernel) Kernel.playTone(1450, 0.06, 'sawtooth');
            demoTimer = setInterval(() => {
                if (!document.body.contains(container)) { clearInterval(demoTimer); return; }
                setNumberToReg(regA, Math.floor(Math.random() * 16));
                setNumberToReg(regB, Math.floor(Math.random() * 16));
                renderSwitches();
            }, 220);
        };

        container.querySelector('#demo-stop').onclick = () => {
            if (demoTimer) clearInterval(demoTimer);
            activeDemo = 'NONE';
            if (window.Kernel) Kernel.playTone(600, 0.05, 'sine');
        };

        // ALU Mode buttons
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
            clkReadout.innerText = `${clockHz} MHz`;
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
            pulseOffset = (pulseOffset + clockHz * 0.5) % 40;
            const period = Math.max(4, Math.floor(40 / clockHz));
            if (tickCount % period === 0) clkState = clkState ? 0 : 1;

            const { outBits, carry } = computeALU();

            waveHistory.CLK.push(clkState);    waveHistory.CLK.shift();
            waveHistory.A0.push(regA[0]);      waveHistory.A0.shift();
            waveHistory.B0.push(regB[0]);      waveHistory.B0.shift();
            waveHistory.SUM0.push(outBits[0]); waveHistory.SUM0.shift();
            waveHistory.COUT.push(carry);      waveHistory.COUT.shift();

            // Draw Silicon Die
            dieCtx.clearRect(0, 0, dw, dh);
            dieCtx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            for (let x = 0; x < dw; x += 18) { dieCtx.beginPath(); dieCtx.moveTo(x, 0); dieCtx.lineTo(x, dh); dieCtx.stroke(); }
            for (let y = 0; y < dh; y += 18) { dieCtx.beginPath(); dieCtx.moveTo(0, y); dieCtx.lineTo(dw, y); dieCtx.stroke(); }

            for (let i = 0; i < 4; i++) {
                const y = ((i + 0.75) / 4.5) * dh;
                const xIn = 14;
                const xGate1 = dw * 0.32;
                const xGate2 = dw * 0.64;
                const xOut = dw - 18;

                const bitA = regA[i];
                const bitB = regB[i];
                const bitOut = outBits[i];

                // Input A trace
                dieCtx.strokeStyle = bitA ? '#00f0ff' : '#182b40';
                dieCtx.lineWidth = bitA ? 2.2 : 1;
                dieCtx.beginPath(); dieCtx.moveTo(xIn, y - 6); dieCtx.lineTo(xGate1, y - 4); dieCtx.stroke();

                // Input B trace
                dieCtx.strokeStyle = bitB ? '#00ff9d' : '#182b40';
                dieCtx.lineWidth = bitB ? 2.2 : 1;
                dieCtx.beginPath(); dieCtx.moveTo(xIn, y + 6); dieCtx.lineTo(xGate1, y + 4); dieCtx.stroke();

                // Gate 1 (ALU Slice)
                dieCtx.fillStyle = '#071222';
                dieCtx.strokeStyle = (bitA || bitB) ? '#00f0ff' : '#25415e';
                dieCtx.fillRect(xGate1, y - 10, 42, 20);
                dieCtx.strokeRect(xGate1, y - 10, 42, 20);
                dieCtx.fillStyle = '#00f0ff';
                dieCtx.font = '9px Share Tech Mono';
                dieCtx.fillText(`${mode}${i}`, xGate1 + 6, y + 3);

                // Mid wire
                dieCtx.strokeStyle = bitOut ? '#ffb800' : '#182b40';
                dieCtx.beginPath(); dieCtx.moveTo(xGate1 + 42, y); dieCtx.lineTo(xGate2, y); dieCtx.stroke();

                // Gate 2 (Latch)
                dieCtx.fillStyle = '#071222';
                dieCtx.strokeStyle = bitOut ? '#00ff9d' : '#25415e';
                dieCtx.fillRect(xGate2, y - 10, 38, 20);
                dieCtx.strokeRect(xGate2, y - 10, 38, 20);
                dieCtx.fillStyle = '#00ff9d';
                dieCtx.fillText(`Q_${i}`, xGate2 + 8, y + 3);

                // Output wire + Electron Pulse
                dieCtx.strokeStyle = bitOut ? '#00ff9d' : '#182b40';
                dieCtx.beginPath(); dieCtx.moveTo(xGate2 + 38, y); dieCtx.lineTo(xOut, y); dieCtx.stroke();

                if (bitOut) {
                    const px = xGate2 + 38 + ((pulseOffset / 40) * (xOut - (xGate2 + 38)));
                    dieCtx.fillStyle = '#ffffff';
                    dieCtx.beginPath(); dieCtx.arc(px, y, 2.8, 0, Math.PI * 2); dieCtx.fill();
                }
            }

            // Draw Oscilloscope
            scopeCtx.clearRect(0, 0, sw, sh);
            const channels = [
                { key: 'CLK', color: '#00f0ff', label: 'CLK' },
                { key: 'A0', color: '#38b6ff', label: 'IN_A' },
                { key: 'B0', color: '#00ff9d', label: 'IN_B' },
                { key: 'SUM0', color: '#ffb800', label: 'OUT0' },
                { key: 'COUT', color: '#ff2a54', label: 'COUT' }
            ];

            const rowH = (sh - 14) / channels.length;
            channels.forEach((ch, idx) => {
                const baseY = 16 + idx * rowH + rowH * 0.75;
                const highY = baseY - rowH * 0.55;
                const data = waveHistory[ch.key];

                scopeCtx.fillStyle = ch.color;
                scopeCtx.font = '8.5px Share Tech Mono';
                scopeCtx.fillText(ch.label, 5, baseY - 1);

                scopeCtx.strokeStyle = ch.color;
                scopeCtx.lineWidth = 1.3;
                scopeCtx.beginPath();

                const startX = 40;
                const stepX = (sw - startX - 6) / historyLen;

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

    return { mount, setNumberToReg };
})();
