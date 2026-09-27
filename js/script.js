function calculateOEE() {
        // Get Values
        const shiftLength = parseFloat(document.getElementById('shift-length').value) || 0;
        const plannedDowntime = parseFloat(document.getElementById('planned-downtime').value) || 0;
        const unplannedDowntime = parseFloat(document.getElementById('unplanned-downtime').value) || 0;
        
        const idealCycleTimeSec = parseFloat(document.getElementById('ideal-cycle-time').value) || 0;
        const totalParts = parseFloat(document.getElementById('total-parts').value) || 0;
        const defectiveParts = parseFloat(document.getElementById('defective-parts').value) || 0;

        // Calculations
        const plannedProductionTime = Math.max(0, shiftLength - plannedDowntime);
        const operatingTime = Math.max(0, plannedProductionTime - unplannedDowntime);
        const goodParts = Math.max(0, totalParts - defectiveParts);

        let availability = 0;
        if (plannedProductionTime > 0) {
            availability = operatingTime / plannedProductionTime;
        }

        let performance = 0;
        if (operatingTime > 0) {
            // Convert cycle time to minutes
            const idealCycleTimeMin = idealCycleTimeSec / 60;
            performance = (totalParts * idealCycleTimeMin) / operatingTime;
            // Cap at 1 (100%) for visual standard
            if (performance > 1) performance = 1;
        }

        let quality = 0;
        if (totalParts > 0) {
            quality = goodParts / totalParts;
        }

        // Final OEE
        const oee = availability * performance * quality;

        // Formatting
        const formatPct = (num) => (num * 100).toFixed(1) + '%';

        document.getElementById('val-availability').innerText = formatPct(availability);
        document.getElementById('val-performance').innerText = formatPct(performance);
        document.getElementById('val-quality').innerText = formatPct(quality);
        
        const oeeDisplay = document.getElementById('val-oee');
        oeeDisplay.innerText = formatPct(oee);

        // Interpretation
        const interp = document.getElementById('val-interpretation');
        const oeeCard = document.getElementById('oee-card');
        
        if (oee >= 0.85) {
            interp.innerText = "World Class 🌟";
            interp.style.color = "var(--world-class)";
            oeeDisplay.style.color = "var(--world-class)";
            oeeCard.style.borderColor = "var(--world-class)";
        } else if (oee >= 0.60) {
            interp.innerText = "Typical / Acceptable 📊";
            interp.style.color = "var(--typical)";
            oeeDisplay.style.color = "var(--typical)";
            oeeCard.style.borderColor = "var(--typical)";
        } else {
            interp.innerText = "Needs Improvement ⚠️";
            interp.style.color = "var(--low)";
            oeeDisplay.style.color = "var(--low)";
            oeeCard.style.borderColor = "var(--low)";
        }

        // Breakdown Population
        document.getElementById('calc-ppt').innerText = `${plannedProductionTime} mins`;
        document.getElementById('calc-ot').innerText = `${operatingTime} mins`;
        document.getElementById('calc-good').innerText = `${goodParts} parts`;
        
        document.getElementById('calc-a-formula').innerText = `${operatingTime} / ${plannedProductionTime}`;
        document.getElementById('calc-p-formula').innerText = `(${totalParts} * ${(idealCycleTimeSec/60).toFixed(4)}) / ${operatingTime}`;
        document.getElementById('calc-q-formula').innerText = `${goodParts} / ${totalParts}`;

        // Show results
        document.getElementById('results-section').classList.add('active');
        
        // Scroll slightly to results
        setTimeout(() => {
            document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }