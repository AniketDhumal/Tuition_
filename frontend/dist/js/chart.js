const ctx = document.getElementById('chartCanvas').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Monthly Sales ($)',
            data: [1200, 1500, 1800, 2100, 2500, 3000],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: true
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            enabled: true
        },
        hover: {
            onHover: function(event, elements) {
                event.target.style.cursor = elements.length ? 'pointer' : 'default';
            }
        }
    }
});

gsap.from(myChart.data.datasets[0].data, {
    duration: 2,
    value: 0,
    onUpdate: function() {
        myChart.update();
    }
});
