// Display username from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser && currentUser.name){
        document.getElementById('topWelcome').textContent = "Welcome, " + currentUser.name;
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'home.html';
    });

    // Profile Elements
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileView = document.getElementById('profileView');
const profileEdit = document.getElementById('profileEdit');

// Load profile data on start
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
});

function loadProfileData() {
    // We store profile data per user email to keep it unique
    const userEmail = currentUser ? currentUser.email : 'guest';
    const profileData = JSON.parse(localStorage.getItem(`profile_${userEmail}`)) || {};

    // Update Display
    document.getElementById('displayAge').textContent = profileData.age || '--';
    document.getElementById('displayWeight').textContent = profileData.weight || '--';
    document.getElementById('displayHeight').textContent = profileData.height || '--';
    document.getElementById('displayGoal').textContent = profileData.goal || '--';
    document.getElementById('displayGender').textContent = profileData.gender || '--';

    // Update Inputs
    document.getElementById('inputAge').value = profileData.age || '';
    document.getElementById('inputWeight').value = profileData.weight || '';
    document.getElementById('inputHeight').value = profileData.height || '';
    document.getElementById('inputGoal').value = profileData.goal || '';
    document.getElementById('inputGender').value = profileData.gender || '';

    // Load weekly steps from steps.html storage
    let totalSteps = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stepsKey = `steps_${userEmail}_${dateStr}`;
        totalSteps += parseInt(localStorage.getItem(stepsKey) || 0);
    }
    document.getElementById('steps').textContent = totalSteps.toLocaleString();

    // Load weekly water from water.html storage
    let totalWater = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const waterKey = `water_${userEmail}_${dateStr}`;
        totalWater += parseFloat(localStorage.getItem(waterKey) || 0);
    }
    document.getElementById('water').textContent = totalWater.toFixed(1) + ' L';
}

editProfileBtn.addEventListener('click', () => {
    const isEditing = profileEdit.style.display === 'none';
    profileEdit.style.display = isEditing ? 'grid' : 'none';
    profileView.style.display = isEditing ? 'none' : 'grid';
    editProfileBtn.textContent = isEditing ? 'Cancel' : 'Edit';
});

saveProfileBtn.addEventListener('click', () => {
    const userEmail = currentUser ? currentUser.email : 'guest';
    
    const updatedData = {
        age: document.getElementById('inputAge').value,
        gender: document.getElementById('inputGender').value,
        weight: document.getElementById('inputWeight').value,
        height: document.getElementById('inputHeight').value,
        goal: document.getElementById('inputGoal').value
    };

    // Save to localStorage
    localStorage.setItem(`profile_${userEmail}`, JSON.stringify(updatedData));
    
    // Refresh view
    loadProfileData();
    
    // Switch back to view mode
    profileEdit.style.display = 'none';
    profileView.style.display = 'grid';
    editProfileBtn.textContent = 'Edit';
});

let healthChart;

function initChart() {
    const ctx = document.getElementById('healthChart').getContext('2d');
    
    // Get actual data from localStorage for the last 7 days
    const userEmail = currentUser ? currentUser.email : 'guest';
    const dataLabels = [];
    const stepData = [];
    const waterData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        dataLabels.push(dayName);
        
        // Load steps
        const stepsKey = `steps_${userEmail}_${dateStr}`;
        const steps = parseInt(localStorage.getItem(stepsKey) || 0);
        stepData.push(steps);
        
        // Load water
        const waterKey = `water_${userEmail}_${dateStr}`;
        const water = parseFloat(localStorage.getItem(waterKey) || 0);
        waterData.push(water);
    }

    healthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataLabels,
            datasets: [{
                label: 'Steps Walked',
                data: stepData,
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#00b894'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Handle switching data (Steps/Water/Sleep)
document.getElementById('chartFilter').addEventListener('change', (e) => {
    const type = e.target.value;
    const userEmail = currentUser ? currentUser.email : 'guest';
    let newData, newLabel, newColor;

    if(type === 'steps') {
        newData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const stepsKey = `steps_${userEmail}_${dateStr}`;
            const steps = parseInt(localStorage.getItem(stepsKey) || 0);
            newData.push(steps);
        }
        newLabel = 'Steps Walked';
        newColor = '#00b894';
    } else if (type === 'water') {
        newData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const waterKey = `water_${userEmail}_${dateStr}`;
            const water = parseFloat(localStorage.getItem(waterKey) || 0);
            newData.push(water);
        }
        newLabel = 'Liters of Water';
        newColor = '#00d2d3';
    } else {
        newData = [7, 6.5, 8, 7.5, 6, 9, 8.5];
        newLabel = 'Hours Slept';
        newColor = '#a29bfe';
    }

    healthChart.data.datasets[0].data = newData;
    healthChart.data.datasets[0].label = newLabel;
    healthChart.data.datasets[0].borderColor = newColor;
    healthChart.data.datasets[0].pointBackgroundColor = newColor;
    healthChart.update();
});

