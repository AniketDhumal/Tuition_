document.addEventListener('DOMContentLoaded', function () {
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    function applyDarkMode() {
        body.classList.add('dark-mode');
        sunIcon.classList.add('d-none');
        moonIcon.classList.remove('d-none');
        localStorage.setItem('theme', 'dark-mode');
    }

    function applyLightMode() {
        body.classList.remove('dark-mode');
        moonIcon.classList.add('d-none');
        sunIcon.classList.remove('d-none');
        localStorage.setItem('theme', 'light-mode');
    }

    toggleButton.addEventListener('click', function () {
        if (body.classList.contains('dark-mode')) {
            applyLightMode();
        } else {
            applyDarkMode();
        }
        updateLabelColors();
        updateQuestionLegendColors();
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        applyDarkMode();
    }

    const progressCtx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(progressCtx, {
        type: 'bar',
        data: {
            labels: ['Math', 'Science', 'English'],
            datasets: [{
                label: 'Progress (%)',
                data: [80, 65, 90],
                backgroundColor: ['#b71c1c', '#2e7d32', '#0288d1'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'black' // Default color
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'black' // Default color
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14,
                            weight: 'bold',
                            color: 'black' // Default color
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#333333',
                    titleColor: 'white',
                    bodyColor: '#ffffff'
                }
            }
        }
    });

    function updateLabelColors() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const labelColor = isDarkMode ? '#ffffff' : '#000000';

        progressChart.options.scales.x.ticks.color = labelColor;
        progressChart.options.scales.y.ticks.color = labelColor;
        progressChart.options.plugins.legend.labels.color = labelColor;

        progressChart.update();
    }

    const questionCtx = document.getElementById('questionChart').getContext('2d');
    const questionChart = new Chart(questionCtx, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Wrong', 'Unattempted'],
            datasets: [{
                label: 'Question Analysis',
                data: [40, 10, 5],
                backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Arial, sans-serif',
                            size: 14,
                            weight: 'bold',
                            color: 'black' // Default color
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#333333',
                    titleColor: 'white',
                    bodyColor: '#ffffff'
                }
            }
        }
    });

    function updateQuestionLegendColors() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const labelColor = isDarkMode ? '#ffffff' : '#000000';

        questionChart.options.plugins.legend.labels.color = labelColor;
        questionChart.update();
    }

    updateLabelColors();
    updateQuestionLegendColors();

    document.getElementById('fab').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('sidebar-expanded');
        document.getElementById('mainContent').classList.toggle('active-main');
    });
});
