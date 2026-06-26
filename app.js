/* ==========================================================================
   Virtual Math Lab - Application JavaScript
   Evaluation of Triple Integration
   Manages tab switching, quizzes (pre/post-test), and feedback ratings.
   ========================================================================== */
function parseAngle(value){

value = value
.replace(/pi/g, Math.PI)
.replace(/PI/g, Math.PI);

return Function(
"return " + value
)();

}
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Mobile Menu and Tab Navigation
    // ----------------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-menu li a');
    const sections = document.querySelectorAll('.section');

    // Tab Switching Function
    window.switchSection = function(sectionId, element) {
        // Hide all sections
        sections.forEach(sec => sec.classList.remove('active'));
        
        // Show selected section
        const selectedSec = document.getElementById(sectionId);
        if (selectedSec) {
            selectedSec.classList.add('active');
        }

        // Deactivate all sidebar items
        navItems.forEach(item => item.classList.remove('active'));
        
        // Activate clicked sidebar item
        element.classList.add('active');

        // Close sidebar on mobile after clicking
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }

        // Trigger Plotly resizing if Simulation tab is selected
        if (sectionId === 'simulation' && window.resizePlotly) {
            window.resizePlotly();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Toggle menu visibility on mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('active');
        }
    });

  // ----------------------------------------------------------------------
// 2. Pre-Test Quiz Configuration & Logic (10 Questions)
// ----------------------------------------------------------------------
const pretestQuestions = [
    {
        id: 'pr1',
        q: 'Which coordinate system uses (x, y, z) to locate a point in space?',
        options: {
            a: 'Spherical',
            b: 'Cartesian',
            c: 'Polar',
            d: 'Cylindrical'
        },
        correct: 'b',
        explanation: 'Cartesian coordinates represent a point using three perpendicular axes: x, y, and z.'
    },
    {
        id: 'pr2',
        q: 'In Cartesian coordinates, the z-coordinate represents:',
        options: {
            a: 'Radius',
            b: 'Angle',
            c: 'Height',
            d: 'Distance from origin'
        },
        correct: 'c',
        explanation: 'The z-coordinate represents the height or vertical position of a point.'
    },
    {
        id: 'pr3',
        q: 'A point in Cartesian coordinates is written as:',
        options: {
            a: '(ρ, φ, θ)',
            b: '(r, θ)',
            c: '(x, y, z)',
            d: '(r, z)'
        },
        correct: 'c',
        explanation: 'Cartesian coordinates use the ordered triple (x, y, z).'
    },
    {
        id: 'pr4',
        q: 'Which coordinate system is most suitable for a sphere centered at the origin?',
        options: {
            a: 'Cartesian',
            b: 'Spherical',
            c: 'Rectangular',
            d: 'Plane Coordinates'
        },
        correct: 'b',
        explanation: 'Spherical coordinates are ideal for spheres because of their radial symmetry.'
    },
    {
        id: 'pr5',
        q: 'In spherical coordinates, ρ represents:',
        options: {
            a: 'Height',
            b: 'Distance from the origin',
            c: 'Angle from z-axis',
            d: 'Angle in xy-plane'
        },
        correct: 'b',
        explanation: 'ρ (rho) is the distance from the origin to the point.'
    },
    {
        id: 'pr6',
        q: 'In spherical coordinates, θ is measured in the:',
        options: {
            a: 'xz-plane',
            b: 'yz-plane',
            c: 'xy-plane',
            d: 'None of these'
        },
        correct: 'c',
        explanation: 'θ is the azimuthal angle measured in the xy-plane.'
    },
    {
        id: 'pr7',
        q: 'The angle φ in spherical coordinates is measured from the:',
        options: {
            a: 'Positive x-axis',
            b: 'Positive y-axis',
            c: 'Positive z-axis',
            d: 'Origin'
        },
        correct: 'c',
        explanation: 'φ is the angle between the positive z-axis and the radius vector.'
    },
    {
        id: 'pr8',
        q: 'Which equation correctly represents z in spherical coordinates?',
        options: {
            a: 'z = ρ sinφ',
            b: 'z = ρ cosφ',
            c: 'z = ρ sinθ',
            d: 'z = ρ cosθ'
        },
        correct: 'b',
        explanation: 'The spherical coordinate transformation is z = ρ cosφ.'
    },
    {
        id: 'pr9',
        q: 'For a complete sphere, the angle θ varies from:',
        options: {
            a: '0 to π',
            b: '0 to π/2',
            c: '0 to 2π',
            d: '0 to 4π'
        },
        correct: 'c',
        explanation: 'θ completes one full revolution around the z-axis, so θ ranges from 0 to 2π.'
    },
    {
        id: 'pr10',
        q: 'Which coordinate system is generally preferred for regions having radial symmetry about the origin?',
        options: {
            a: 'Cartesian',
            b: 'Spherical',
            c: 'Linear',
            d: 'Rectangular'
        },
        correct: 'b',
        explanation: 'Spherical coordinates simplify regions with radial symmetry such as spheres and hemispheres.'
    }
];

  // ----------------------------------------------------------------------
