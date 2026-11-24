const DEFAULTS = {
    'shift-length': 480, 'planned-downtime': 60, 'unplanned-downtime': 45,
    'ideal-cycle-time': 2.5, 'total-parts': 8000, 'defective-parts': 200
};

const num = id => Math.max(0, parseFloat(document.getElementById(id).value) || 0);
const fmt = (n, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = n => fmt(n * 100) + '%';

function setState(el, value) {
    el.classList.remove('ok', 'warn', 'bad');
    el.classList.add(value >= 0.85 ? 'ok' : value >= 0.60 ? 'warn' : 'bad');
}

function calculateOEE() {
    const shiftLength = num('shift-length');
    const plannedDowntime = num('planned-downtime');
    const unplannedDowntime = num('unplanned-downtime');
    const idealCycleTimeSec = num('ideal-cycle-time');
    const totalParts = num('total-parts');
    const defectiveParts = Math.min(num('defective-parts'), totalParts);

    // Hesap
    const plannedProductionTime = Math.max(0, shiftLength - plannedDowntime);
    const operatingTime = Math.max(0, plannedProductionTime - unplannedDowntime);
    const goodParts = Math.max(0, totalParts - defectiveParts);
    const idealCycleTimeMin = idealCycleTimeSec / 60;

    const availability = plannedProductionTime > 0 ? operatingTime / plannedProductionTime : 0;

    let performanceRaw = operatingTime > 0 ? (totalParts * idealCycleTimeMin) / operatingTime : 0;
    const performance = Math.min(1, performanceRaw);

    const quality = totalParts > 0 ? goodParts / totalParts : 0;
    const oee = availability * performance * quality;

    // Ana skor
    document.getElementById('val-oee').innerText = pct(oee);
    document.getElementById('val-availability').innerText = pct(availability);
    document.getElementById('val-performance').innerText = pct(performance);
    document.getElementById('val-quality').innerText = pct(quality);

    const interp = document.getElementById('val-interpretation');
    interp.classList.remove('ok', 'warn', 'bad');
    if (oee >= 0.85) { interp.innerText = 'World class'; interp.classList.add('ok'); }
    else if (oee >= 0.60) { interp.innerText = 'Typical'; interp.classList.add('warn'); }
    else { interp.innerText = 'Needs improvement'; interp.classList.add('bad'); }

    setState(document.getElementById('k-a'), availability);
    setState(document.getElementById('k-p'), performance);
    setState(document.getElementById('k-q'), quality);

    document.getElementById('perf-sub').innerText = performanceRaw > 1
        ? `Capped (raw ${pct(performanceRaw)}): check ideal cycle time`
        : 'Ideal time / run time';

    document.getElementById('bench-pin').style.left = Math.min(100, oee * 100) + '%';

    // Zaman kayıpları (vardiyanın payı)
    const productive = goodParts * idealCycleTimeMin;
    const qualityLoss = defectiveParts * idealCycleTimeMin;
    const speedLoss = Math.max(0, operatingTime - totalParts * idealCycleTimeMin);
    const segs = [
        { label: 'Fully productive', v: productive, c: 'var(--ok)' },
        { label: 'Quality loss', v: qualityLoss, c: 'var(--warn)' },
        { label: 'Speed loss', v: speedLoss, c: 'var(--c3)' },
        { label: 'Unplanned stops', v: Math.min(unplannedDowntime, plannedProductionTime), c: 'var(--red)' },
        { label: 'Planned stops', v: Math.min(plannedDowntime, shiftLength), c: 'var(--c4)' }
    ];
    const total = segs.reduce((s, x) => s + x.v, 0) || 1;
    document.getElementById('loss-bar').innerHTML = segs
        .map(s => `<div style="width:${(s.v / total) * 100}%;background:${s.c}" title="${s.label}: ${fmt(s.v)} min"></div>`).join('');
    document.getElementById('loss-legend').innerHTML = segs
        .map(s => `<div><i style="background:${s.c}"></i><span>${s.label}</span><b>${fmt(s.v)} min</b><em>${fmt((s.v / total) * 100)}%</em></div>`).join('');

    // Ayrıntı
    document.getElementById('calc-ppt').innerText = `${fmt(plannedProductionTime, 0)} min`;
    document.getElementById('calc-ot').innerText = `${fmt(operatingTime, 0)} min`;
    document.getElementById('calc-good').innerText = `${fmt(goodParts, 0)} pcs`;
    document.getElementById('calc-a-formula').innerText = `${fmt(operatingTime, 0)} / ${fmt(plannedProductionTime, 0)} = ${pct(availability)}`;
    document.getElementById('calc-p-formula').innerText = `(${fmt(totalParts, 0)} × ${idealCycleTimeMin.toFixed(4)}) / ${fmt(operatingTime, 0)} = ${pct(performanceRaw)}`;
    document.getElementById('calc-q-formula').innerText = `${fmt(goodParts, 0)} / ${fmt(totalParts, 0)} = ${pct(quality)}`;
}

function resetDefaults() {
    Object.entries(DEFAULTS).forEach(([id, v]) => document.getElementById(id).value = v);
    calculateOEE();
}

calculateOEE();
