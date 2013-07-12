(function() {
  'use strict'

  var sportsDataPromise

  $(function() {
    var svg,
        w = 960,
        h = 450,
        radius = Math.min(w, h) / 2

    function init() {
      bindDataToSlider('.timeline', drawElements)
      createSvg()
    }

    function createSvg() {
      svg = d3.select("#chart").append("svg")
        .attr("width", w)
        .attr("height", h)
      svg = svg.append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")

      svg.append('text')
        .attr('class', 'football-percentage')
    }

    function drawElements(dataset) {
      var pie = d3.layout.pie().sort(null)
      var passingInfo = dataset.homeStats.passingLeaders
      if (!passingInfo || !passingInfo.length) {
        return
      }

      var data = [passingInfo[0].passAttempts - passingInfo[0].passCompletions, passingInfo[0].passCompletions]
      var colors = ['#DF151A', '#00DA3C']


      var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20)

      var arcs = svg.selectAll('.arc')
      var g = arcs.data(pie(data))
        .enter().append('g')
          .attr('class', 'arc')

      g.append('path')
        .attr('fill', function(d, i) { return colors[i] })
        .attr('d', arc)

      g.append('text')
        .attr('class', 'football-text')
        .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')' })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function(d, i) {
          return '' + d.data + ' ' + ((i == 0) ? 'failures' : 'completions')
        })

      // handle data changing, not new data coming in
      var transition = arcs.transition()
      transition.select('path')
        .attr('d', arc)
      transition.select('text')
        .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')' })
        .style('text-anchor', 'middle')
        .text(function(d, i) {
          return '' + d.data + ' ' + ((i == 0) ? 'failures' : 'completions')
        })

      svg.select('.football-percentage')
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text('' + getCompletionPercentage(data) + '%')
    }

    init()
  })

  function getCompletionPercentage(data) {
    var total = data[0] + data[1]
    var completions = data[1]
    var percentage = Math.round((completions / total) * 100)
    return percentage
  }

  function getSportsDataPromise() {
    if (sportsDataPromise) {
      return sportsDataPromise
    }
    sportsDataPromise = $.getJSON('/football_plays.json')
    return sportsDataPromise
  }

  function bindDataToSlider(sliderClass, handler) {
    var datasetPromise = getSportsDataPromise()
    datasetPromise.done(function(data) {
      var $slider = $(sliderClass)
      $slider.attr('min', 0).attr('max', data.length - 1)
      $slider.change(function() {
        var index = $(this).val()
        handler(data[index])
      })
    })
  }
})();