// Post-Test Quiz Configuration & Logic (10 Questions)
// ----------------------------------------------------------------------
const posttestQuestions = [
{
    id: 'po1',
    q: 'Which coordinate system is most suitable for evaluating the volume of a sphere centered at the origin?',
    options: {
        a: 'Cartesian',
        b: 'Spherical',
        c: 'Rectangular',
        d: 'Plane Polar'
    },
    correct: 'b',
    explanation: 'Spherical coordinates match the symmetry of a sphere and simplify the limits of integration.'
},
{
    id: 'po2',
    q: 'Find the value of \\(x^2+y^2+z^2\\) at the point \\((2,1,2)\\).',
    options: {
        a: '7',
        b: '8',
        c: '9',
        d: '10'
    },
    correct: 'c',
    explanation: '2² + 1² + 2² = 4 + 1 + 4 = 9.'
},
{
    id: 'po3',
    q: 'The Cartesian equation \\(x^2+y^2+z^2=16\\) represents:',
    options: {
        a: 'Cylinder',
        b: 'Cone',
        c: 'Sphere of radius 4',
        d: 'Paraboloid'
    },
    correct: 'c',
    explanation: 'The equation x²+y²+z²=r² represents a sphere of radius r. Here r=4.'
},
{
    id: 'po4',
    q: 'Find the spherical coordinate distance \\(\\rho\\) of the point \\((0,0,5)\\).',
    options: {
        a: '0',
        b: '5',
        c: '10',
        d: '25'
    },
    correct: 'b',
    explanation: 'ρ = √(0²+0²+5²) = 5.'
},
{
    id: 'po5',
    q: 'For the upper hemisphere of a sphere, the angle \\(\\phi\\) varies between:',
    options: {
        a: '\\(0\\leq\\phi\\leq\\pi\\)',
        b: '\\(\\pi/2\\leq\\phi\\leq\\pi\\)',
        c: '\\(0\\leq\\phi\\leq\\pi/2\\)',
        d: '\\(0\\leq\\phi\\leq2\\pi\\)'
    },
    correct: 'c',
    explanation: 'For points above the xy-plane, φ varies from 0 to π/2.'
},
{
    id: 'po6',
    q: 'Which of the following points lies in the first octant?',
    options: {
        a: '(2,1,3)',
        b: '(-2,1,3)',
        c: '(2,-1,3)',
        d: '(2,1,-3)'
    },
    correct: 'a',
    explanation: 'In the first octant, x, y and z are all positive.'
},
{
    id: 'po7',
    q: 'For a sphere of radius 6, the correct limits of \\(\\rho\\) are:',
    options: {
        a: '\\(-6\\leq\\rho\\leq6\\)',
        b: '\\(0\\leq\\rho\\leq6\\)',
        c: '\\(0\\leq\\rho\\leq12\\)',
        d: '\\(0\\leq\\rho\\leq\\pi\\)'
    },
    correct: 'b',
    explanation: 'The radial distance starts at the origin and ends at the sphere boundary.'
},
{
    id: 'po8',
    q: 'The Jacobian factor in spherical coordinates is:',
    options: {
        a: '\\(\\rho\\)',
        b: '\\(\\rho\\sin\\phi\\)',
        c: '\\(\\rho^2\\sin\\phi\\)',
        d: '\\(\\rho^2\\cos\\phi\\)'
    },
    correct: 'c',
    explanation: 'The differential volume element is dV = ρ²sinφ dρ dφ dθ.'
},
{
    id: 'po9',
    q: 'Evaluate \\(\\iiint_V 1\\,dV\\) if the volume of the solid region is 20 cubic units.',
    options: {
        a: '1',
        b: '10',
        c: '20',
        d: '40'
    },
    correct: 'c',
    explanation: 'The triple integral of 1 over a region equals its volume.'
},
{
    id: 'po10',
    q: 'The positive octant of a sphere is described by:',
    options: {
        a: '\\(0\\leq\\phi\\leq\\pi,\\;0\\leq\\theta\\leq2\\pi\\)',
        b: '\\(0\\leq\\phi\\leq\\pi/2,\\;0\\leq\\theta\\leq\\pi/2\\)',
        c: '\\(0\\leq\\phi\\leq\\pi/2,\\;0\\leq\\theta\\leq2\\pi\\)',
        d: '\\(\\pi/2\\leq\\phi\\leq\\pi,\\;0\\leq\\theta\\leq\\pi/2\\)'
    },
    correct: 'b',
    explanation: 'In the positive octant, x≥0, y≥0 and z≥0, giving φ and θ both from 0 to π/2.'
}
];

    // Helper to generate quiz HTML
    function buildQuiz(questions, containerId, prefix) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        questions.forEach((q, idx) => {
            html += `
                <div class="question-container" id="${prefix}-q${idx}-box">
                    <div class="question-number">${idx + 1}</div>
                    <div class="question-text">${q.q}</div>
                    <div class="options">
                        ${Object.entries(q.options).map(([key, val]) => `
                            <div class="option" onclick="selectQuizOption(this, '${prefix}-q${idx}')">
                                <input type="radio" name="${prefix}-q${idx}" value="${key}" id="${prefix}-q${idx}-${key}">
                                <label for="${prefix}-q${idx}-${key}">${val}</label>
                                <span class="answer-indicator"><i class="fas"></i></span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="explanation-box" id="${prefix}-explain-${idx}">
                        <strong>Explanation:</strong> ${q.explanation}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Render math equations after injection
        if (window.renderMathInElement) {
            window.renderMathInElement(container);
        }
    }

    // Option Click Handler
    window.selectQuizOption = function(optionElement, name) {
        // Prevent selection changes if already evaluated/submitted
        const nameParts = name.split('-');
        const prefix = nameParts[0];
        const resultBox = document.getElementById(`${prefix}-result`);
        if (resultBox && resultBox.classList.contains('show')) {
            return;
        }

        // Remove selection highlight from other options of same question
        const optionsContainer = optionElement.parentElement;
        const options = optionsContainer.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));

        // Highlight clicked option
        optionElement.classList.add('selected');

        // Check radio input
        const radio = optionElement.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    };

    // Quiz Submission Handler
    function evaluateQuiz(questions, prefix) {
        const resultBox = document.getElementById(`${prefix}-result`);
        const summaryBox = document.getElementById(`${prefix}-summary`);
        const scoreNum = document.getElementById(`${prefix}-score`);
        const percentageDiv = document.getElementById(`${prefix}-percentage`);

        let score = 0;
        let unanswered = false;

        questions.forEach((q, idx) => {
            const selectedRadio = document.querySelector(`input[name="${prefix}-q${idx}"]:checked`);
            const questionBox = document.getElementById(`${prefix}-q${idx}-box`);
            const explainBox = document.getElementById(`${prefix}-explain-${idx}`);

            if (!selectedRadio) {
                unanswered = true;
                return;
            }

            const selectedValue = selectedRadio.value;
            const optionDivs = questionBox.querySelectorAll('.option');

            optionDivs.forEach(optDiv => {
                const radio = optDiv.querySelector('input[type="radio"]');
                const indicator = optDiv.querySelector('.answer-indicator i');
                
                // Clear state
                optDiv.classList.remove('selected', 'correct', 'incorrect');

                if (radio.value === q.correct) {
                    optDiv.classList.add('correct');
                    if (indicator) {
                        indicator.className = 'fas fa-check-circle';
                    }
                } else if (radio.value === selectedValue) {
                    optDiv.classList.add('incorrect');
                    if (indicator) {
                        indicator.className = 'fas fa-times-circle';
                    }
                }
            });

            // Show explanation
            if (explainBox) {
                explainBox.style.display = 'block';
            }

            if (selectedValue === q.correct) {
                score++;
            }
        });

        if (unanswered) {
            alert('Please answer all questions before submitting.');
            return;
        }

        // Show score results
        resultBox.className = 'result show success';
        resultBox.innerHTML = `<i class="fas fa-info-circle"></i> Quiz evaluated. Your score has been calculated below. Explications are shown for each question.`;
        
        summaryBox.classList.add('active');
        scoreNum.textContent = score;
        const percentage = Math.round((score / questions.length) * 100);
        percentageDiv.innerHTML = `<strong>Percentage:</strong> ${percentage}%`;

        // Hide submit button, show reset
        document.getElementById(`submit-${prefix}`).style.display = 'none';
        document.getElementById(`reset-${prefix}`).style.display = 'inline-flex';
    }

    // Reset Quiz Functionality
    function resetQuiz(questions, prefix) {
        questions.forEach((q, idx) => {
            const questionBox = document.getElementById(`${prefix}-q${idx}-box`);
            const explainBox = document.getElementById(`${prefix}-explain-${idx}`);
            
            // Clear checked radios and classes
            const optionDivs = questionBox.querySelectorAll('.option');
            optionDivs.forEach(optDiv => {
                optDiv.classList.remove('selected', 'correct', 'incorrect');
                const radio = optDiv.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });

            // Hide explanation
            if (explainBox) {
                explainBox.style.display = 'none';
            }
        });

        // Hide results
        const resultBox = document.getElementById(`${prefix}-result`);
        const summaryBox = document.getElementById(`${prefix}-summary`);
        resultBox.classList.remove('show');
        summaryBox.classList.remove('active');

        // Toggle buttons
        document.getElementById(`submit-${prefix}`).style.display = 'inline-flex';
        document.getElementById(`reset-${prefix}`).style.display = 'none';
    }

    // Build and Bind Pre-Test
    buildQuiz(pretestQuestions, 'pretest-questions', 'pretest');
    document.getElementById('submit-pretest').addEventListener('click', () => evaluateQuiz(pretestQuestions, 'pretest'));
    document.getElementById('reset-pretest').addEventListener('click', () => resetQuiz(pretestQuestions, 'pretest'));

    // Build and Bind Post-Test
    buildQuiz(posttestQuestions, 'posttest-questions', 'posttest');
    document.getElementById('submit-posttest').addEventListener('click', () => evaluateQuiz(posttestQuestions, 'posttest'));
    document.getElementById('reset-posttest').addEventListener('click', () => resetQuiz(posttestQuestions, 'posttest'));

    // ----------------------------------------------------------------------
    // 4. Feedback Form Interactive Ratings
    // ----------------------------------------------------------------------
    const feedbackStars = document.querySelectorAll('.rating-star');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackResult = document.getElementById('feedback-result');

    // Star Hover & Selected Listeners
    feedbackStars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const value = parseInt(star.getAttribute('data-value'));
            const group = star.getAttribute('data-group');
            const groupStars = document.querySelectorAll(`.rating-star[data-group="${group}"]`);
            
            groupStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });

        star.addEventListener('mouseout', () => {
            const group = star.getAttribute('data-group');
            const groupStars = document.querySelectorAll(`.rating-star[data-group="${group}"]`);
            groupStars.forEach(s => s.classList.remove('hover'));
        });

        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'));
            const group = star.getAttribute('data-group');
            const input = document.getElementById(`rating-${group}`);
            const groupStars = document.querySelectorAll(`.rating-star[data-group="${group}"]`);

            if (input) {
                input.value = value;
            }

            groupStars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        });
    });

    // Feedback Submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic Validation for Rating fields
            const rateUI = document.getElementById('rating-ui').value;
            const rateMath = document.getElementById('rating-math').value;

            if (rateUI === "0" || rateMath === "0") {
                alert('Please provide star ratings before submitting.');
                return;
            }

            // Success feedback animation
            feedbackResult.className = 'result show success';
            feedbackResult.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                <strong>Thank you!</strong> Your feedback has been submitted successfully to the Mathematics Internship Programme committee. We appreciate your input to improve the Virtual Lab!
            `;

            // Reset form fields
            feedbackForm.reset();
            
            // Clear stars
            feedbackStars.forEach(s => s.classList.remove('selected'));
            document.getElementById('rating-ui').value = 0;
            document.getElementById('rating-math').value = 0;

            // Scroll to feedback result
            feedbackResult.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
const coordSelect =
document.getElementById("coordinate-system");

if(coordSelect){

const limitInputs =
document.getElementById("limit-inputs");

function createInputs(){

let html="";

if(coordSelect.value==="cartesian"){

html=`

<div class="limit-group">
<label>x limits</label>
<input id="xmin" value="0">
<input id="xmax" value="2">
</div>

<div class="limit-group">
<label>y limits</label>
<input id="ymin" value="0">
<input id="ymax" value="2">
</div>

<div class="limit-group">
<label>z limits</label>
<input id="zmin" value="0">
<input id="zmax" value="2">
</div>

`;

}

else{

html=`

<div class="limit-group">
<label>ρ limits</label>
<input id="rmin" value="0">
<input id="rmax" value="3">
</div>

<div class="limit-group">
<label>θ limits</label>
<input id="tmin" value="0">
<input id="tmax" value="2*pi">
</div>

<div class="limit-group">
<label>φ limits</label>
<input id="pmin" value="0">
<input id="pmax" value="pi">
</div>

`;

}

limitInputs.innerHTML=html;

}

createInputs();

coordSelect.addEventListener(
"change",
createInputs
);
document
.getElementById("generate-region")
.addEventListener("click",generateRegion);

function generateRegion(){

if(coordSelect.value==="cartesian"){

drawCartesian();

}
else{

drawSphere();

}

}
function drawCartesian(){

let xmin=parseFloat(
document.getElementById("xmin").value);

let xmax=parseFloat(
document.getElementById("xmax").value);

let ymin=parseFloat(
document.getElementById("ymin").value);

let ymax=parseFloat(
document.getElementById("ymax").value);

let zmin=parseFloat(
document.getElementById("zmin").value);

let zmax=parseFloat(
document.getElementById("zmax").value);

let trace={
type:'mesh3d',

x:[
xmin,xmax,xmax,xmin,
xmin,xmax,xmax,xmin
],

y:[
ymin,ymin,ymax,ymax,
ymin,ymin,ymax,ymax
],

z:[
zmin,zmin,zmin,zmin,
zmax,zmax,zmax,zmax
],

opacity:0.6
};

Plotly.newPlot(
'plotly-graph',
[trace]
);

}
function drawSphere(){

let R=parseFloat(
document.getElementById("rmax").value
);

let u=[];
let v=[];
let x=[];
let y=[];
let z=[];

for(let i=0;i<30;i++){

u[i]=[];

x[i]=[];
y[i]=[];
z[i]=[];

for(let j=0;j<30;j++){

let theta=
2*Math.PI*i/29;

let phi=
Math.PI*j/29;

x[i][j]=
R*Math.sin(phi)*Math.cos(theta);

y[i][j]=
R*Math.sin(phi)*Math.sin(theta);

z[i][j]=
R*Math.cos(phi);

}

}

let data=[{

type:'surface',
x:x,
y:y,
z:z

}];

Plotly.newPlot(
'plotly-graph',
data
);

}
document
.getElementById("evaluate-volume")
.addEventListener(
"click",
evaluateVolume
);
function evaluateVolume(){

if(coordSelect.value==="cartesian"){

let xmin=parseFloat(
document.getElementById("xmin").value
);

let xmax=parseFloat(
document.getElementById("xmax").value
);

let ymin=parseFloat(
document.getElementById("ymin").value
);

let ymax=parseFloat(
document.getElementById("ymax").value
);

let zmin=parseFloat(
document.getElementById("zmin").value
);

let zmax=parseFloat(
document.getElementById("zmax").value
);

let volume=
(xmax-xmin)*
(ymax-ymin)*
(zmax-zmin);

document.getElementById("solution-steps").innerHTML = `

<h3>Region Limits</h3>

<p>${xmin} ≤ x ≤ ${xmax}</p>
<p>${ymin} ≤ y ≤ ${ymax}</p>
<p>${zmin} ≤ z ≤ ${zmax}</p>

<hr>

<h3>Triple Integral</h3>

<p>V = ∭ 1 dV</p>

<p>
V =
∫<sub>${xmin}</sub><sup>${xmax}</sup>
∫<sub>${ymin}</sub><sup>${ymax}</sup>
∫<sub>${zmin}</sub><sup>${zmax}</sup>
1 dz dy dx
</p>

<hr>

<h3>Evaluate Inner Integral</h3>

<p>
∫<sub>${zmin}</sub><sup>${zmax}</sup> 1 dz
</p>

<p>
= z |<sub>${zmin}</sub><sup>${zmax}</sup>
</p>

<p>
= ${zmax-zmin}
</p>

<hr>

<h3>Evaluate Middle Integral</h3>

<p>
∫<sub>${ymin}</sub><sup>${ymax}</sup> dy
</p>

<p>
= ${ymax-ymin}
</p>

<hr>

<h3>Evaluate Outer Integral</h3>

<p>
∫<sub>${xmin}</sub><sup>${xmax}</sup> dx
</p>

<p>
= ${xmax-xmin}
</p>