// Call initChart on page load
document.addEventListener('DOMContentLoaded', initChart);

// Set active sidebar link based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Remove active class from all links
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to the link matching current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

function loadProfileData() {
    const userEmail = currentUser ? currentUser.email : 'guest';
    const profileData = JSON.parse(localStorage.getItem(`profile_${userEmail}`)) || {};

    // 1. Update Profile Display (Age, Weight, etc.)
    document.getElementById('displayAge').textContent = profileData.age || '--';
    document.getElementById('displayGender').textContent = profileData.gender || '--';
    document.getElementById('displayWeight').textContent = profileData.weight || '--';
    document.getElementById('displayHeight').textContent = profileData.height || '--';
    document.getElementById('displayGoal').textContent = profileData.goal || '--';

    // 2. Calculate Recommendations
    if (profileData.weight && profileData.height && profileData.age) {
        // Show the entire section (Heading + Row)
        document.getElementById('recommendationsSection').style.display = 'block';

        // --- RECOMMENDED STEPS (Based on Age) ---
        const age = parseInt(profileData.age);
        let recommendedSteps = 10000;
        if (age < 18) recommendedSteps = 12000;
        else if (age > 65) recommendedSteps = 7000;
        document.getElementById('recSteps').textContent = recommendedSteps.toLocaleString() + " / day";

        // --- WATER (33ml per kg) ---
        const waterCalc = (profileData.weight * 0.033).toFixed(1);
        document.getElementById('recWater').textContent = waterCalc + " Liters";

        // --- SLEEP ---
        let sleepRec = "7.5 - 9 Hours";
        if (age < 18) sleepRec = "8.5 - 10 Hours";
        if (age > 60) sleepRec = "7 - 8 Hours";
        document.getElementById('recSleep').textContent = sleepRec;

        // --- BMI STATUS ---
        const heightMeters = profileData.height / 100;
        const bmi = (profileData.weight / (heightMeters * heightMeters)).toFixed(1);
        let status = "";
        let color = "";

        if (bmi < 18.5) { status = "Underweight"; color = "#fab1a0"; }
        else if (bmi < 25) { status = "Healthy"; color = "#00b894"; }
        else if (bmi < 30) { status = "Overweight"; color = "#fdcb6e"; }
        else { status = "Obese"; color = "#ff7675"; }
        
        const weightEl = document.getElementById('recWeight');
        weightEl.textContent = `${bmi} (${status})`;
        weightEl.style.color = color;
    } else {
        // Hide if data is missing
        document.getElementById('recommendationsSection').style.display = 'none';
    }
}

function updateDailyOverview() {
    const today = new Date().toISOString().split('T')[0];
    const userEmail = currentUser ? currentUser.email : 'guest';
    
    // Display Current Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString(undefined, options);

    // 1. Steps Data
    const stepsSaved = localStorage.getItem(`steps_${userEmail}_${today}`) || 0;
    const profile = JSON.parse(localStorage.getItem(`profile_${userEmail}`)) || {};
    const stepGoal = profile.goal || 10000;
    
    document.getElementById('dailySteps').textContent = parseInt(stepsSaved).toLocaleString();
    const stepPerc = Math.min((stepsSaved / stepGoal) * 100, 100);
    document.getElementById('stepsBar').style.width = stepPerc + "%";
    document.getElementById('stepsRemaining').textContent = `Goal: ${stepGoal.toLocaleString()}`;

    // 2. Water Data
    const waterSaved = localStorage.getItem(`water_${userEmail}_${today}`) || 0;
    const waterTarget = (profile.weight * 0.033) || 2.5;
    
    document.getElementById('dailyWater').innerHTML = `${waterSaved} <span class="unit">L</span>`;
    const waterPerc = Math.min((waterSaved / waterTarget) * 100, 100);
    document.getElementById('waterBar').style.width = waterPerc + "%";
    document.getElementById('waterRemaining').textContent = `Target: ${waterTarget.toFixed(1)}L`;

    // 3. Sleep Data
    const sleepSaved = localStorage.getItem(`sleep_${userEmail}_${today}`) || 0;
    document.getElementById('dailySleep').innerHTML = `${sleepSaved} <span class="unit">hrs</span>`;
    const sleepPerc = Math.min((sleepSaved / 8) * 100, 100); // Default 8h
    document.getElementById('sleepBar').style.width = sleepPerc + "%";
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateDailyOverview);