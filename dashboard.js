/* =========================================================
   QMA — Dashboard Logic (dashboard.js)
   ========================================================= */

// ─── Unit Definitions ────────────────────────────────────
const UNITS = {
    LENGTH: [{ v: 'FEET', l: 'Feet (ft)' },
    { v: 'INCH', l: 'Inch (in)' },
    { v: 'YARD', l: 'Yard (yd)' },
    { v: 'CENTIMETER', l: 'Centimeter (cm)' }],
    WEIGHT: [{ v: 'KILOGRAM', l: 'Kilogram (kg)' },
    { v: 'GRAM', l: 'Gram (g)' },
    { v: 'POUND', l: 'Pound (lb)' }],
    VOLUME: [{ v: 'LITER', l: 'Liter (L)' },
    { v: 'MILLILITER', l: 'Milliliter (mL)' },
    { v: 'GALLON', l: 'Gallon (gal)' }],
    TEMPERATURE: [{ v: 'CELSIUS', l: 'Celsius (°C)' },
    { v: 'FAHRENHEIT', l: 'Fahrenheit (°F)' }]
};

// Temperature only allows these ops
const TEMP_OPS = new Set(['COMPARE', 'CONVERT']);

// ─── State ───────────────────────────────────────────────
let currentOp = 'ADD';
let activeHistoryOp = 'ADD';

// ─── Unit Population ─────────────────────────────────────
function populateUnits(cat) {
    const units = UNITS[cat] || [];
    ['unit1', 'unit2', 'targetUnitSelect'].forEach(id => {
        const sel = document.getElementById(id);
        sel.innerHTML = '';
        units.forEach(u => {
            const o = document.createElement('option');
            o.value = u.v;
            o.textContent = u.l;
            sel.appendChild(o);
        });
    });
    // Make default target unit different from source
    const tgt = document.getElementById('targetUnitSelect');
    if (tgt.options.length > 1) tgt.selectedIndex = 1;
}

// ─── Op Switching ─────────────────────────────────────────
function switchOp(op) {
    currentOp = op;
    document.querySelectorAll('.op-tab').forEach(t => t.classList.toggle('active', t.dataset.op === op));
    document.getElementById('value2Group').style.display = op === 'CONVERT' ? 'none' : 'flex';
    document.getElementById('targetUnitGroup').style.display = op === 'CONVERT' ? 'flex' : 'none';
    hideResult();
}

function applyTempLock() {
    const isTemp = document.getElementById('measureType').value === 'TEMPERATURE';
    document.getElementById('tempWarning').classList.toggle('show', isTemp);
    document.querySelectorAll('.op-tab').forEach(tab => {
        tab.disabled = isTemp && !TEMP_OPS.has(tab.dataset.op);
    });
    if (isTemp && !TEMP_OPS.has(currentOp)) switchOp('COMPARE');
}

// ─── Build Payload ────────────────────────────────────────
function buildPayload(op, cat, v1, u1, v2, u2, targetUnit) {
    const q1 = { value: parseFloat(v1), unit: u1, measurementType: cat, operation: op };
    const q2 = op === 'CONVERT'
        ? { value: parseFloat(v1), unit: u1, measurementType: cat, operation: op } // dummy for convert
        : { value: parseFloat(v2), unit: u2, measurementType: cat, operation: op };
    const payload = { quantity1: q1, quantity2: q2 };
    if (op === 'CONVERT') payload.targetUnit = targetUnit;
    return payload;
}

// ─── Parse Result String ──────────────────────────────────
// Backend returns strings like "Quantity(12.5, FEET)" or "true"/"false"
function parseResult(raw = '') {
    const m = raw.match(/Quantity\(([^,]+),\s*([^)]+)\)/);
    if (m) return { value: m[1].trim(), unit: m[2].trim() };
    return { value: raw, unit: '' };
}

// ─── Calculate ────────────────────────────────────────────
async function handleCalculate() {
    const cat = document.getElementById('measureType').value;
    const v1 = document.getElementById('value1').value.trim();
    const v2 = document.getElementById('value2').value.trim();
    const u1 = document.getElementById('unit1').value;
    const u2 = document.getElementById('unit2').value;
    const tgt = document.getElementById('targetUnitSelect').value;
    const c1 = document.getElementById('combo1');
    const c2 = document.getElementById('combo2');

    c1.classList.remove('error-shake');
    c2.classList.remove('error-shake');
    void c1.offsetWidth; void c2.offsetWidth; // force reflow

    let err = false;
    if (!v1) { c1.classList.add('error-shake'); err = true; }
    if (currentOp !== 'CONVERT' && !v2) { c2.classList.add('error-shake'); err = true; }
    if (err) return;

    setBtn('calculateBtn', true);
    try {
        const payload = buildPayload(currentOp, cat, v1, u1, v2, u2, tgt);
        const endpoint = `/qma-service/api/v1/quantities/${currentOp.toLowerCase()}`;
        const data = await api(endpoint, 'POST', payload);

        if (data.errorMessage) { toast(data.errorMessage, 'warn'); return; }
        renderResult(data);
    } catch (e) {
        toast(e.message, 'error');
    } finally {
        setBtn('calculateBtn', false, '<i class="ph ph-calculator"></i> Calculate');
    }
}

// ─── Render Result ────────────────────────────────────────
function renderResult(dto) {
    const { value, unit } = parseResult(dto.result || '');
    const isCompare = currentOp === 'COMPARE';

    const labels = { ADD: 'Sum', SUBTRACT: 'Difference', DIVIDE: 'Quotient', COMPARE: 'Comparison', CONVERT: 'Converted Value' };
    const symbols = { ADD: '+', SUBTRACT: '−', DIVIDE: '÷', COMPARE: '≟', CONVERT: '→' };

    document.getElementById('resultLabel').textContent = labels[currentOp] || 'Result';

    if (isCompare) {
        const equal = dto.result === 'true';
        document.getElementById('resultValue').textContent = equal ? '✓ Equal' : '✗ Not Equal';
        document.getElementById('resultUnitDisplay').textContent = '';
        document.getElementById('resultSub').textContent = `${dto.operand1}  ${symbols.COMPARE}  ${dto.operand2}`;
        document.getElementById('resultIcon').className = `ph-fill ${equal ? 'ph-check-circle' : 'ph-x-circle'} result-icon`;
        document.getElementById('resultIcon').style.color = equal ? 'var(--success-color)' : 'var(--warn-color)';
    } else {
        document.getElementById('resultValue').textContent = value;
        document.getElementById('resultUnitDisplay').textContent = unit;
        document.getElementById('resultSub').textContent =
            `${dto.operand1}  ${symbols[currentOp] || ''}  ${dto.operand2 === '−' ? '' : dto.operand2}`;
        document.getElementById('resultIcon').className = 'ph-fill ph-check-circle result-icon';
        document.getElementById('resultIcon').style.color = 'var(--success-color)';
    }

    document.getElementById('resultPanel').classList.add('show');
}

function hideResult() {
    document.getElementById('resultPanel').classList.remove('show');
}

// ─── History ──────────────────────────────────────────────
async function loadHistory(op) {
    const wrap = document.getElementById('historyTableWrap');
    wrap.innerHTML = '<div class="empty-history"><span class="spinner"></span></div>';
    try {
        const rows = await api(`/qma-service/api/v1/quantities/history/${op}`, 'GET');
        if (!rows.length) {
            wrap.innerHTML = `<div class="empty-history">No history found for <strong>${op}</strong>.</div>`;
            return;
        }
        wrap.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Operation</th>
                        <th>Operand 1</th>
                        <th>Operand 2</th>
                        <th>Result</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td><span class="badge badge-${(r.operation || '').toLowerCase()}">${r.operation}</span></td>
                            <td>${r.operand1 || '—'}</td>
                            <td>${r.operand2 === '-' ? '—' : r.operand2 || '—'}</td>
                            <td>${r.result || '—'}</td>
                            <td>${r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    } catch (e) {
        wrap.innerHTML = `<div class="empty-history" style="color:var(--error-color)">${e.message}</div>`;
    }
}

// ─── Navigation ───────────────────────────────────────────
function showPage(page) {
    const isDash = page === 'dashboard';
    document.getElementById('calculatorView').style.display = isDash ? 'flex' : 'none';
    document.getElementById('historyView').style.display = isDash ? 'none' : 'block';
    document.getElementById('navDashboard').classList.toggle('active', isDash);
    document.getElementById('navHistory').classList.toggle('active', !isDash);
    document.getElementById('pageTitle').textContent = isDash ? 'Measurement Engine' : 'Operation History';
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Check OAuth callback from Google redirect first
    const wasOAuth = await checkOAuthCallback();
    if (wasOAuth) return;

    // Populate header — show user info if logged in, otherwise show guest state
    const { token, name, email } = getSession();
    const isLoggedIn = !!token;
    document.getElementById('headerUserName').textContent = isLoggedIn ? name : 'Guest';
    document.getElementById('headerUserEmail').textContent = isLoggedIn ? email : 'Not signed in';
    document.getElementById('headerAvatar').textContent = isLoggedIn ? name.charAt(0).toUpperCase() : '?';

    // Theme
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        window.location.href = 'index.html';
    });

    // Nav
    document.getElementById('navDashboard').addEventListener('click', () => showPage('dashboard'));
    document.getElementById('navHistory').addEventListener('click', () => {
        if (!isLoggedIn) {
            toast('Please log in to view history.', 'warn');
            setTimeout(() => { window.location.href = 'index.html'; }, 1200);
            return;
        }
        showPage('history');
        loadHistory(activeHistoryOp);
    });

    // Op tabs
    document.querySelectorAll('.op-tab').forEach(tab => {
        tab.addEventListener('click', () => { if (!tab.disabled) switchOp(tab.dataset.op); });
    });

    // Category change
    document.getElementById('measureType').addEventListener('change', e => {
        populateUnits(e.target.value);
        applyTempLock();
        hideResult();
    });

    // Hide result on any input change
    ['value1', 'value2', 'unit1', 'unit2', 'targetUnitSelect'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', hideResult);
    });

    // Calculate
    document.getElementById('calculateBtn').addEventListener('click', handleCalculate);

    // History filter buttons
    document.querySelectorAll('.history-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.history-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeHistoryOp = btn.dataset.op;
            loadHistory(activeHistoryOp);
        });
    });

    // Init units & op
    populateUnits('LENGTH');
    switchOp('ADD');
});
