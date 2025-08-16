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
        this.currentPlayer = {
            teamName: '',
            playerNumber: '',
            playerName: '',
            date: '',
            atBatNumber: 1
        };
        this.roster = [];
        this.currentRosterIndex = 0;
        
        this.initializeEventListeners();
        this.initializeNavigation();
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

        // Initialize collapsible sections
        this.initializeCollapsibleSections();
    }

    initializeNavigation() {
        // Setup page navigation
        document.getElementById('startTracking').addEventListener('click', () => this.startTracking());
        document.getElementById('viewHistoryOnly').addEventListener('click', () => this.viewHistoryOnly());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Roster management
        document.getElementById('addPlayer').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerNumber').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });

        // Quick add buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.quickAddPlayers(e.target.dataset.range));
        });

        // Roster navigation
        document.getElementById('prevPlayer').addEventListener('click', () => this.previousPlayer());
        document.getElementById('nextPlayer').addEventListener('click', () => this.nextPlayer());

        // Form change listeners
        document.getElementById('teamName').addEventListener('input', () => this.updateStartButton());
        document.getElementById('atBatDate').addEventListener('change', () => this.updateStartButton());

        // Previous teams functionality
        document.getElementById('loadPreviousTeam').addEventListener('click', () => this.showPreviousTeamsPage());
        document.getElementById('backToSetupFromTeams').addEventListener('click', () => this.backToSetupFromTeams());

        // Demo data functionality
        document.getElementById('createDemoData').addEventListener('click', () => this.createDemoData());
    }

    startTracking() {
        // Validate required fields
        const teamName = document.getElementById('teamName').value.trim();
        const date = document.getElementById('atBatDate').value;

        if (!teamName || !date) {
            alert('Please fill in team name and date.');
            return;
        }

        if (this.roster.length === 0) {
            alert('Please add at least one player to the roster.');
            return;
        }

        // Set team info
        this.currentPlayer.teamName = teamName;
        this.currentPlayer.date = date;
        
        // Start with first player in roster
        this.currentRosterIndex = 0;
        this.setCurrentPlayer();
        
        // Show roster navigation
        document.getElementById('rosterNav').style.display = 'block';
        this.updateRosterNavigation();
        
        // Navigate to app page with tracking tab active
        this.showPage('appPage');
        this.switchTab('tracking');
    }

    viewHistoryOnly() {
        // Hide roster navigation
        document.getElementById('rosterNav').style.display = 'none';
        
        // Navigate to app page with history tab active
        this.showPage('appPage');
        this.switchTab('history');
        
        // Clear current player info since we're just viewing history
        document.getElementById('currentPlayer').innerHTML = 'Viewing All History';
    }

    backToSetup() {
        // Hide roster navigation
        document.getElementById('rosterNav').style.display = 'none';
        this.showPage('setupPage');
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        document.getElementById(pageId).classList.add('active');
    }

    showPreviousTeamsPage() {
        this.showPage('previousTeamsPage');
        this.displayPreviousTeams();
    }

    backToSetupFromTeams() {
        this.showPage('setupPage');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        if (tabName === 'tracking') {
            document.getElementById('trackingTab').classList.add('active');
        } else if (tabName === 'history') {
            document.getElementById('historyTab').classList.add('active');
            // Refresh history when switching to history tab
            this.updateDisplay();
        }
    }

    updateCurrentPlayerDisplay() {
        const playerName = this.currentPlayer.playerName ? ` (${this.currentPlayer.playerName})` : '';
        const playerInfo = `${this.currentPlayer.teamName} - Player #${this.currentPlayer.playerNumber}${playerName} - ${this.formatDate(this.currentPlayer.date)} - At-Bat #${this.currentPlayer.atBatNumber}`;
        document.getElementById('currentPlayer').innerHTML = playerInfo;
    }

    // Previous Teams Management Functions
    displayPreviousTeams() {
        const teamsList = document.getElementById('teamsList');
        const teams = this.getPreviousTeams();
        
        if (teams.length === 0) {
            teamsList.innerHTML = `
                <div class="no-teams-container">
                    <p class="no-teams">No previous teams found. Create a new team to get started.</p>
                    <div class="no-teams-actions">
                        <button class="action-btn primary" onclick="pitchTracker.backToSetupFromTeams()">← Back to Setup</button>
                        <p class="no-teams-hint">Use the "Create Demo Data" button on the setup page to test this feature</p>
                    </div>
                </div>
            `;
            return;
        }

        let teamsHtml = '';
        teams.forEach(team => {
            const teamStats = this.getTeamStats(team.name);
            teamsHtml += `
                <div class="team-card" data-team="${team.name}">
                    <div class="team-header">
                        <div class="team-name">${team.name}</div>
                        <div class="team-stats">${teamStats.totalPlayers} players, ${teamStats.totalAtBats} at-bats</div>
                    </div>
                    <div class="team-details">
                        <div class="detail-item">
                            <div class="detail-label">Last Used</div>
                            <div class="detail-value">${this.formatDate(team.lastUsed)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Total Sessions</div>
                            <div class="detail-value">${teamStats.totalSessions}</div>
                        </div>
                    </div>
                    <div class="team-actions">
                        <button class="load-roster-btn" onclick="pitchTracker.loadTeamRoster('${team.name}')">Load Roster</button>
                    </div>
                </div>
            `;
        });
        
        teamsList.innerHTML = teamsHtml;
    }

    getPreviousTeams() {
        const teams = new Map();
        
        // Extract team information from pitch data
        Object.keys(this.pitchData).forEach(playerKey => {
            const [teamName, playerNumber] = this.parsePlayerKey(playerKey);
            const playerData = this.pitchData[playerKey];
            
            if (!teams.has(teamName)) {
                teams.set(teamName, {
                    name: teamName,
                    lastUsed: '',
                    totalPlayers: 0,
                    totalAtBats: 0
                });
            }
            
            const team = teams.get(teamName);
            team.totalPlayers++;
            
            // Find the most recent date for this team
            playerData.forEach(atBat => {
                Object.keys(atBat).forEach(dateKey => {
                    const [date, atBatNum] = dateKey.split('_');
                    const formattedDate = this.formatDateForStorage(date);
                    if (!team.lastUsed || formattedDate > team.lastUsed) {
                        team.lastUsed = formattedDate;
                    }
                    team.totalAtBats++;
                });
            });
        });
        
        // Convert to array and sort by last used date (most recent first)
        return Array.from(teams.values()).sort((a, b) => {
            if (!a.lastUsed && !b.lastUsed) return 0;
            if (!a.lastUsed) return 1;
            if (!b.lastUsed) return -1;
            return new Date(b.lastUsed) - new Date(a.lastUsed);
        });
    }

    getTeamStats(teamName) {
        let totalPlayers = 0;
        let totalAtBats = 0;
        let totalSessions = 0;
        const sessions = new Set();
        
        Object.keys(this.pitchData).forEach(playerKey => {
            const [currentTeamName, playerNumber] = this.parsePlayerKey(playerKey);
            
            if (currentTeamName === teamName) {
                totalPlayers++;
                const playerData = this.pitchData[playerKey];
                
                playerData.forEach(atBat => {
                    Object.keys(atBat).forEach(dateKey => {
                        const [date, atBatNum] = dateKey.split('_');
                        sessions.add(date);
                        totalAtBats++;
                    });
                });
            }
        });
        
        totalSessions = sessions.size;
        
        return {
            totalPlayers,
            totalAtBats,
            totalSessions
        };
    }

    loadTeamRoster(teamName) {
        // Extract roster from existing data
        const roster = [];
        const playerNames = new Map();
        
        Object.keys(this.pitchData).forEach(playerKey => {
            const [currentTeamName, playerNumber] = this.parsePlayerKey(playerKey);
            
            if (currentTeamName === teamName) {
                // Try to find player names from the data
                const playerData = this.pitchData[playerKey];
                let playerName = '';
                
                // Look for player names in the data structure
                if (playerData.length > 0 && playerData[0].playerName) {
                    playerName = playerData[0].playerName;
                }
                
                roster.push({
                    number: playerNumber,
                    name: playerName,
                    atBatNumber: 1,
                    completed: false
                });
            }
        });
        
        if (roster.length === 0) {
            alert('No roster data found for this team.');
            return;
        }
        
        // Sort roster by player number
        roster.sort((a, b) => {
            const numA = parseInt(a.number.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.number.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });
        
        // Load the roster into the current session
        this.roster = roster;
        this.currentPlayer.teamName = teamName;
        
        // Update the display
        this.updateRosterDisplay();
        
        // Go back to setup page
        this.showPage('setupPage');
        
        // Show success message
        const teamNameInput = document.getElementById('teamName');
        teamNameInput.value = teamName;
        teamNameInput.focus();
        
        // Ensure date is set if it's not already
        const dateInput = document.getElementById('atBatDate');
        if (!dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Update the start button after all fields are populated
        this.updateStartButton();
        
        // Highlight the loaded roster
        setTimeout(() => {
            const rosterList = document.getElementById('rosterList');
            rosterList.style.backgroundColor = '#e6fffa';
            rosterList.style.border = '2px solid #38b2ac';
            setTimeout(() => {
                rosterList.style.backgroundColor = '';
                rosterList.style.border = '';
            }, 2000);
        }, 100);
        
        // Show success notification
        this.showNotification(`Successfully loaded ${roster.length} players from ${teamName}!`, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#38b2ac' : type === 'error' ? '#e53e3e' : '#3182ce'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            style.appendChild(document.createTextNode(`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `));
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Demo data creation for testing
    createDemoData() {
        if (Object.keys(this.pitchData).length > 0) {
            return; // Don't overwrite existing data
        }

        // Create sample data for testing
        this.pitchData = {
            "Elevate 10U_3": [
                {"20241201_1": [["four-seam", 6, "strike"], ["curve", 7, "strike"], ["four-seam", 9, "strike"]]},
                {"20241201_2": [["changeup", 4, "ball"], ["slider", 9, "hit"]]}
            ],
            "Elevate 10U_7": [
                {"20241201_1": [["two-seam", 5, "strike"], ["cutter", 8, "ball"], ["four-seam", 6, "strike"]]}
            ],
            "Elevate 10U_12": [
                {"20241201_1": [["curve", 3, "ball"], ["four-seam", 6, "strike"], ["changeup", 7, "strike"]]}
            ],
            "Thunder 12U_5": [
                {"20241115_1": [["four-seam", 6, "strike"], ["slider", 9, "strike"]]},
                {"20241115_2": [["changeup", 4, "ball"], ["curve", 7, "hit"]]}
            ],
            "Thunder 12U_8": [
                {"20241115_1": [["two-seam", 5, "strike"], ["cutter", 8, "strike"]]}
            ]
        };

        this.saveData();
        this.showNotification('Demo data created for testing!', 'info');
    }

    formatDateForStorage(dateString) {
        // Convert date string to ISO format for proper sorting
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${year}-${month}-${day}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Roster Management Functions
    addPlayer() {
        const playerNumber = document.getElementById('playerNumber').value.trim();
        const playerName = document.getElementById('playerName').value.trim();

        if (!playerNumber) {
            alert('Please enter a player number.');
            return;
        }

        // Check for duplicate player numbers
        if (this.roster.some(player => player.number === playerNumber)) {
            alert('Player number already exists in roster.');
            return;
        }

        // Add player to roster
        this.roster.push({
            number: playerNumber,
            name: playerName || '',
            atBatNumber: 1,
            completed: false
        });

        // Clear inputs
        document.getElementById('playerNumber').value = '';
        document.getElementById('playerName').value = '';

        // Update display
        this.updateRosterDisplay();
        this.updateStartButton();
    }

    removePlayer(playerNumber) {
        this.roster = this.roster.filter(player => player.number !== playerNumber);
        this.updateRosterDisplay();
        this.updateStartButton();
    }

    quickAddPlayers(range) {
        const [start, end] = range.split('-').map(num => parseInt(num));
        
        for (let i = start; i <= end; i++) {
            const playerNumber = i.toString();
            
            // Skip if player already exists
            if (!this.roster.some(player => player.number === playerNumber)) {
                this.roster.push({
                    number: playerNumber,
                    name: '',
                    atBatNumber: 1,
                    completed: false
                });
            }
        }

        this.updateRosterDisplay();
        this.updateStartButton();
    }

    updateRosterDisplay() {
        const rosterList = document.getElementById('rosterList');
        
        if (this.roster.length === 0) {
            rosterList.innerHTML = '<p class="empty-roster">No players added yet. Add players to start tracking.</p>';
            return;
        }

        // Sort roster by player number
        const sortedRoster = [...this.roster].sort((a, b) => {
            const numA = parseInt(a.number.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.number.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });

        rosterList.innerHTML = sortedRoster.map(player => `
            <div class="player-card">
                <div>
                    <span class="player-info">#${player.number}</span>
                    ${player.name ? `<span class="player-name">${player.name}</span>` : ''}
                </div>
                <button class="remove-player" onclick="pitchTracker.removePlayer('${player.number}')">Remove</button>
            </div>
        `).join('');
    }

    updateStartButton() {
        const startBtn = document.getElementById('startTracking');
        const hasPlayers = this.roster.length > 0;
        const hasTeamName = document.getElementById('teamName').value.trim() !== '';
        const hasDate = document.getElementById('atBatDate').value !== '';
        
        startBtn.disabled = !(hasPlayers && hasTeamName && hasDate);
        startBtn.textContent = hasPlayers ? `Start Tracking (${this.roster.length} players)` : 'Start Tracking Roster';
    }

    // Roster Navigation Functions
    setCurrentPlayer() {
        if (this.roster.length === 0) return;
        
        const player = this.roster[this.currentRosterIndex];
        this.currentPlayer.playerNumber = player.number;
        this.currentPlayer.playerName = player.name;
        this.currentPlayer.atBatNumber = player.atBatNumber;
        
        this.updateCurrentPlayerDisplay();
    }

    previousPlayer() {
        if (this.roster.length === 0) return;
        
        // Save current player's at-bat number
        this.roster[this.currentRosterIndex].atBatNumber = this.currentPlayer.atBatNumber;
        
        // Cycle to previous player (or to last if at beginning)
        this.currentRosterIndex = (this.currentRosterIndex - 1 + this.roster.length) % this.roster.length;
        
        this.setCurrentPlayer();
        this.updateRosterNavigation();
        this.clearSequence();
    }

    nextPlayer() {
        if (this.roster.length === 0) return;
        
        // Save current player's at-bat number
        this.roster[this.currentRosterIndex].atBatNumber = this.currentPlayer.atBatNumber;
        
        // Cycle to next player (or back to first if at end)
        this.currentRosterIndex = (this.currentRosterIndex + 1) % this.roster.length;
        
        this.setCurrentPlayer();
        this.updateRosterNavigation();
        this.clearSequence();
    }

    updateRosterNavigation() {
        const prevBtn = document.getElementById('prevPlayer');
        const nextBtn = document.getElementById('nextPlayer');
        const progressSpan = document.getElementById('rosterProgress');
        const queueDiv = document.getElementById('rosterQueue');

        // Navigation buttons are never disabled in cyclical mode
        prevBtn.disabled = false;
        nextBtn.disabled = false;

        // Update progress with cyclical indicator
        const totalCompleted = this.roster.filter(p => p.completed).length;
        progressSpan.textContent = `Player ${this.currentRosterIndex + 1} of ${this.roster.length} (${totalCompleted} completed)`;

        // Update queue display
        queueDiv.innerHTML = this.roster.map((player, index) => {
            let className = 'queue-player';
            if (index === this.currentRosterIndex) {
                className += ' current';
            } else if (player.completed) {
                className += ' completed';
            }
            
            return `<span class="${className}">#${player.number}</span>`;
        }).join('');
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
        
        // Handle both numeric and text-based locations
        if (['UP', 'LEFT', 'RIGHT', 'DOWN'].includes(location)) {
            this.currentPitch.location = location;
        } else {
            this.currentPitch.location = parseInt(location);
        }
        
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
            const locationDisplay = typeof location === 'string' ? location : `Zone ${location}`;
            return `<span class="pitch-item" style="background-color: ${resultColor}">
                ${index + 1}. ${this.formatPitchType(type)} → ${locationDisplay} → ${result.toUpperCase()}
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

        if (!this.currentPlayer.teamName || !this.currentPlayer.playerNumber || !this.currentPlayer.date) {
            alert('Player information is missing. Please return to setup.');
            return;
        }

        // Create player key
        const playerKey = `${this.currentPlayer.teamName.replace(/\s+/g, '_')}_${this.currentPlayer.playerNumber}`;
        
        // Create at-bat key
        const dateKey = this.currentPlayer.date.replace(/-/g, '');
        const atBatKey = `${dateKey}_${this.currentPlayer.atBatNumber}`;

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

        // Auto-advance to next player or stay on current
        this.handlePostAtBatNavigation();

        alert('At-bat recorded successfully!');
    }

    incrementAtBatNumber() {
        this.currentPlayer.atBatNumber++;
        
        // Update roster with new at-bat number
        if (this.roster.length > 0) {
            this.roster[this.currentRosterIndex].atBatNumber = this.currentPlayer.atBatNumber;
        }
        
        this.updateCurrentPlayerDisplay();
    }

    handlePostAtBatNavigation() {
        if (this.roster.length === 0) return;

        // Mark current player as having completed at least one at-bat
        this.roster[this.currentRosterIndex].completed = true;

        // In cyclical mode, there's always a "next" player
        if (this.roster.length > 1) {
            const currentPlayerName = this.currentPlayer.playerNumber + (this.currentPlayer.playerName ? ` (${this.currentPlayer.playerName})` : '');
            
            // Get next player (cycling back to first if at end)
            const nextPlayerIndex = (this.currentRosterIndex + 1) % this.roster.length;
            const nextPlayer = this.roster[nextPlayerIndex];
            const nextPlayerName = nextPlayer.number + (nextPlayer.name ? ` (${nextPlayer.name})` : '');
            
            // Indicate if we're cycling back to the beginning
            const cyclingBack = nextPlayerIndex === 0 && this.currentRosterIndex === this.roster.length - 1;
            const cyclicNote = cyclingBack ? ' (back to top of order)' : '';
            
            const moveToNext = confirm(
                `At-bat complete for Player #${currentPlayerName}!\n\n` +
                `Continue with:\n` +
                `• Same Player (${currentPlayerName}) - Click "Cancel"\n` +
                `• Next Player (${nextPlayerName})${cyclicNote} - Click "OK"`
            );

            if (moveToNext) {
                this.nextPlayer();
            }
        }

        this.updateRosterNavigation();
    }

    clearSequence() {
        this.currentSequence = [];
        this.clearCurrentPitch();
        this.updateCurrentSequenceDisplay();
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
        statsHtml += '<div class="collapsible-section">';
        statsHtml += '<div class="collapsible-header" style="cursor: pointer; user-select: none; padding: 0.5rem; background: #e2e8f0; border-radius: 4px; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">';
        statsHtml += '<strong>Location-Based Pitch Effectiveness</strong>';
        statsHtml += '<span class="expand-icon" style="font-size: 1.2rem; transition: transform 0.3s ease;">▼</span>';
        statsHtml += '</div>';
        statsHtml += '<div class="collapsible-content" style="display: none; overflow: hidden;">';
        
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
        
        statsHtml += '</div>'; // Close collapsible-content
        statsHtml += '</div>'; // Close collapsible-section
        statsHtml += '</div>'; // Close pitch-stats
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

    initializeCollapsibleSections() {
        // Use event delegation for dynamically generated content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.collapsible-header')) {
                const header = e.target.closest('.collapsible-header');
                const section = header.closest('.collapsible-section');
                const content = section.querySelector('.collapsible-content');
                const expandIcon = header.querySelector('.expand-icon');
                
                // Toggle the expanded state
                const isExpanded = section.classList.contains('expanded');
                if (isExpanded) {
                    section.classList.remove('expanded');
                    expandIcon.textContent = '▼';
                } else {
                    section.classList.add('expanded');
                    expandIcon.textContent = '▲';
                }
            }
        });
    }
}

// Initialize the app when DOM is loaded
let pitchTracker;
document.addEventListener('DOMContentLoaded', () => {
    pitchTracker = new PitchTracker();
});