<hr>

<h3>Final Volume</h3>

<p>
V =
(${xmax-xmin})
×
(${ymax-ymin})
×
(${zmax-zmin})
</p>

<p>
=
${volume}
</p>

<hr>

<h2 style="color:green;">
Final Volume = ${volume} cubic units
</h2>

`;

}

else{

evaluateSphere();

}

}
function evaluateSphere(){

let rmin = parseFloat(
document.getElementById("rmin").value
);

let rmax = parseFloat(
document.getElementById("rmax").value
);

let tmin = parseAngle(
document.getElementById("tmin").value
);

let tmax = parseAngle(
document.getElementById("tmax").value
);

let pmin = parseAngle(
document.getElementById("pmin").value
);

let pmax = parseAngle(
document.getElementById("pmax").value
);

let rhoPart =
(Math.pow(rmax,3)-Math.pow(rmin,3))/3;

let phiPart =
Math.cos(pmin)-Math.cos(pmax);

let thetaPart =
tmax-tmin;

let volume =
rhoPart *
phiPart *
thetaPart;

document.getElementById(
"solution-steps"
).innerHTML = `

<h3>Region Limits</h3>

<p>${rmin} ≤ ρ ≤ ${rmax}</p>

<p>
${document.getElementById("pmin").value}
≤ φ ≤
${document.getElementById("pmax").value}
</p>

