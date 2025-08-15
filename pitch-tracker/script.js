// Pitch Tracker JavaScript

class PitchTracker {
    constructor() {
        this.currentPitch = {
            type: null,
            location: null,
            result: null
        };
        this.currentSequence = [];
        this.pitchData = this.loadData();
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.setDefaultDate();
    }

    initializeEventListeners() {
        // Pitch type buttons with mobile optimization
        document.querySelectorAll('.pitch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectPitchType(e.target.dataset.pitch));
            // Prevent double-tap zoom on mobile
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectPitchType(e.target.dataset.pitch);
            });
        });

        // Zone location buttons with mobile optimization
        document.querySelectorAll('.zone-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectLocation(e.target.dataset.location));
            // Prevent double-tap zoom on mobile
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectLocation(e.target.dataset.location);
            });
        });

        // Result buttons with mobile optimization
        document.querySelectorAll('.result-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectResult(e.target.dataset.result));
            // Prevent double-tap zoom on mobile
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectResult(e.target.dataset.result);
            });
        });

        // Action buttons with mobile optimization
        const addPitchBtn = document.getElementById('addPitch');
        addPitchBtn.addEventListener('click', () => this.addPitch());
        addPitchBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.addPitch();
        });

        const finishAtBatBtn = document.getElementById('finishAtBat');
        finishAtBatBtn.addEventListener('click', () => this.finishAtBat());
        finishAtBatBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.finishAtBat();
        });

        const clearSequenceBtn = document.getElementById('clearSequence');
        clearSequenceBtn.addEventListener('click', () => this.clearSequence());
        clearSequenceBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.clearSequence();
        });

        const clearHistoryBtn = document.getElementById('clearHistory');
        clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        clearHistoryBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.clearHistory();
        });

        // Search functionality
        document.getElementById('searchPlayer').addEventListener('input', (e) => this.filterHistory(e.target.value));

        // Auto-increment at-bat number when date changes
        document.getElementById('atBatDate').addEventListener('change', () => this.updateAtBatNumber());

        // Mobile-specific optimizations
        this.initializeMobileOptimizations();
    }

    initializeMobileOptimizations() {
        // Prevent zoom on input focus for iOS
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                // Temporarily disable zoom
                const viewport = document.querySelector('meta[name=viewport]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            });
            
            input.addEventListener('blur', (e) => {
                // Re-enable zoom
                const viewport = document.querySelector('meta[name=viewport]');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
            });
        });

        // Add visual feedback for touch interactions
        document.querySelectorAll('.pitch-btn, .zone-btn, .result-btn, .action-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                btn.style.transform = 'scale(0.95)';
                btn.style.transition = 'transform 0.1s ease';
            });
            
            btn.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    btn.style.transform = '';
                    btn.style.transition = '';
                }, 100);
            });
        });

        // Improve scroll behavior on mobile
        if ('scrollBehavior' in document.documentElement.style) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('atBatDate').value = today;
    }

    selectPitchType(pitchType) {
        // Clear previous selection
        document.querySelectorAll('.pitch-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Select new pitch type
        document.querySelector(`[data-pitch="${pitchType}"]`).classList.add('selected');
        this.currentPitch.type = pitchType;
        this.updateAddButton();
    }

    selectLocation(location) {
        // Clear previous selection
        document.querySelectorAll('.zone-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Select new location
        document.querySelector(`[data-location="${location}"]`).classList.add('selected');
        this.currentPitch.location = parseInt(location);
        this.updateAddButton();
    }

    selectResult(result) {
        // Clear previous selection
        document.querySelectorAll('.result-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Select new result
        document.querySelector(`[data-result="${result}"]`).classList.add('selected');
        this.currentPitch.result = result;
        this.updateAddButton();
    }

    updateAddButton() {
        const addBtn = document.getElementById('addPitch');
        const isComplete = this.currentPitch.type && this.currentPitch.location && this.currentPitch.result;
        addBtn.disabled = !isComplete;
    }

    addPitch() {
        if (!this.currentPitch.type || !this.currentPitch.location || !this.currentPitch.result) {
            alert('Please select pitch type, location, and result before adding.');
            return;
        }

        // Add pitch to current sequence
        this.currentSequence.push([
            this.currentPitch.type,
            this.currentPitch.location,
            this.currentPitch.result
        ]);

        // Clear current selection
        this.clearCurrentPitch();
        this.updateCurrentSequenceDisplay();
    }

    clearCurrentPitch() {
        this.currentPitch = { type: null, location: null, result: null };
        
        // Clear UI selections
        document.querySelectorAll('.pitch-btn, .zone-btn, .result-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.updateAddButton();
    }

    updateCurrentSequenceDisplay() {
        const sequenceDiv = document.getElementById('currentSequence');
        
        if (this.currentSequence.length === 0) {
            sequenceDiv.innerHTML = '<p>Pitch sequence will appear here...</p>';
            return;
        }

        const sequenceHtml = this.currentSequence.map((pitch, index) => {
            const [type, location, result] = pitch;
            const resultColor = this.getResultColor(result);
            return `<span class="pitch-item" style="background-color: ${resultColor}">
                ${index + 1}. ${this.formatPitchType(type)} → Zone ${location} → ${result.toUpperCase()}
            </span>`;
        }).join('');

        sequenceDiv.innerHTML = sequenceHtml;
    }

    getResultColor(result) {
        switch (result) {
            case 'strike': return '#e53e3e';
            case 'ball': return '#3182ce';
            case 'hit': return '#38a169';
            default: return '#667eea';
        }
    }

    formatPitchType(type) {
        const pitchNames = {
            'four-seam': '4-Seam',
            'two-seam': '2-Seam',
            'curve': 'Curve',
            'changeup': 'Change',
            'cutter': 'Cutter',
            'slider': 'Slider'
        };
        return pitchNames[type] || type;
    }

    finishAtBat() {
        if (this.currentSequence.length === 0) {
            alert('No pitches recorded for this at-bat.');
            return;
        }

        const teamName = document.getElementById('teamName').value.trim();
        const playerNumber = document.getElementById('playerNumber').value.trim();
        const atBatDate = document.getElementById('atBatDate').value;
        const atBatNumber = document.getElementById('atBatNumber').value;

        if (!teamName || !playerNumber || !atBatDate) {
            alert('Please fill in team name, player number, and date.');
            return;
        }

        // Create player key
        const playerKey = `${teamName.replace(/\s+/g, '_')}_${playerNumber}`;
        
        // Create at-bat key
        const dateKey = atBatDate.replace(/-/g, '');
        const atBatKey = `${dateKey}_${atBatNumber}`;

        // Initialize player data if doesn't exist
        if (!this.pitchData[playerKey]) {
            this.pitchData[playerKey] = [];
        }

        // Add at-bat data
        const atBatData = {};
        atBatData[atBatKey] = [...this.currentSequence];
        this.pitchData[playerKey].push(atBatData);

        // Save data
        this.saveData();

        // Clear current sequence and increment at-bat number
        this.clearSequence();
        this.incrementAtBatNumber();

        // Update display
        this.updateDisplay();

        alert('At-bat recorded successfully!');
    }

    clearSequence() {
        this.currentSequence = [];
        this.clearCurrentPitch();
        this.updateCurrentSequenceDisplay();
    }

    incrementAtBatNumber() {
        const atBatInput = document.getElementById('atBatNumber');
        atBatInput.value = parseInt(atBatInput.value) + 1;
    }

    updateAtBatNumber() {
        // Reset at-bat number to 1 when date changes
        document.getElementById('atBatNumber').value = 1;
    }

    loadData() {
        const saved = localStorage.getItem('pitchTrackerData');
        return saved ? JSON.parse(saved) : {};
    }

    saveData() {
        localStorage.setItem('pitchTrackerData', JSON.stringify(this.pitchData));
    }

    updateDisplay() {
        this.displayHistory();
    }

    displayHistory(filterText = '') {
        const historyDiv = document.getElementById('historyDisplay');
        
        if (Object.keys(this.pitchData).length === 0) {
            historyDiv.innerHTML = '<p>No pitch history available. Start tracking pitches!</p>';
            return;
        }

        // Group players by team
        const teamGroups = {};
        Object.keys(this.pitchData).forEach(playerKey => {
            if (filterText && !playerKey.toLowerCase().includes(filterText.toLowerCase())) {
                return;
            }

            const [teamName, playerNumber] = this.parsePlayerKey(playerKey);
            
            if (!teamGroups[teamName]) {
                teamGroups[teamName] = [];
            }
            
            teamGroups[teamName].push({
                playerKey,
                playerNumber,
                playerData: this.pitchData[playerKey]
            });
        });

        // Sort teams alphabetically and players by number within each team
        const sortedTeams = Object.keys(teamGroups).sort();
        
        let historyHtml = '';
        
        sortedTeams.forEach(teamName => {
            const players = teamGroups[teamName].sort((a, b) => {
                // Extract numeric part for proper sorting (e.g., #3 vs #10)
                const numA = parseInt(a.playerNumber.replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt(b.playerNumber.replace(/[^0-9]/g, '')) || 0;
                return numA - numB;
            });

            historyHtml += `
                <div class="team-group">
                    <div class="team-header">🏆 ${teamName}</div>
                    <div class="team-players">
            `;

            players.forEach(({ playerNumber, playerData }) => {
                historyHtml += `
                    <div class="player-history">
                        <div class="player-header">Player ${playerNumber}</div>
                        ${this.generatePlayerStats(playerData)}
                        ${this.generateAtBatHistory(playerData)}
                    </div>
                `;
            });

            historyHtml += `
                    </div>
                </div>
            `;
        });

        if (historyHtml === '') {
            historyDiv.innerHTML = '<p>No players found matching your search.</p>';
        } else {
            historyDiv.innerHTML = historyHtml;
        }
    }

    parsePlayerKey(playerKey) {
        const parts = playerKey.split('_');
        const playerNumber = parts.pop();
        const teamName = parts.join(' ');
        return [teamName, playerNumber];
    }

    generatePlayerStats(playerData) {
        const allPitches = [];
        playerData.forEach(atBat => {
            Object.values(atBat).forEach(sequence => {
                allPitches.push(...sequence);
            });
        });

        if (allPitches.length === 0) return '';

        // Calculate location-based pitch effectiveness
        const locationStats = {};
        allPitches.forEach(([type, location, result]) => {
            if (!locationStats[type]) {
                locationStats[type] = {};
            }
            if (!locationStats[type][location]) {
                locationStats[type][location] = { total: 0, strikes: 0, balls: 0, hits: 0 };
            }
            locationStats[type][location].total++;
            locationStats[type][location][result]++;
        });

        let statsHtml = '<div class="pitch-stats" style="margin-bottom: 1rem; padding: 1rem; background: #f0f4ff; border-radius: 6px;">';
        statsHtml += '<strong>Location-Based Pitch Effectiveness:</strong><br>';
        
        // Display effectiveness by pitch type and location
        Object.keys(locationStats).sort().forEach(pitchType => {
            const locations = locationStats[pitchType];
            statsHtml += `<div style="margin: 0.75rem 0; padding: 0.5rem; background: white; border-radius: 4px; border-left: 3px solid #667eea;">`;
            statsHtml += `<strong>${this.formatPitchType(pitchType)}:</strong><br>`;
            
            // Find most and least effective zones
            const zoneEffectiveness = Object.keys(locations).map(zone => {
                const stats = locations[zone];
                const successRate = ((stats.strikes / stats.total) * 100);
                const hitRate = ((stats.hits / stats.total) * 100);
                // Effectiveness = high strikes, low hits
                const effectiveness = successRate - (hitRate * 1.5); // Weight hits more heavily
                return { zone: parseInt(zone), effectiveness, stats, successRate, hitRate };
            }).sort((a, b) => b.effectiveness - a.effectiveness);

            // Show best and worst zones
            if (zoneEffectiveness.length > 0) {
                const best = zoneEffectiveness[0];
                const worst = zoneEffectiveness[zoneEffectiveness.length - 1];
                
                statsHtml += `<span style="color: #38a169; font-weight: 500;">✓ Best Zone ${best.zone}: ${best.successRate.toFixed(0)}% strikes, ${best.hitRate.toFixed(0)}% hits (${best.stats.total} pitches)</span><br>`;
                
                if (zoneEffectiveness.length > 1) {
                    statsHtml += `<span style="color: #e53e3e; font-weight: 500;">⚠ Worst Zone ${worst.zone}: ${worst.successRate.toFixed(0)}% strikes, ${worst.hitRate.toFixed(0)}% hits (${worst.stats.total} pitches)</span><br>`;
                }
                
                // Show all zones with 2+ pitches
                const significantZones = zoneEffectiveness.filter(z => z.stats.total >= 2);
                if (significantZones.length > 2) {
                    statsHtml += `<details style="margin-top: 0.25rem;"><summary style="cursor: pointer; font-size: 0.85rem; color: #4a5568;">View all zones</summary>`;
                    significantZones.forEach(zone => {
                        const { zone: zoneNum, stats, successRate, hitRate } = zone;
                        statsHtml += `<span style="font-size: 0.8rem; margin-right: 12px; color: #4a5568;">Zone ${zoneNum}: ${successRate.toFixed(0)}%S/${hitRate.toFixed(0)}%H (${stats.total})</span>`;
                    });
                    statsHtml += `</details>`;
                }
            }
            
            statsHtml += `</div>`;
        });
        
        // Overall summary
        const totalPitches = allPitches.length;
        const totalStrikes = allPitches.filter(([,, result]) => result === 'strike').length;
        const totalHits = allPitches.filter(([,, result]) => result === 'hit').length;
        
        statsHtml += `<div style="margin-top: 0.75rem; padding: 0.5rem; background: #e6fffa; border-radius: 4px; border-left: 3px solid #38a169;">`;
        statsHtml += `<strong>Overall:</strong> ${((totalStrikes / totalPitches) * 100).toFixed(1)}% strikes, ${((totalHits / totalPitches) * 100).toFixed(1)}% hits (${totalPitches} total pitches)`;
        statsHtml += `</div>`;
        
        statsHtml += '</div>';
        return statsHtml;
    }

    generateAtBatHistory(playerData) {
        return playerData.map(atBat => {
            const atBatKey = Object.keys(atBat)[0];
            const sequence = atBat[atBatKey];
            const [date, atBatNum] = this.parseAtBatKey(atBatKey);
            
            return `
                <div class="atbat-history">
                    <div class="atbat-header">${date} - At-Bat #${atBatNum}</div>
                    <div class="pitch-sequence">
                        ${sequence.map((pitch, index) => {
                            const [type, location, result] = pitch;
                            const resultColor = this.getResultColor(result);
                            return `<span class="sequence-pitch" style="background-color: ${resultColor}">
                                ${index + 1}. ${this.formatPitchType(type)} → ${location} → ${result}
                            </span>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    parseAtBatKey(atBatKey) {
        const [dateStr, atBatNum] = atBatKey.split('_');
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const formattedDate = `${month}/${day}/${year}`;
        return [formattedDate, atBatNum];
    }

    filterHistory(filterText) {
        this.displayHistory(filterText);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all pitch history? This cannot be undone.')) {
            this.pitchData = {};
            this.saveData();
            this.updateDisplay();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PitchTracker();
});
