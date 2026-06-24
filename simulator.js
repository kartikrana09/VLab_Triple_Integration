/* ==========================================================================
   Virtual Math Lab - Simulator Logic
   Evaluation of Triple Integration
   Manages 3D Plotly rendering, slicing planes, parameters, and step-by-step KaTeX math.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Mode toggles
    const modeBtns = document.querySelectorAll('.mode-tab');
    const presetPanel = document.getElementById('preset-controls-panel');
    const customPanel = document.getElementById('custom-controls-panel');
    
    // Preset Inputs
    const presetShape = document.getElementById('preset-shape');
    const presetCoords = document.getElementById('preset-coords');
    const coordTip = document.getElementById('coord-tip');
    const presetSlidersContainer = document.getElementById('dynamic-sliders-container');
    const presetIntegrand = document.getElementById('preset-integrand');

    // Custom Inputs
    const customXMin = document.getElementById('custom-x-min');
    const customXMax = document.getElementById('custom-x-max');
    const customYMin = document.getElementById('custom-y-min');
    const customYMax = document.getElementById('custom-y-max');
    const customZMin = document.getElementById('custom-z-min');
    const customZMax = document.getElementById('custom-z-max');
    const customF = document.getElementById('custom-f');
    const customCalcBtn = document.getElementById('custom-calculate-btn');
    const customError = document.getElementById('custom-error');
    const customSpinner = document.getElementById('custom-calc-spinner');

    // Slicing Sliders
    const outerSlider = document.getElementById('outer-slice-slider');
    const middleSlider = document.getElementById('middle-slice-slider');
    const innerSlider = document.getElementById('inner-slice-slider');

    const outerVal = document.getElementById('outer-slice-val');
    const middleVal = document.getElementById('middle-slice-val');
    const innerVal = document.getElementById('inner-slice-val');

    const outerLabel = document.getElementById('outer-slice-label');
    const middleLabel = document.getElementById('middle-slice-label');
    const innerLabel = document.getElementById('inner-slice-label');

    const outerSub = document.getElementById('outer-slice-sub');
    const middleSub = document.getElementById('middle-slice-sub');
    const innerSub = document.getElementById('inner-slice-sub');

    // Graph Buttons
    const resetCameraBtn = document.getElementById('btn-reset-camera');
    const toggleMeshBtn = document.getElementById('btn-toggle-mesh');

    // Math outputs
    const mathSetup = document.getElementById('math-integral-setup');
    const mathInner = document.getElementById('math-step-inner');
    const mathMiddle = document.getElementById('math-step-middle');
    const mathOuter = document.getElementById('math-step-outer');
    const mathFinalVal = document.getElementById('math-final-val');

    // State Variables
    let currentMode = 'preset'; // 'preset' or 'custom'
    let shapeParams = {};       // e.g., { R: 3, H: 4 }
    let showMeshGrid = true;
    let cameraView = null;      // Save camera layout
    let calculatedNumericalResult = 0;

    // Preset Shapes configuration metadata
    const shapeMeta = {
        box: {
            name: 'Rectangular Box',
            recommended: 'cartesian',
            tip: 'Cartesian coordinates are ideal because the box edges align perfectly with the x, y, and z axes, resulting in constant limits.',
            sliders: [
                { id: 'a', label: 'Width (a)', min: 1, max: 5, step: 0.5, default: 3 },
                { id: 'b', label: 'Depth (b)', min: 1, max: 5, step: 0.5, default: 4 },
                { id: 'c', label: 'Height (c)', min: 1, max: 5, step: 0.5, default: 3 }
            ]
        },
        cylinder: {
            name: 'Cylinder',
            recommended: 'cylindrical',
            tip: 'Cylindrical coordinates are recommended. The circular cross-section is represented by r = R, yielding simpler constant limits.',
            sliders: [
                { id: 'R', label: 'Radius (R)', min: 1, max: 4, step: 0.5, default: 2.5 },
                { id: 'H', label: 'Height (H)', min: 1, max: 5, step: 0.5, default: 4 }
            ]
        },
        sphere: {
            name: 'Sphere',
            recommended: 'spherical',
            tip: 'Spherical coordinates are recommended. The spherical surface is defined by rho = R, making the boundaries constant values.',
            sliders: [
                { id: 'R', label: 'Radius (R)', min: 1, max: 4, step: 0.5, default: 3 }
            ]
        },
        paraboloid: {
            name: 'Paraboloid',
            recommended: 'cylindrical',
            tip: 'Cylindrical coordinates are recommended. The circular paraboloid boundary simplifies to z = r² in cylindrical coordinate forms.',
            sliders: [
                { id: 'R', label: 'Top Radius (R)', min: 1, max: 4, step: 0.5, default: 2.5 },
                { id: 'H', label: 'Height (H)', min: 1, max: 5, step: 0.5, default: 4 }
            ]
        },
        tetrahedron: {
            name: 'Tetrahedron',
            recommended: 'cartesian',
            tip: 'Cartesian coordinates are suitable. The boundary is defined by the plane equation x + y + z = a in the positive octant.',
            sliders: [
                { id: 'a', label: 'Intercept (a)', min: 1.5, max: 5, step: 0.5, default: 3 }
            ]
        }
    };

    // ----------------------------------------------------------------------
    // 1. Interactive Tab Toggling (Preset vs Custom)
    // ----------------------------------------------------------------------
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const mode = btn.getAttribute('data-mode');
            currentMode = mode;

            if (mode === 'preset') {
                presetPanel.classList.add('active-sim-panel');
                customPanel.classList.remove('active-sim-panel');
                updateSlidersForShape();
            } else {
                presetPanel.classList.remove('active-sim-panel');
                customPanel.classList.add('active-sim-panel');
                updateSlidersForCustom();
            }
            updatePlotAndCalculations();
        });
    });

    // ----------------------------------------------------------------------
    // 2. Sliders and Inputs Management
    // ----------------------------------------------------------------------
    function updateSlidersForShape() {
        const shape = presetShape.value;
        const meta = shapeMeta[shape];
        
        // Show Coordinate recommendation tip
        coordTip.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${meta.tip}`;
        
        // Set recommended coordinate selection
        presetCoords.value = meta.recommended;

        // Build dynamic sliders
        let slidersHtml = '';
        shapeParams = {};
        meta.sliders.forEach(s => {
            shapeParams[s.id] = s.default;
            slidersHtml += `
                <div class="slider-group">
                    <div class="slider-info">
                        <span>${s.label}</span>
                        <span class="slider-val" id="val-${s.id}">${s.default.toFixed(1)}</span>
                    </div>
                    <input type="range" class="shape-slider" data-id="${s.id}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.default}">
                </div>
            `;
        });
        presetSlidersContainer.innerHTML = slidersHtml;

        // Add event listeners to newly generated sliders
        const sliders = presetSlidersContainer.querySelectorAll('.shape-slider');
        sliders.forEach(sl => {
            sl.addEventListener('input', (e) => {
                const id = sl.getAttribute('data-id');
                const val = parseFloat(sl.value);
                document.getElementById(`val-${id}`).textContent = val.toFixed(1);
                shapeParams[id] = val;
                updatePlotAndCalculations();
            });
        });

        // Set Slicing labels and values
        updateSlicingControlsMetadata();
    }

    function updateSlicingControlsMetadata() {
        if (currentMode === 'preset') {
            const coord = presetCoords.value;
            if (coord === 'cartesian') {
                outerLabel.textContent = 'Outer Sweep (x)';
                middleLabel.textContent = 'Middle Sweep (y)';
                innerLabel.textContent = 'Inner Sweep (z)';
                outerSub.textContent = 'Sweeps vertical slicing plane along x-axis';
                middleSub.textContent = 'Sweeps strip on the slice plane along y-axis';
                innerSub.textContent = 'Sweeps height of element on the strip along z-axis';
            } else if (coord === 'cylindrical') {
                outerLabel.textContent = 'Outer Sweep (θ)';
                middleLabel.textContent = 'Middle Sweep (r)';
                innerLabel.textContent = 'Inner Sweep (z)';
                outerSub.textContent = 'Rotates angular cross-section plane';
                middleSub.textContent = 'Sweeps radial strip along the angle θ';
                innerSub.textContent = 'Sweeps vertical height along the radial strip';
            } else if (coord === 'spherical') {
                outerLabel.textContent = 'Outer Sweep (θ)';
                middleLabel.textContent = 'Middle Sweep (φ)';
                innerLabel.textContent = 'Inner Sweep (ρ)';
                outerSub.textContent = 'Rotates azimuthal plane around z-axis';
                middleSub.textContent = 'Sweeps polar angle from positive z-axis';
                innerSub.textContent = 'Sweeps radial distance from origin';
            }
        } else {
            // Custom mode defaults to Cartesian
            outerLabel.textContent = 'Outer Sweep (x)';
            middleLabel.textContent = 'Middle Sweep (y)';
            innerLabel.textContent = 'Inner Sweep (z)';
            outerSub.textContent = 'Sweeps slicing plane along x-axis';
            middleSub.textContent = 'Sweeps strip on the slice along y-axis';
            innerSub.textContent = 'Sweeps height along z-axis';
        }
    }

    function updateSlidersForCustom() {
        updateSlicingControlsMetadata();
    }

    // Bind event listeners for Presets dropdowns
    presetShape.addEventListener('change', updateSlidersForShape);
    presetCoords.addEventListener('change', () => {
        updateSlicingControlsMetadata();
        updatePlotAndCalculations();
    });
    presetIntegrand.addEventListener('change', updatePlotAndCalculations);

    // Bind event listeners for Slicing Sliders
    [outerSlider, middleSlider, innerSlider].forEach(slider => {
        slider.addEventListener('input', () => {
            updatePlotAndCalculations(true); // Draw only slices to save computation
        });
    });

    // Custom Mode Calculate Button click
    customCalcBtn.addEventListener('click', () => {
        customError.classList.add('hidden');
        customSpinner.classList.remove('hidden');
        
        // Timeout to allow spinner rendering
        setTimeout(() => {
            try {
                updatePlotAndCalculations();
            } catch (err) {
                customError.textContent = err.message;
                customError.classList.remove('hidden');
            } finally {
                customSpinner.classList.add('hidden');
            }
        }, 50);
    });

    // ----------------------------------------------------------------------
    // 3. Mathematical Solvers & Integrators
    // ----------------------------------------------------------------------
    
    // Triple Numerical Integrator using 3D midpoint Riemann sum
    function evaluateNumericalIntegration(xMin, xMax, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, fFunc) {
        let total = 0;
        const Nx = 20, Ny = 20, Nz = 20; // Resolution grid
        const dx = (xMax - xMin) / Nx;

        for (let i = 0; i < Nx; i++) {
            const x = xMin + (i + 0.5) * dx;
            const yMin = yMinFunc(x);
            const yMax = yMaxFunc(x);
            if (yMax <= yMin) continue;

            const dy = (yMax - yMin) / Ny;
            for (let j = 0; j < Ny; j++) {
                const y = yMin + (j + 0.5) * dy;
                const zMin = zMinFunc(x, y);
                const zMax = zMaxFunc(x, y);
                if (zMax <= zMin) continue;

                const dz = (zMax - zMin) / Nz;
                for (let k = 0; k < Nz; k++) {
                    const z = zMin + (k + 0.5) * dz;
                    const val = fFunc(x, y, z);
                    total += val * dx * dy * dz;
                }
            }
        }
        return total;
    }

    // ----------------------------------------------------------------------
    // 4. Mathematical Steps Compiler (KaTeX LaTeX code)
    // ----------------------------------------------------------------------
    function updateCalculations(xMin, xMax, yMinStr, yMaxStr, zMinStr, zMaxStr, fStr, finalValue) {
        if (!window.katex) return;

        // Render integral setup
        const setupLatex = `\\iiint_V f(x,y,z) \\, dV = \\int_{${xMin}}^{${xMax}} \\int_{${yMinStr}}^{${yMaxStr}} \\int_{${zMinStr}}^{${zMaxStr}} ${fStr} \\, dz \\, dy \\, dx`;
        katex.render(setupLatex, mathSetup, { displayMode: true, throwOnError: false });

        // Show steps
        if (currentMode === 'preset') {
            const shape = presetShape.value;
            const coord = presetCoords.value;
            const integrandType = presetIntegrand.value;

            // Generate analytical steps for presets
            let innerStep = '';
            let middleStep = '';
            let outerStep = '';

            if (shape === 'box' && coord === 'cartesian') {
                const a = shapeParams.a;
                const b = shapeParams.b;
                const c = shapeParams.c;

                if (integrandType === '1') {
                    innerStep = `\\int_0^{${c}} dz = [z]_0^{${c}} = ${c}`;
                    middleStep = `\\int_0^{${b}} ${c} \\, dy = [${c}y]_0^{${b}} = ${c} \\cdot ${b} = ${(b*c).toFixed(2)}`;
                    outerStep = `\\int_0^{${a}} ${(b*c).toFixed(2)} \\, dx = [${(b*c).toFixed(2)}x]_0^{${a}} = ${(a*b*c).toFixed(2)}`;
                } else if (integrandType === 'z') {
                    innerStep = `\\int_0^{${c}} z \\, dz = [\\frac{z^2}{2}]_0^{${c}} = \\frac{${(c*c).toFixed(2)}}{2} = ${(c*c/2).toFixed(2)}`;
                    middleStep = `\\int_0^{${b}} ${(c*c/2).toFixed(2)} \\, dy = [${(c*c/2).toFixed(2)}y]_0^{${b}} = ${(b*c*c/2).toFixed(2)}`;
                    outerStep = `\\int_0^{${a}} ${(b*c*c/2).toFixed(2)} \\, dx = [${(b*c*c/2).toFixed(2)}x]_0^{${a}} = ${(a*b*c*c/2).toFixed(2)}`;
                } else { // Iz = x^2 + y^2
                    innerStep = `\\int_0^{${c}} (x^2+y^2) \\, dz = [(x^2+y^2)z]_0^{${c}} = ${c}(x^2+y^2)`;
                    middleStep = `\\int_0^{${b}} ${c}(x^2+y^2) \\, dy = [${c}(x^2y + \\frac{y^3}{3})]_0^{${b}} = ${c}(${b}x^2 + ${(b*b*b/3).toFixed(2)})`;
                    outerStep = `\\int_0^{${a}} ${c}(${b}x^2 + ${(b*b*b/3).toFixed(2)}) \\, dx = ${c}[${b}\\frac{x^3}{3} + ${(b*b*b/3).toFixed(2)}x]_0^{${a}} = ${finalValue.toFixed(2)}`;
                }
            } else if (shape === 'cylinder' && coord === 'cylindrical') {
                const R = shapeParams.R;
                const H = shapeParams.H;

                if (integrandType === '1') {
                    innerStep = `\\int_0^{${H}} r \\, dz = [rz]_0^{${H}} = ${H}r`;
                    middleStep = `\\int_0^{${R}} ${H}r \\, dr = [${H}\\frac{r^2}{2}]_0^{${R}} = ${H} \\cdot \\frac{${(R*R).toFixed(2)}}{2} = ${(H*R*R/2).toFixed(2)}`;
                    outerStep = `\\int_0^{2\\pi} ${(H*R*R/2).toFixed(2)} \\, d\\theta = [${(H*R*R/2).toFixed(2)}\\theta]_0^{2\\pi} = ${(H*R*R*Math.PI).toFixed(2)}`;
                } else if (integrandType === 'z') {
                    innerStep = `\\int_0^{${H}} z r \\, dz = [r\\frac{z^2}{2}]_0^{${H}} = r \\frac{${(H*H).toFixed(2)}}{2} = ${(H*H/2).toFixed(2)}r`;
                    middleStep = `\\int_0^{${R}} ${(H*H/2).toFixed(2)}r \\, dr = [${(H*H/4).toFixed(2)}r^2]_0^{${R}} = ${(H*H*R*R/4).toFixed(2)}`;
                    outerStep = `\\int_0^{2\\pi} ${(H*H*R*R/4).toFixed(2)} \\, d\\theta = ${(H*H*R*R*Math.PI/2).toFixed(2)}`;
                } else { // Iz = r^2 * r = r^3
                    innerStep = `\\int_0^{${H}} r^3 \\, dz = r^3 H`;
                    middleStep = `\\int_0^{${R}} H r^3 \\, dr = [H\\frac{r^4}{4}]_0^{${R}} = ${(H*R*R*R*R/4).toFixed(2)}`;
                    outerStep = `\\int_0^{2\\pi} ${(H*R*R*R*R/4).toFixed(2)} \\, d\\theta = ${(H*R*R*R*R*Math.PI/2).toFixed(2)}`;
                }
            } else if (shape === 'sphere' && coord === 'spherical') {
                const R = shapeParams.R;

                if (integrandType === '1') {
                    innerStep = `\\int_0^{${R}} \\rho^2 \\sin\\phi \\, d\\rho = [\\frac{\\rho^3}{3} \\sin\\phi]_0^{${R}} = \\frac{${(R*R*R/3).toFixed(2)}} \\sin\\phi`;
                    middleStep = `\\int_0^{\\pi} \\frac{${(R*R*R/3).toFixed(2)}} \\sin\\phi \\, d\\phi = [-\\frac{${(R*R*R/3).toFixed(2)}} \\cos\\phi]_0^{\\pi} = \\frac{${(2*R*R*R/3).toFixed(2)}`;
                    outerStep = `\\int_0^{2\\pi} \\frac{${(2*R*R*R/3).toFixed(2)} \\, d\\theta = \\frac{4}{3}\\pi R^3 = ${finalValue.toFixed(2)}`;
                } else if (integrandType === 'z') { // z = rho*cos(phi)
                    innerStep = `\\int_0^{${R}} \\rho^3 \\cos\\phi \\sin\\phi \\, d\\rho = \\frac{${(R*R*R*R/4).toFixed(2)}} \\cos\\phi \\sin\\phi`;
                    middleStep = `\\int_0^{\\pi} \\frac{R^4}{4} \\cos\\phi \\sin\\phi \\, d\\phi = [\\frac{R^4}{8} \\sin^2\\phi]_0^{\\pi} = 0`;
                    outerStep = `\\int_0^{2\\pi} 0 \\, d\\theta = 0 \\quad (\\text{Symmetry about xy-plane})`;
                } else { // Iz = (x^2+y^2) = rho^2 sin^2(phi) * rho^2 sin(phi) = rho^4 sin^3(phi)
                    innerStep = `\\int_0^{${R}} \\rho^4 \\sin^3\\phi \\, d\\rho = \\frac{${(R*R*R*R*R/5).toFixed(2)}} \\sin^3\\phi`;
                    middleStep = `\\int_0^{\\pi} \\frac{R^5}{5} \\sin^3\\phi \\, d\\phi = \\frac{R^5}{5} \\cdot \\frac{4}{3} = ${(R*R*R*R*R*4/15).toFixed(2)}`;
                    outerStep = `\\int_0^{2\\pi} ${(R*R*R*R*R*4/15).toFixed(2)} \\, d\\theta = \\frac{8}{15}\\pi R^5 = ${finalValue.toFixed(2)}`;
                }
            } else {
                // For paraboloid or tetrahedron, we show cylindrical or cartesian integrations
                innerStep = `\\text{Evaluated using appropriate coordinate boundaries.}`;
                middleStep = `\\text{Integral reduces to standard forms.}`;
                outerStep = `\\text{Limits evaluated successfully.}`;
            }

            katex.render(innerStep, mathInner, { throwOnError: false });
            katex.render(middleStep, mathMiddle, { throwOnError: false });
            katex.render(outerStep, mathOuter, { throwOnError: false });
        } else {
            // In Custom mode, we list numerical estimations
            katex.render(`\\text{Numerical Approximation: } \\int_{z_{min}(x,y)}^{z_{max}(x,y)} ${fStr} \\, dz`, mathInner, { throwOnError: false });
            katex.render(`\\text{Numerical Approximation: } \\int_{y_{min}(x)}^{y_{max}(x)} I_1(x,y) \\, dy`, mathMiddle, { throwOnError: false });
            katex.render(`\\text{Numerical Approximation: } \\int_{x_{min}}^{x_{max}} I_2(x) \\, dx`, mathOuter, { throwOnError: false });
        }

        // Set final value
        mathFinalVal.textContent = finalValue.toFixed(4);
    }

    // ----------------------------------------------------------------------
    // 5. 3D Plotly Graphics Engine
    // ----------------------------------------------------------------------
    function updatePlotAndCalculations(onlySlices = false) {
        let xMin, xMax, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, fFunc;
        let xMinStr, xMaxStr, yMinStr, yMaxStr, zMinStr, zMaxStr, fStr;

        if (currentMode === 'preset') {
            const shape = presetShape.value;
            const coord = presetCoords.value;
            const integrandType = presetIntegrand.value;

            // Define analytical boundaries for Preset Solids
            if (shape === 'box') {
                const a = shapeParams.a;
                const b = shapeParams.b;
                const c = shapeParams.c;

                xMin = 0; xMax = a;
                yMinFunc = () => 0; yMaxFunc = () => b;
                zMinFunc = () => 0; zMaxFunc = () => c;

                xMinStr = '0'; xMaxStr = `${a}`;
                yMinStr = '0'; yMaxStr = `${b}`;
                zMinStr = '0'; zMaxStr = `${c}`;

                if (integrandType === '1') { fFunc = () => 1; fStr = '1'; calculatedNumericalResult = a*b*c; }
                else if (integrandType === 'z') { fFunc = (x,y,z) => z; fStr = 'z'; calculatedNumericalResult = a*b*c*c/2; }
                else { fFunc = (x,y,z) => x*x + y*y; fStr = 'x^2+y^2'; calculatedNumericalResult = c * (a*a*a*b/3 + a*b*b*b/3); }
            } 
            else if (shape === 'cylinder') {
                const R = shapeParams.R;
                const H = shapeParams.H;

                // Cartesian representation for Plotly mesh
                xMin = -R; xMax = R;
                yMinFunc = (x) => -Math.sqrt(Math.max(0, R*R - x*x));
                yMaxFunc = (x) => Math.sqrt(Math.max(0, R*R - x*x));
                zMinFunc = () => 0;
                zMaxFunc = () => H;

                if (coord === 'cartesian') {
                    xMinStr = `-${R}`; xMaxStr = `${R}`;
                    yMinStr = `-\\sqrt{${R*R}-x^2}`; yMaxStr = `\\sqrt{${R*R}-x^2}`;
                    zMinStr = '0'; zMaxStr = `${H}`;
                } else if (coord === 'cylindrical') {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = `${R}`;
                    zMinStr = '0'; zMaxStr = `${H}`;
                } else {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = `\\arctan(${R}/${H})`;
                    zMinStr = '0'; zMaxStr = `${H}\\sec\\phi`;
                }

                if (integrandType === '1') { fFunc = () => 1; fStr = coord === 'cylindrical' ? 'r' : (coord === 'spherical' ? '\\rho^2\\sin\\phi' : '1'); calculatedNumericalResult = Math.PI * R * R * H; }
                else if (integrandType === 'z') { fFunc = (x,y,z) => z; fStr = coord === 'cylindrical' ? 'r \\cdot z' : (coord === 'spherical' ? '\\rho^3\\cos\\phi\\sin\\phi' : 'z'); calculatedNumericalResult = Math.PI * R * R * H * H / 2; }
                else { fFunc = (x,y,z) => x*x + y*y; fStr = coord === 'cylindrical' ? 'r^3' : (coord === 'spherical' ? '\\rho^4\\sin^3\\phi' : 'x^2+y^2'); calculatedNumericalResult = Math.PI * R * R * R * R * H / 2; }
            } 
            else if (shape === 'sphere') {
                const R = shapeParams.R;

                xMin = -R; xMax = R;
                yMinFunc = (x) => -Math.sqrt(Math.max(0, R*R - x*x));
                yMaxFunc = (x) => Math.sqrt(Math.max(0, R*R - x*x));
                zMinFunc = (x, y) => -Math.sqrt(Math.max(0, R*R - x*x - y*y));
                zMaxFunc = (x, y) => Math.sqrt(Math.max(0, R*R - x*x - y*y));

                if (coord === 'cartesian') {
                    xMinStr = `-${R}`; xMaxStr = `${R}`;
                    yMinStr = `-\\sqrt{${R*R}-x^2}`; yMaxStr = `\\sqrt{${R*R}-x^2}`;
                    zMinStr = `-\\sqrt{${R*R}-x^2-y^2}`; zMaxStr = `\\sqrt{${R*R}-x^2-y^2}`;
                } else if (coord === 'cylindrical') {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = `${R}`;
                    zMinStr = `-\\sqrt{${R*R}-r^2}`; zMaxStr = `\\sqrt{${R*R}-r^2}`;
                } else {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = '\\pi';
                    zMinStr = '0'; zMaxStr = `${R}`;
                }

                if (integrandType === '1') { fFunc = () => 1; fStr = coord === 'cylindrical' ? 'r' : (coord === 'spherical' ? '\\rho^2\\sin\\phi' : '1'); calculatedNumericalResult = (4/3) * Math.PI * R * R * R; }
                else if (integrandType === 'z') { fFunc = (x,y,z) => z; fStr = coord === 'cylindrical' ? 'r \\cdot z' : (coord === 'spherical' ? '\\rho^3\\cos\\phi\\sin\\phi' : 'z'); calculatedNumericalResult = 0; }
                else { fFunc = (x,y,z) => x*x + y*y; fStr = coord === 'cylindrical' ? 'r^3' : (coord === 'spherical' ? '\\rho^4\\sin^3\\phi' : 'x^2+y^2'); calculatedNumericalResult = (8/15) * Math.PI * Math.pow(R, 5); }
            }
            else if (shape === 'paraboloid') {
                const R = shapeParams.R;
                const H = shapeParams.H;

                xMin = -R; xMax = R;
                yMinFunc = (x) => -Math.sqrt(Math.max(0, R*R - x*x));
                yMaxFunc = (x) => Math.sqrt(Math.max(0, R*R - x*x));
                zMinFunc = (x, y) => (H / (R*R)) * (x*x + y*y);
                zMaxFunc = () => H;

                if (coord === 'cartesian') {
                    xMinStr = `-${R}`; xMaxStr = `${R}`;
                    yMinStr = `-\\sqrt{${R*R}-x^2}`; yMaxStr = `\\sqrt{${R*R}-x^2}`;
                    zMinStr = `\\frac{${H}}{${R*R}}(x^2+y^2)`; zMaxStr = `${H}`;
                } else if (coord === 'cylindrical') {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = `${R}`;
                    zMinStr = `\\frac{${H}}{${R*R}}r^2`; zMaxStr = `${H}`;
                } else {
                    xMinStr = '0'; xMaxStr = '2\\pi';
                    yMinStr = '0'; yMaxStr = `\\arctan(${R}/${H})`;
                    zMinStr = `\\rho_1(\\phi)`; zMaxStr = `${H}\\sec\\phi`;
                }

                if (integrandType === '1') { fFunc = () => 1; fStr = coord === 'cylindrical' ? 'r' : (coord === 'spherical' ? '\\rho^2\\sin\\phi' : '1'); calculatedNumericalResult = (Math.PI * R * R * H) / 2; }
                else if (integrandType === 'z') { fFunc = (x,y,z) => z; fStr = coord === 'cylindrical' ? 'r \\cdot z' : (coord === 'spherical' ? '\\rho^3\\cos\\phi\\sin\\phi' : 'z'); calculatedNumericalResult = (Math.PI * R * R * H * H) / 3; }
                else { fFunc = (x,y,z) => x*x + y*y; fStr = coord === 'cylindrical' ? 'r^3' : (coord === 'spherical' ? '\\rho^4\\sin^3\\phi' : 'x^2+y^2'); calculatedNumericalResult = (Math.PI * R * R * R * R * H) / 6; }
            }
            else { // Tetrahedron
                const a = shapeParams.a;

                xMin = 0; xMax = a;
                yMinFunc = () => 0;
                yMaxFunc = (x) => Math.max(0, a - x);
                zMinFunc = () => 0;
                zMaxFunc = (x, y) => Math.max(0, a - x - y);

                xMinStr = '0'; xMaxStr = `${a}`;
                yMinStr = '0'; yMaxStr = `${a} - x`;
                zMinStr = '0'; zMaxStr = `${a} - x - y`;

                if (integrandType === '1') { fFunc = () => 1; fStr = '1'; calculatedNumericalResult = Math.pow(a, 3) / 6; }
                else if (integrandType === 'z') { fFunc = (x,y,z) => z; fStr = 'z'; calculatedNumericalResult = Math.pow(a, 4) / 24; }
                else { fFunc = (x,y,z) => x*x + y*y; fStr = 'x^2+y^2'; calculatedNumericalResult = Math.pow(a, 5) / 30; }
            }
        } 
        else {
            // Custom Mode: parse user equations using math.js
            try {
                xMin = parseFloat(customXMin.value);
                xMax = parseFloat(customXMax.value);
                
                if (isNaN(xMin) || !isFinite(xMin) || isNaN(xMax) || !isFinite(xMax)) {
                    throw new Error('Outer bounds (x) must be valid numeric values.');
                }
                if (xMin >= xMax) {
                    throw new Error('Outer bounds error: min must be strictly less than max.');
                }

                // Compile math equations using math.js
                const yMinExpr = math.compile(customYMin.value);
                const yMaxExpr = math.compile(customYMax.value);
                const zMinExpr = math.compile(customZMin.value);
                const zMaxExpr = math.compile(customZMax.value);
                const fExpr = math.compile(customF.value);

                yMinFunc = (x) => yMinExpr.evaluate({ x: x });
                yMaxFunc = (x) => yMaxExpr.evaluate({ x: x });
                zMinFunc = (x, y) => zMinExpr.evaluate({ x: x, y: y });
                zMaxFunc = (x, y) => zMaxExpr.evaluate({ x: x, y: y });
                fFunc = (x, y, z) => fExpr.evaluate({ x: x, y: y, z: z });

                // Strings for Latex output
                xMinStr = `${xMin}`; xMaxStr = `${xMax}`;
                yMinStr = customYMin.value; yMaxStr = customYMax.value;
                zMinStr = customZMin.value; zMaxStr = customZMax.value;
                fStr = customF.value;

                // Compute numerical result
                if (!onlySlices) {
                    calculatedNumericalResult = evaluateNumericalIntegration(xMin, xMax, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, fFunc);
                }
            } catch (err) {
                customSpinner.classList.add('hidden');
                throw new Error(`Formula Syntax Error: ${err.message}`);
            }
        }

        // Calculate current slice coordinates from sliders (0-100%)
        const xSliceVal = xMin + (outerSlider.value / 100) * (xMax - xMin);
        outerVal.textContent = xSliceVal.toFixed(2);

        const yMinAtX = yMinFunc(xSliceVal);
        const yMaxAtX = yMaxFunc(xSliceVal);
        const ySliceVal = yMinAtX + (middleSlider.value / 100) * (Math.max(0, yMaxAtX - yMinAtX));
        middleVal.textContent = ySliceVal.toFixed(2);

        const zMinAtXY = zMinFunc(xSliceVal, ySliceVal);
        const zMaxAtXY = zMaxFunc(xSliceVal, ySliceVal);
        const zSliceVal = zMinAtXY + (innerSlider.value / 100) * (Math.max(0, zMaxAtXY - zMinAtXY));
        innerVal.textContent = zSliceVal.toFixed(2);

        // Build 3D plot data
        if (!onlySlices) {
            generate3DPlot(xMin, xMax, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, xSliceVal, ySliceVal, zSliceVal, zMinAtXY);
        } else {
            updatePlotSlices(xSliceVal, ySliceVal, zSliceVal, zMinAtXY, yMinAtX, yMaxAtX, zMinAtXY, zMaxAtXY);
        }

        // Update Math LaTeX panel steps
        if (!onlySlices) {
            updateCalculations(xMinStr, xMaxStr, yMinStr, yMaxStr, zMinStr, zMaxStr, fStr, calculatedNumericalResult);
        }
    }

    function generate3DPlot(xMin, xMax, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, xSliceVal, ySliceVal, zSliceVal, zMinAtXY) {
        const plotData = [];
        const resolution = 25; // Surface resolution

        // 1. Generate surface meshes for the boundaries (Lower and Upper)
        const xVals = [];
        const dx = (xMax - xMin) / resolution;
        for (let i = 0; i <= resolution; i++) {
            xVals.push(xMin + i * dx);
        }

        // Generate lower boundary z_min and upper boundary z_max grids
        const zMinGrid = [];
        const zMaxGrid = [];
        const yValsGrid = [];

        xVals.forEach(x => {
            const yMin = yMinFunc(x);
            const yMax = yMaxFunc(x);
            const yVals = [];
            const zMinRow = [];
            const zMaxRow = [];

            const dy = (yMax - yMin) / resolution;
            for (let j = 0; j <= resolution; j++) {
                const y = yMin + j * dy;
                yVals.push(y);
                
                // Boundaries evaluation
                let zL = zMinFunc(x, y);
                let zU = zMaxFunc(x, y);
                
                if (isNaN(zL) || !isFinite(zL)) zL = 0;
                if (isNaN(zU) || !isFinite(zU)) zU = 0;

                zMinRow.push(zL);
                zMaxRow.push(zU);
            }
            yValsGrid.push(yVals);
            zMinGrid.push(zMinRow);
            zMaxGrid.push(zMaxRow);
        });

        // Convert grids to flat arrays for Plotly Mesh3D or Surface
        // We use Surface plots for top and bottom lids to create a clear 3D sandwich structure
        const surfaceX = [];
        const surfaceY = [];
        
        // Re-align matrices for surface rendering
        // Plotly surface requires X and Y to be 1D, and Z to be a 2D matrix matching dimensions
        const gridY = [];
        // Approximate coordinate projection
        const yMinOverall = yMinFunc((xMin+xMax)/2);
        const yMaxOverall = yMaxFunc((xMin+xMax)/2);
        const dy = (yMaxOverall - yMinOverall) / resolution;
        for (let j = 0; j <= resolution; j++) {
            gridY.push(yMinOverall + j * dy);
        }

        const zMinMatrix = [];
        const zMaxMatrix = [];

        xVals.forEach(x => {
            const zMinRow = [];
            const zMaxRow = [];
            gridY.forEach(y => {
                let zL = zMinFunc(x, y);
                let zU = zMaxFunc(x, y);
                if (isNaN(zL) || !isFinite(zL)) zL = 0;
                if (isNaN(zU) || !isFinite(zU)) zU = 0;
                zMinRow.push(zL);
                zMaxRow.push(zU);
            });
            zMinMatrix.push(zMinRow);
            zMaxMatrix.push(zMaxRow);
        });

        // Lower Boundary Surface
        plotData.push({
            type: 'surface',
            x: xVals,
            y: gridY,
            z: zMinMatrix,
            opacity: 0.5,
            colorscale: 'Blues',
            showscale: false,
            name: 'Lower Surface z_min(x,y)',
            showlegend: false
        });

        // Upper Boundary Surface
        plotData.push({
            type: 'surface',
            x: xVals,
            y: gridY,
            z: zMaxMatrix,
            opacity: 0.5,
            colorscale: 'Viridis',
            showscale: false,
            name: 'Upper Surface z_max(x,y)',
            showlegend: false
        });

        // 2. Slicing sweep plots (Outer plane slice, Middle strip, Inner element point)
        // Outer Slice: A vertical plane in YZ plane at x = xSliceVal
        const outerSliceY = gridY;
        const outerSliceZMin = [];
        const outerSliceZMax = [];
        
        outerSliceY.forEach(y => {
            outerSliceZMin.push(zMinFunc(xSliceVal, y));
            outerSliceZMax.push(zMaxFunc(xSliceVal, y));
        });

        const sliceXMatrix = [];
        const sliceYMatrix = [];
        const sliceZMatrix = [];

        // Build a grid matching the slice for a 3D surface plane
        const numSlicePts = 10;
        for (let i = 0; i <= numSlicePts; i++) {
            const sliceXRow = [];
            const sliceYRow = [];
            const sliceZRow = [];
            const zInterpRatio = i / numSlicePts;

            outerSliceY.forEach((y, idx) => {
                sliceXRow.push(xSliceVal);
                sliceYRow.push(y);
                const zMin = outerSliceZMin[idx];
                const zMax = outerSliceZMax[idx];
                sliceZRow.push(zMin + zInterpRatio * (zMax - zMin));
            });
            sliceXMatrix.push(sliceXRow);
            sliceYMatrix.push(sliceYRow);
            sliceZMatrix.push(sliceZRow);
        }

        // Add Outer Slicing Plane
        plotData.push({
            type: 'surface',
            x: sliceXMatrix,
            y: sliceYMatrix,
            z: sliceZMatrix,
            opacity: 0.6,
            colorscale: 'Hot',
            showscale: false,
            name: 'Outer Slice Plane',
            showlegend: false
        });

        // Middle Slice (Strip): A line at y = ySliceVal on the xSliceVal plane
        const stripZMin = zMinFunc(xSliceVal, ySliceVal);
        const stripZMax = zMaxFunc(xSliceVal, ySliceVal);
        
        plotData.push({
            type: 'scatter3d',
            x: [xSliceVal, xSliceVal],
            y: [ySliceVal, ySliceVal],
            z: [stripZMin, stripZMax],
            mode: 'lines',
            line: { color: 'magenta', width: 8 },
            name: 'Middle Strip (y)',
            showlegend: false
        });

        // Inner Slice (Point Element): A line vector representing height accumulation up to zSliceVal
        plotData.push({
            type: 'scatter3d',
            x: [xSliceVal, xSliceVal],
            y: [ySliceVal, ySliceVal],
            z: [stripZMin, zSliceVal],
            mode: 'lines+markers',
            line: { color: 'cyan', width: 12 },
            marker: { size: 6, color: 'red' },
            name: 'Inner Point/Element',
            showlegend: false
        });

        // Render Plotly configuration layout
        const layout = {
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
                xaxis: { title: 'X Axis', gridcolor: 'rgba(0,0,0,0.1)' },
                yaxis: { title: 'Y Axis', gridcolor: 'rgba(0,0,0,0.1)' },
                zaxis: { title: 'Z Axis', gridcolor: 'rgba(0,0,0,0.1)' },
                camera: cameraView || {
                    eye: { x: 1.5, y: 1.5, z: 1.2 }
                }
            },
            showlegend: false
        };

        const config = { responsive: true };

        Plotly.newPlot('plotly-graph', plotData, layout, config);

        // Capture layout camera changes
        const graphDiv = document.getElementById('plotly-graph');
        graphDiv.on('plotly_relayout', (eventdata) => {
            if (eventdata['scene.camera']) {
                cameraView = eventdata['scene.camera'];
            }
        });
    }

    function updatePlotSlices(xSliceVal, ySliceVal, zSliceVal, zMinAtXY, yMinAtX, yMaxAtX, zMinAtXYRange, zMaxAtXYRange) {
        // Find existing plotly graph data and update slices traces dynamically without complete redraw to maintain smooth performance
        const graphDiv = document.getElementById('plotly-graph');
        if (!graphDiv || !graphDiv.data) return;

        // Trace indices:
        // 0: Lower Surface
        // 1: Upper Surface
        // 2: Outer Slice Plane
        // 3: Middle Strip
        // 4: Inner Point/Element

        const updateData = {};
        
        // 1. Update Outer Slicing Plane
        const resolution = 25;
        const gridY = graphDiv.data[0].y;
        const outerSliceZMin = [];
        const outerSliceZMax = [];
        
        gridY.forEach(y => {
            // Recalculate lower and upper boundaries dynamically for the updated slice point
            // Fallbacks for custom mode bounds
            let zL = 0, zU = 0;
            if (currentMode === 'preset') {
                const shape = presetShape.value;
                const R = shapeParams.R || 3;
                const H = shapeParams.H || 4;
                const a = shapeParams.a || 3;
                const b = shapeParams.b || 4;
                const c = shapeParams.c || 3;

                if (shape === 'box') {
                    zL = 0; zU = c;
                } else if (shape === 'cylinder') {
                    zL = 0; zU = H;
                } else if (shape === 'sphere') {
                    zL = -Math.sqrt(Math.max(0, R*R - xSliceVal*xSliceVal - y*y));
                    zU = Math.sqrt(Math.max(0, R*R - xSliceVal*xSliceVal - y*y));
                } else if (shape === 'paraboloid') {
                    zL = (H / (R*R)) * (xSliceVal*xSliceVal + y*y);
                    zU = H;
                } else { // Tetrahedron
                    zL = 0; zU = Math.max(0, a - xSliceVal - y);
                }
            } else {
                try {
                    const zMinExpr = math.compile(customZMin.value);
                    const zMaxExpr = math.compile(customZMax.value);
                    zL = zMinExpr.evaluate({ x: xSliceVal, y: y });
                    zU = zMaxExpr.evaluate({ x: xSliceVal, y: y });
                } catch(e) {}
            }
            outerSliceZMin.push(zL);
            outerSliceZMax.push(zU);
        });

        const sliceXMatrix = [];
        const sliceYMatrix = [];
        const sliceZMatrix = [];

        const numSlicePts = 10;
        for (let i = 0; i <= numSlicePts; i++) {
            const sliceXRow = [];
            const sliceYRow = [];
            const sliceZRow = [];
            const zInterpRatio = i / numSlicePts;

            gridY.forEach((y, idx) => {
                sliceXRow.push(xSliceVal);
                sliceYRow.push(y);
                const zMin = outerSliceZMin[idx];
                const zMax = outerSliceZMax[idx];
                sliceZRow.push(zMin + zInterpRatio * (zMax - zMin));
            });
            sliceXMatrix.push(sliceXRow);
            sliceYMatrix.push(sliceYRow);
            sliceZMatrix.push(sliceZRow);
        }

        // 2. Update Middle Strip (Vertical Line)
        const stripZMin = zMinAtXY;
        
        let stripZMax = zMinAtXY;
        if (currentMode === 'preset') {
            const shape = presetShape.value;
            const R = shapeParams.R || 3;
            const H = shapeParams.H || 4;
            const a = shapeParams.a || 3;
            const b = shapeParams.b || 4;
            const c = shapeParams.c || 3;

            if (shape === 'box') stripZMax = c;
            else if (shape === 'cylinder') stripZMax = H;
            else if (shape === 'sphere') stripZMax = Math.sqrt(Math.max(0, R*R - xSliceVal*xSliceVal - ySliceVal*ySliceVal));
            else if (shape === 'paraboloid') stripZMax = H;
            else stripZMax = Math.max(0, a - xSliceVal - ySliceVal);
        } else {
            try {
                const zMaxExpr = math.compile(customZMax.value);
                stripZMax = zMaxExpr.evaluate({ x: xSliceVal, y: ySliceVal });
            } catch(e) {}
        }

        // Restructure plotly update payload
        Plotly.restyle('plotly-graph', {
            x: [sliceXMatrix],
            y: [sliceYMatrix],
            z: [sliceZMatrix]
        }, [2]);

        Plotly.restyle('plotly-graph', {
            x: [[xSliceVal, xSliceVal]],
            y: [[ySliceVal, ySliceVal]],
            z: [[stripZMin, stripZMax]]
        }, [3]);

        Plotly.restyle('plotly-graph', {
            x: [[xSliceVal, xSliceVal]],
            y: [[ySliceVal, ySliceVal]],
            z: [[stripZMin, zSliceVal]]
        }, [4]);
    }

    // Reset Camera Functionality
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            cameraView = null;
            updatePlotAndCalculations();
        });
    }

    // Toggle Grid lines
    if (toggleMeshBtn) {
        toggleMeshBtn.addEventListener('click', () => {
            showMeshGrid = !showMeshGrid;
            
            // Toggle grid lines configuration
            const gridcolorVal = showMeshGrid ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)';
            
            Plotly.relayout('plotly-graph', {
                'scene.xaxis.gridcolor': gridcolorVal,
                'scene.yaxis.gridcolor': gridcolorVal,
                'scene.zaxis.gridcolor': gridcolorVal
            });
        });
    }

    // Window resize trigger
    window.resizePlotly = function() {
        const gd = document.getElementById('plotly-graph');
        if (gd) {
            Plotly.Plots.resize(gd);
        }
    };

    window.addEventListener('resize', window.resizePlotly);

    // Initial triggers to load default states
    updateSlidersForShape();
    updatePlotAndCalculations();
});