<p>
${document.getElementById("tmin").value}
≤ θ ≤
${document.getElementById("tmax").value}
</p>

<hr>

<h3>Volume Integral</h3>

<p>
V =
∫∫∫ ρ² sinφ dρ dφ dθ
</p>

<p>
V =
∫<sub>${document.getElementById("tmin").value}</sub>
<sup>${document.getElementById("tmax").value}</sup>

∫<sub>${document.getElementById("pmin").value}</sub>
<sup>${document.getElementById("pmax").value}</sup>

∫<sub>${rmin}</sub>
<sup>${rmax}</sup>

ρ² sinφ
dρ dφ dθ
</p>

<hr>

<h3>Step 1 : Integrate wrt ρ</h3>

<p>
(ρ³/3)|<sub>${rmin}</sub><sup>${rmax}</sup>
</p>

<p>
=
${rhoPart.toFixed(4)}
</p>

<hr>

<h3>Step 2 : Integrate wrt φ</h3>

<p>
[-cosφ]
</p>

<p>
=
cos(${document.getElementById("pmin").value})
-
cos(${document.getElementById("pmax").value})
</p>

<p>
=
${phiPart.toFixed(4)}
</p>

<hr>

<h3>Step 3 : Integrate wrt θ</h3>

<p>
θ|<sub>${document.getElementById("tmin").value}</sub>
<sup>${document.getElementById("tmax").value}</sup>
</p>

<p>
=
${thetaPart.toFixed(4)}
</p>

<hr>

<h3>Final Volume</h3>

<p>
=
${rhoPart.toFixed(4)}
×
${phiPart.toFixed(4)}
×
${thetaPart.toFixed(4)}
</p>

<p>
=
${volume.toFixed(4)}
</p>

<hr>

<h2 style="color:green">
Volume = ${volume.toFixed(4)}
</h2>

