$(function() {

	var data = {
		labels: ['HTML', 'CSS', 'Javascript', 'Python', 'Django', 'Mysql', 'XML'],
		datasets: [{
			fillColor: 'rgba(0, 163, 207, 0.5)',
			strokeColor: 'rgba(0, 163, 207, 1);',
			data: [80, 80, 75, 60, 50, 50, 60]
		}]
	};

	var skillsCanvas = $('#skills').get(0),
		ctx = skillsCanvas.getContext('2d');

	// skillsCanvas.width = window.screen.width;

	new Chart(ctx).Bar(data, {
		animationEasing: 'easeOutBounce',
		responsive: true,
		scaleLabel: '<%=value + "%"%>',
		tooltipTemplate: '<%if (label){%><%=label%>: <%}%><%= value + "%" %>'
	});
});
