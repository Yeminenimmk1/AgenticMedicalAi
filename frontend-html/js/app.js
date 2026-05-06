document.addEventListener('DOMContentLoaded', () => {

    // ── Authentication Guard ─────────────────────────────────────────
    const activeUser = localStorage.getItem('auth_username');
    if (!activeUser) {
        window.location.href = 'login.html';
        return;
    }

    // ── Element Refs (null-safe) ─────────────────────────────────────
    const form         = document.getElementById('triage-form');
    const submitBtn    = document.getElementById('submit-btn');
    const resultCard   = document.getElementById('result-card');
    const loadingState = document.getElementById('loading-state');
    const finalState   = document.getElementById('final-state');
    const diagnosisText  = document.getElementById('diagnosis-text');
    const confidenceText = document.getElementById('confidence-text');
    const confidenceFill = document.getElementById('confidence-fill');
    const reasoningText  = document.getElementById('reasoning-text');
    const emergencyBadge   = document.getElementById('emergency-badge');
    const escalationBanner = document.getElementById('escalation-banner');
    const dtEmptyText    = document.getElementById('dt-empty-text');
    const dtOverallScore = document.getElementById('dt-overall-score');

    let dtChartInstance = null;
    // Store last diagnosisId for dispatch modal
    window._lastDiagnosisId = null;

    // ── GUARD: if triage form not on this page, exit early ──────────
    if (!form) return;

    // ── Triage Form Submit ────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const symptoms = document.getElementById('symptoms').value.trim();
        const currentUser = localStorage.getItem('auth_username');

        if (!symptoms) {
            showError('Please describe your symptoms before submitting.');
            return;
        }
        if (!currentUser) {
            alert('Session expired. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        showLoading();

        try {
            const triageRes = await fetch('http://localhost:8081/api/v1/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentUser,
                    symptoms,
                    currentGlucose:       parseInt(document.getElementById('vit-glucose')?.value) || null,
                    currentBloodPressure: parseInt(document.getElementById('vit-bp')?.value)      || null,
                    currentBmi:           parseFloat(document.getElementById('vit-bmi')?.value)   || null
                })
            });

            if (!triageRes.ok) {
                const errData = await triageRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Triage failed with status: ' + triageRes.status);
            }

            const data = await triageRes.json();

            // Store diagnosisId for Doctor Dispatch
            window._lastDiagnosisId = data.diagnosisId || null;

            updateDigitalTwin({
                diabetes: data.diabetesRiskScore  || 0,
                heart:    data.heartRiskScore     || 0,
                overall:  data.overallHealthScore || 100
            });

            showResults(data);

        } catch (error) {
            console.error('Triage error:', error);
            hideLoading();
            showError('AI Triage failed: ' + error.message);
        }
    });

    // ── UI State Helpers ─────────────────────────────────────────────
    function showLoading() {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AI Medical Board Analyzing...';
        }
        if (resultCard) {
            resultCard.classList.remove('hidden');
            resultCard.classList.add('flex');
        }
        if (loadingState) loadingState.classList.remove('hidden');
        if (finalState) finalState.classList.add('hidden');

        if (dtChartInstance) { dtChartInstance.destroy(); dtChartInstance = null; }
        if (dtEmptyText) { dtEmptyText.classList.remove('hidden'); dtEmptyText.innerText = 'Calculating risks...'; }
        if (dtOverallScore) dtOverallScore.classList.add('hidden');
    }

    function hideLoading() {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-stethoscope text-xl animate-pulse"></i> INITIATE AI TRIAGE SEQUENCE';
        }
    }

    function showError(msg) {
        hideLoading();
        if (resultCard) { resultCard.classList.remove('hidden'); resultCard.classList.add('flex'); }
        if (loadingState) loadingState.classList.add('hidden');
        if (finalState) {
            finalState.classList.remove('hidden');
            if (diagnosisText) diagnosisText.innerText = 'Error';
            if (reasoningText) reasoningText.innerText = msg;
            if (confidenceText) confidenceText.innerText = '0%';
        }
    }

    function showResults(data) {
        hideLoading();
        if (loadingState) loadingState.classList.add('hidden');
        if (finalState)   finalState.classList.remove('hidden');

        if (diagnosisText) diagnosisText.innerText  = data.finalDiagnosis || 'Unknown';
        if (reasoningText) reasoningText.innerText  = data.reasoning      || '';
        if (confidenceText) confidenceText.innerText = (data.confidenceScore || 0) + '%';
        if (confidenceFill) updateRiskBar(confidenceFill, null, data.confidenceScore || 0, true);

        // Emergency styling
        if (data.isEmergency) {
            resultCard && resultCard.classList.add('emergency-pulse');
            emergencyBadge && emergencyBadge.classList.remove('hidden');
        } else {
            resultCard && resultCard.classList.remove('emergency-pulse');
            emergencyBadge && emergencyBadge.classList.add('hidden');
        }

        if (data.autoEscalated) {
            escalationBanner && escalationBanner.classList.remove('hidden');
        } else {
            escalationBanner && escalationBanner.classList.add('hidden');
        }
    }

    // ── Digital Twin Chart ───────────────────────────────────────────
    function updateDigitalTwin(dtRisks) {
        if (dtEmptyText) dtEmptyText.classList.add('hidden');
        if (dtOverallScore) {
            dtOverallScore.classList.remove('hidden');
            dtOverallScore.innerText = dtRisks.overall.toFixed(1) + '% Health';
            dtOverallScore.className = dtRisks.overall > 70
                ? 'text-2xl font-bold text-teal-400'
                : dtRisks.overall > 40
                    ? 'text-2xl font-bold text-amber-400'
                    : 'text-2xl font-bold text-red-500';
        }

        const canvas = document.getElementById('digitalTwinChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (dtChartInstance) dtChartInstance.destroy();

        dtChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Diabetes Risk', 'Heart Risk', 'Overall Health'],
                datasets: [{
                    data: [dtRisks.diabetes, dtRisks.heart, dtRisks.overall],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(45, 212, 191, 0.8)'
                    ],
                    borderColor: ['#ef4444', '#f97316', '#2dd4bf'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#2dd4bf',
                        bodyColor: '#f8fafc',
                        padding: 10,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: ctx => ctx.label + ': ' + ctx.parsed.r.toFixed(1) + '%'
                        }
                    }
                }
            }
        });
    }

    function updateRiskBar(elFill, elTxt, percentage, isConfidence = false) {
        setTimeout(() => {
            if (!elFill) return;
            elFill.style.width = percentage + '%';
            if (elTxt) elTxt.innerText = percentage.toFixed(1) + '%';
            elFill.className = 'risk-fill';
            if (isConfidence) {
                elFill.classList.add(percentage > 80 ? 'risk-safe' : percentage > 60 ? 'risk-warn' : 'risk-danger');
            } else {
                elFill.classList.add(percentage > 60 ? 'risk-danger' : percentage > 30 ? 'risk-warn' : 'risk-safe');
            }
        }, 100);
    }
});