`;
}
}
function showSimTab(tabId, btn){

    document
        .querySelectorAll(".sim-content")
        .forEach(tab => {
            tab.classList.remove("active");
        });

    document
        .getElementById(tabId)
        .classList.add("active");

    document
        .querySelectorAll(".sim-tab-btn")
        .forEach(button => {
            button.classList.remove("active");
        });

    btn.classList.add("active");
}
window.addEventListener("DOMContentLoaded",()=>{

    document
    .getElementById("solve-triple")
    .addEventListener(
        "click",
        solveTripleIntegral
    );

});
function solveTripleIntegral(){
    const integrand =
    document.getElementById("integrand").value;

    const f = math.compile(integrand);

    const xMin =
    parseFloat(
        document.getElementById("xlower").value
    );

    const xMax =
    parseFloat(
        document.getElementById("xupper").value
    );

    const yMinExpr =
    math.compile(
        document.getElementById("ylower").value
    );

    const yMaxExpr =
    math.compile(
        document.getElementById("yupper").value
    );

    const zMinExpr =
    math.compile(
        document.getElementById("zlower").value
    );

    const zMaxExpr =
    math.compile(
        document.getElementById("zupper").value
    );

    let total = 0;

    const Nx = 20;
    const Ny = 20;
    const Nz = 20;

    const dx = (xMax - xMin)/Nx;

    for(let i=0;i<Nx;i++){

        const x =
        xMin + (i+0.5)*dx;

        const yMin =
        yMinExpr.evaluate({x});

        const yMax =
        yMaxExpr.evaluate({x});

        const dy =
        (yMax-yMin)/Ny;

        for(let j=0;j<Ny;j++){

            const y =
            yMin + (j+0.5)*dy;

            const zMin =
            zMinExpr.evaluate({x,y});

            const zMax =
            zMaxExpr.evaluate({x,y});

            const dz =
            (zMax-zMin)/Nz;

            for(let k=0;k<Nz;k++){

                const z =
                zMin + (k+0.5)*dz;

                total +=
                f.evaluate({x,y,z})
                *dx*dy*dz;
            }
        }
    }

let stepZ =
"∫(" + integrand + ") dz";

let afterZ =
"Apply z limits";

let stepY =
"Integrate result wrt y";

let afterY =
"Apply y limits";

let stepX =
"Integrate result wrt x";

let finalSymbolic =
"Final symbolic form";

document.getElementById("triple-solution").innerHTML = `

<h3>Step 1 : Original Integral</h3>

<p>
I =
∫<sub>${xMin}</sub><sup>${xMax}</sup>
∫<sub>${document.getElementById("ylower").value}</sub>
<sup>${document.getElementById("yupper").value}</sup>
∫<sub>${document.getElementById("zlower").value}</sub>
<sup>${document.getElementById("zupper").value}</sup>

(${integrand})

dz dy dx
</p>

<hr>

<h3>Step 2 : Integrate wrt z</h3>

<p>
∫(${integrand}) dz
<br>
= ${stepZ}
</p>
<hr>

<h3>Step 3 : Apply z limits</h3>

<p>
${afterZ}
</p>

<hr>

<h3>Step 4 : Integrate wrt y</h3>

<p>
∫(${afterZ}) dy
<br>
= ${stepY}
</p>

<hr>

<h3>Step 5 : Apply y limits</h3>

<p>
${afterY}
</p>
<hr>

<h3>Step 6 : Integrate wrt x</h3>

<p>
∫(${afterY}) dx
<br>
= ${stepX}
</p>

<hr>

<h3>Step 7 : Apply x limits</h3>

<p>
${finalSymbolic}
</p>
<hr>

<h2 style="color:green">
Numerical Answer = ${total.toFixed(6)}
</h2>

`;

drawTripleRegion();
}
function drawTripleRegion(){

    const xMin =
    parseFloat(document.getElementById("xlower").value);

    const xMax =
    parseFloat(document.getElementById("xupper").value);

    let yMax = xMax;

    try{
        yMax =
        math.evaluate(
            document.getElementById("yupper").value,
            {x:xMax}
        );
    }
    catch(e){}

    let zMax = xMax + yMax;

    try{
        zMax =
        math.evaluate(
            document.getElementById("zupper").value,
            {
                x:xMax,
                y:yMax
            }
        );
    }
    catch(e){}

    let trace = {

        type:'mesh3d',

        x:[
            xMin,xMax,xMax,xMin,
            xMin,xMax,xMax,xMin
        ],

        y:[
            0,0,yMax,yMax,
            0,0,yMax,yMax
        ],

        z:[
            0,0,0,0,
            zMax,zMax,zMax,zMax
        ],

        opacity:0.6
    };

    let layout = {

        title:"Region of Integration",

        scene:{
            xaxis:{title:"x"},
            yaxis:{title:"y"},
            zaxis:{title:"z"}
        }
    };

    Plotly.newPlot(
        "triple-plot",
        [trace],
        layout
    );

}

