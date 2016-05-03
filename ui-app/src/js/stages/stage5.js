define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage5 = new Stage('finalStageTmpl.html');
    var badge;
    var timerCtrl = require('src/js/timerController.js');

    stage5.initEvents = function() {
        stage5.setStage(5);
        $(hero).addClass('hideHero');
        loadFinalStage()
    };

    function loadFinalStage() {
        $.ajax({
              url: '/badge',
              method: 'GET'
          })
          .done(function(data) {
              badge = {
                src: data.badge.src,
                title: data.badge.title
              };
              stage5.getTmpl('userResultsTmpl','#stage5', badge);
        });
        timerCtrl.stopTimer();
        timerCtrl.updateTimer();
    }

    return stage5;
  });