/* ==========================================================================
   Virtual Math Lab - Application JavaScript
   Evaluation of Triple Integration
   Manages tab switching, quizzes (pre/post-test), and feedback ratings.
   ========================================================================== */

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
            q: 'What represents the differential volume element \\(dV\\) in cylindrical coordinates?',
            options: {
                a: '\\(dr \\, d\\theta \\, dz\\)',
                b: '\\(r \\, dz \\, dr \\, d\\theta\\)',
                c: '\\(\\rho^2 \\sin\\phi \\, d\\rho \\, d\\phi \\, d\\theta\\)',
                d: '\\(r \\, dz \\, dr\\)'
            },
            correct: 'b',
            explanation: 'In cylindrical coordinates, \\(x = r \\cos\\theta\\), \\(y = r \\sin\\theta\\), and \\(z = z\\). The Jacobian determinant of the transformation is \\(r\\), which means the differential volume element is \\(dV = r \\, dz \\, dr \\, d\\theta\\).'
        },
        {
            id: 'pr2',
            q: 'In spherical coordinates, the polar/colatitude angle \\(\\phi\\) (tilt from positive z-axis) ranges from:',
            options: {
                a: '\\(0\\) to \\(2\\pi\\)',
                b: '\\(-\\pi\\) to \\(\\pi\\)',
                c: '\\(0\\) to \\(\\pi\\)',
                d: '\\(-\\pi/2\\) to \\(\\pi/2\\)'
            },
            correct: 'c',
            explanation: 'The polar angle \\(\\phi\\) starts at \\(0\\) (along the positive z-axis) and sweeps down to \\(\\pi\\) (along the negative z-axis). Sweeping beyond \\(\\pi\\) is covered by rotating the azimuthal angle \\(\\theta\\) from \\(0\\) to \\(2\\pi\\).'
        },
        {
            id: 'pr3',
            q: 'Which of the following solids is best represented using cylindrical coordinates?',
            options: {
                a: 'A rectangular box',
                b: 'A sphere centered at the origin',
                c: 'A cylinder centered on the z-axis',
                d: 'A tetrahedron bounded by coordinate planes'
            },
            correct: 'c',
            explanation: 'Cylindrical coordinates are best suited for regions with rotational symmetry about a single axis, like cylinders, cones, or paraboloids. The boundaries of a cylinder centered on the z-axis simplify to constant limits: \\(r = R\\).'
        },
        {
            id: 'pr4',
            q: 'If \\(f(x, y, z) = 1\\) is integrated over a solid region \\(V\\), the value of the triple integral represents:',
            options: {
                a: 'The mass of the region',
                b: 'The surface area of the region',
                c: 'The volume of the region',
                d: 'The centroid of the region'
            },
            correct: 'c',
            explanation: 'Integrating the constant function \\(1\\) over a solid region \\(V\\) sums up all the infinitesimal volume elements \\(dV\\) in the region, yielding the total volume: \\(\\iiint_V 1 \\, dV = \\text{Volume}(V)\\).'
        },
        {
            id: 'pr5',
            q: 'What is the transformation equation for \\(z\\) in spherical coordinates?',
            options: {
                a: '\\(z = \\rho \\sin\\phi\\)',
                b: '\\(z = \\rho \\cos\\phi\\)',
                c: '\\(z = \\rho \\sin\\phi \\cos\\theta\\)',
                d: '\\(z = \\rho \\cos\\theta\\)'
            },
            correct: 'b',
            explanation: 'Using spherical trigonometry, the projection of the radial vector of length \\(\\rho\\) onto the vertical z-axis is determined by the adjacent angle \\(\\phi\\), giving \\(z = \\rho \\cos\\phi\\).'
        },
        {
            id: 'pr6',
            q: 'What is the equation of a circular cone centered on the z-axis with its vertex at the origin?',
            options: {
                a: '\\(z^2 = x^2 + y^2\\)',
                b: '\\(z = x^2 + y^2\\)',
                c: '\\(x^2 + y^2 + z^2 = R^2\\)',
                d: '\\(z = x + y\\)'
            },
            correct: 'a',
            explanation: 'A circular cone centered on the z-axis is defined by the equation \\(z^2 = c^2(x^2 + y^2)\\). For a standard cone making a \\(45^\\circ\\) angle with the z-axis, \\(c = 1\\), yielding \\(z^2 = x^2 + y^2\\).'
        },
        {
            id: 'pr7',
            q: 'Convert the Cartesian point \\((1, \\sqrt{3}, 2)\\) to Cylindrical coordinates \\((r, \\theta, z)\\).',
            options: {
                a: '\\((2, \\pi/6, 2)\\)',
                b: '\\((2, \\pi/3, 2)\\)',
                c: '\\((4, \\pi/3, 2)\\)',
                d: '\\((2, 2\\pi/3, 2)\\)'
            },
            correct: 'b',
            explanation: 'The radial coordinate is \\(r = \\sqrt{x^2+y^2} = \\sqrt{1 + 3} = 2\\). The angle is \\(\\theta = \\arctan(y/x) = \\arctan(\\sqrt{3}) = \\pi/3\\). The z-coordinate remains \\(2\\), giving \\((2, \\pi/3, 2)\\).'
        },
        {
            id: 'pr8',
            q: 'Convert the Cartesian point \\((0, 0, 2)\\) to Spherical coordinates \\((\\rho, \\phi, \\theta)\\).',
            options: {
                a: '\\((2, 0, 0)\\)',
                b: '\\((2, \\pi/2, 0)\\)',
                c: '\\((2, \\pi, 0)\\)',
                d: '\\((2, 0, \\pi/2)\\)'
            },
            correct: 'a',
            explanation: 'The point lies on the positive z-axis. The distance from the origin is \\(\\rho = 2\\). Since it lies on the positive z-axis, the polar angle \\(\\phi = 0\\), and the azimuthal angle \\(\\theta\\) is arbitrary (conventionally set to \\(0\\)), resulting in \\((2, 0, 0)\\).'
        },
        {
            id: 'pr9',
            q: 'What is the value of the double integral \\(\\int_0^1 \\int_0^x dy \\, dx\\)?',
            options: {
                a: '\\(1\\)',
                b: '\\(1/2\\)',
                c: '\\(1/3\\)',
                d: '\\(2\\)'
            },
            correct: 'b',
            explanation: 'Evaluating the inner integral gives \\(\\int_0^x dy = x\\). The outer integral is \\(\\int_0^1 x \\, dx = [\\frac{x^2}{2}]_0^1 = 1/2\\).'
        },
        {
            id: 'pr10',
            q: 'Which coordinate system is most appropriate for integrating over a paraboloid \\(z = 9 - x^2 - y^2\\) above the xy-plane?',
            options: {
                a: 'Cartesian',
                b: 'Cylindrical',
                c: 'Spherical',
                d: 'Bipolar'
            },
            correct: 'b',
            explanation: 'The paraboloid has rotational symmetry about the z-axis, and the boundary in the xy-plane is the circle \\(x^2 + y^2 = 9\\). Cylindrical coordinates \\((r, \\theta, z)\\) are ideal, yielding limits \\(\\theta \\in [0, 2\\pi]\\), \\(r \\in [0, 3]\\), and \\(z \\in [0, 9 - r^2]\\).'
        }
    ];

    // ----------------------------------------------------------------------
    // 3. Post-Test Quiz Configuration & Logic (10 Questions)
    // ----------------------------------------------------------------------
    const posttestQuestions = [
        {
            id: 'po1',
            q: 'When evaluating the volume of a sphere of radius \\(R\\) centered at the origin using spherical coordinates, the limits of integration are:',
            options: {
                a: '\\(\\rho \\in [0, R], \\, \\phi \\in [0, \\pi], \\, \\theta \\in [0, 2\\pi]\\)',
                b: '\\(\\rho \\in [0, R], \\, \\phi \\in [0, 2\\pi], \\, \\theta \\in [0, \\pi]\\)',
                c: '\\(\\rho \\in [0, R], \\, \\phi \\in [-\\pi, \\pi], \\, \\theta \\in [0, \\pi]\\)',
                d: '\\(\\rho \\in [-R, R], \\, \\phi \\in [0, \\pi], \\, \\theta \\in [0, 2\\pi]\\)'
            },
            correct: 'a',
            explanation: 'To sweep out the entire volume of a sphere of radius \\(R\\), the radius \\(\\rho\\) must span from \\(0\\) to \\(R\\), the polar angle \\(\\phi\\) must sweep from top to bottom pole \\([0, \\pi]\\), and the azimuthal angle \\(\\theta\\) must sweep a full circle in the xy-plane \\([0, 2\\pi]\\).'
        },
        {
            id: 'po2',
            q: 'For a solid tetrahedron bounded by the coordinate planes and the plane \\(x + y + z = 1\\), what are the limits of the inner integral with respect to \\(z\\) (in the order \\(dz \\, dy \\, dx\\))?',
            options: {
                a: '\\(0 \\le z \\le 1\\)',
                b: '\\(0 \\le z \\le 1 - x - y\\)',
                c: '\\(0 \\le z \\le 1 - x\\)',
                d: '\\(x + y \\le z \\le 1\\)'
            },
            correct: 'b',
            explanation: 'The lower bound is the xy-plane (where \\(z=0\\)). The upper bound is the boundary plane \\(x + y + z = 1\\). Solving for \\(z\\) in terms of \\(x\\) and \\(y\\) yields \\(z = 1 - x - y\\), giving limits of \\(0\\) to \\(1 - x - y\\).'
        },
        {
            id: 'po3',
            q: 'Why does a paraboloid region bounded by \\(z = x^2 + y^2\\) and the plane \\(z = 4\\) simplify in cylindrical coordinates?',
            options: {
                a: 'Because the boundaries become constant limits for all variables',
                b: 'Because the boundary equation becomes \\(z = r^2\\), which eliminates the angular dependency',
                c: 'Because the volume element cancels out the variables',
                d: 'Because the limits for \\(z\\) are independent of \\(r\\)'
            },
            correct: 'b',
            explanation: 'Since \\(x^2 + y^2 = r^2\\) in cylindrical coordinates, the boundary paraboloid is defined by \\(z = r^2\\). This eliminates \\(\\theta\\) from the limits: \\(\\theta \\in [0, 2\\pi]\\), \\(r \\in [0, 2]\\), and \\(z \\in [r^2, 4]\\).'
        },
        {
            id: 'po4',
            q: 'What is the Jacobian determinant factor when transforming a triple integral from Cartesian coordinates to Spherical coordinates?',
            options: {
                a: '\\(r\\)',
                b: '\\(\\rho \\sin\\phi\\)',
                c: '\\(\\rho^2 \\sin\\phi\\)',
                d: '\\(\\rho^2 \\cos\\phi\\)'
            },
            correct: 'c',
            explanation: 'The Jacobian determinant of transformation from Cartesian \\((x,y,z)\\) to spherical \\((\\rho, \\phi, \\theta)\\) is \\(\\rho^2 \\sin\\phi\\). This factor acts as a scaling term to account for the distortion of volume elements during coordinate mapping.'
        },
        {
            id: 'po5',
            q: 'If we change the order of integration of a triple integral (e.g., from \\(dz \\, dy \\, dx\\) to \\(dx \\, dy \\, dz\\)), what happens?',
            options: {
                a: 'The final numerical value of the integral changes',
                b: 'Only the integrand function changes',
                c: 'The limits of integration and the differential sequence change',
                d: 'Nothing changes, the limits remain identical'
            },
            correct: 'c',
            explanation: 'By Fubini\'s Theorem, the final numerical value remains identical. However, changing the order of integration requires boundary projection onto different coordinate planes, changing the mathematical limits and the differential sequence.'
        },
        {
            id: 'po6',
            q: 'What are the limits of integration for evaluating \\(\\iiint_V dV\\) over a box bounded by \\(x \\in [-1, 1]\\), \\(y \\in [0, 2]\\), and \\(z \\in [0, 3]\\)?',
            options: {
                a: '\\(\\int_{0}^{1} \\int_{0}^{2} \\int_{0}^{3} dz \\, dy \\, dx\\)',
                b: '\\(\\int_{-1}^{1} \\int_{0}^{2} \\int_{0}^{3} dz \\, dy \\, dx\\)',
                c: '\\(\\int_{-1}^{1} \\int_{-2}^{2} \\int_{0}^{3} dz \\, dy \\, dx\\)',
                d: '\\(\\int_{0}^{1} \\int_{0}^{2} \\int_{-3}^{3} dz \\, dy \\, dx\\)'
            },
            correct: 'b',
            explanation: 'The limits correspond directly to the boundaries of the box: \\(x\\) ranges from \\(-1\\) to \\(1\\), \\(y\\) from \\(0\\) to \\(2\\), and \\(z\\) from \\(0\\) to \\(3\\).'
        },
        {
            id: 'po7',
            q: 'When evaluating the volume of a cone \\(z = \\sqrt{x^2+y^2}\\) bounded by \\(z = H\\), what is the upper limit for the polar angle \\(\\phi\\) in spherical coordinates?',
            options: {
                a: '\\(\\pi/6\\)',
                b: '\\(\\pi/4\\)',
                c: '\\(\\pi/3\\)',
                d: '\\(\\pi/2\\)'
            },
            correct: 'b',
            explanation: 'The cone equation \\(z = \\sqrt{x^2+y^2}\\) translates in spherical coordinates to \\(\\rho\\cos\\phi = \\rho\\sin\\phi\\). Simplifying gives \\(\\tan\\phi = 1\\), which yields the angle \\(\\phi = \\pi/4\\) as the bounding cone shell.'
        },
        {
            id: 'po8',
            q: 'If a solid has a constant density \\(\\delta(x,y,z) = k\\) over a region \\(V\\), what is the relationship between its mass \\(M\\) and its volume \\(V_0\\)?',
            options: {
                a: '\\(M = k + V_0\\)',
                b: '\\(M = k \\cdot V_0\\)',
                c: '\\(M = V_0 / k\\)',
                d: '\\(M = k^2 \\cdot V_0\\)'
            },
            correct: 'b',
            explanation: 'With a constant density, the mass integral becomes: \\(M = \\iiint_V k \\, dV = k \\iiint_V dV = k \\cdot \\text{Volume}(V) = k \\cdot V_0\\).'
        },
        {
            id: 'po9',
            q: 'For the order of integration \\(\\int_0^1 \\int_0^{1-x} \\int_0^{1-x-y} dz \\, dy \\, dx\\), what is the corresponding region of integration?',
            options: {
                a: 'A unit sphere in the positive octant',
                b: 'A unit cylinder in the positive octant',
                c: 'A unit tetrahedron in the positive octant',
                d: 'A unit box'
            },
            correct: 'c',
            explanation: 'The boundary equations are \\(z = 1-x-y\\) (the plane \\(x+y+z=1\\)), \\(y = 1-x\\) (the line \\(x+y=1\\)), and \\(x=1\\), all bounded below by the coordinate planes. This forms a tetrahedron of unit intercepts in the positive octant.'
        },
        {
            id: 'po10',
            q: 'Which of the following triple integrals computes the moment of inertia about the z-axis (\\(I_z\\)) of a solid with density \\(\\delta(x,y,z)\\)?',
            options: {
                a: '\\(\\iiint_V z^2 \\delta \\, dV\\)',
                b: '\\(\\iiint_V (x^2 + y^2) \\delta \\, dV\\)',
                c: '\\(\\iiint_V (x^2 + y^2 + z^2) \\delta \\, dV\\)',
                d: '\\(\\iiint_V (x+y) \\delta \\, dV\\)'
            },
            correct: 'b',
            explanation: 'The moment of inertia \\(I_z\\) measures resistance to rotation about the z-axis, which is the sum of mass elements weighted by the square of their radial distance \\(r^2 = x^2+y^2\\) from the z-axis: \\(I_z = \\iiint_V (x^2+y^2)\\delta \\, dV\\).'
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
