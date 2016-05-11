define([], function() {
    var timer = 0,
        interval = {},
        isPaused = false;

    function startTimer() {
        interval = setInterval(function () {
            timer += 100;
        }, 100);
    }

    function stopTimer() {
        clearInterval(interval);
    }

    function updateTimer() {

        return $.ajax({
                url: '/updateTimer',
                method: 'PUT',
                contentType: "application/json",
                data: JSON.stringify({timeSpent : timer })
            })
            .done(function(data) {

            })
            .fail(function(err) {
                console.log(err)
            });

    }

    function getTimer() {
        return $.ajax({
                url: '/getTimer',
                method: 'GET'
            })
            .done(function(data) {
                if (data && data.timeSpent && parseInt(data.timeSpent) ) {
                    timer = parseInt(data.timeSpent);
                }
            })
            .fail(function(err) {
                console.log(err)
            });
    }

    function pauseMode() {
        var pauseBtn = document.createElement('button'),
            btnName = '';
            pauseBtn.id = 'pauseBtn';
        pauseBtn.addEventListener('click', function() {
            //pauseGame();
            var div,
                blockId = 'coverBlock';

            if ( !isPaused ) {
                div = document.createElement('div');
                div.id = blockId;
                div.style.position = 'fixed';
                div.style.top = 0;
                div.style.left = 0;
                div.style.zIndex = '9998';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.background = '#ccc';
                div.style.opacity = '.3';
                document.body.appendChild(div);
                stopTimer();
                isPaused = true;
                $('body').addClass('disabledScene');
                $('#pauseBtn').addClass('play')
            } else {
                $('#pauseBtn').removeClass('play');
                div = document.getElementById(blockId);
                div.parentNode.removeChild(div);
                isPaused = false;
                $('body').removeClass('disabledScene')
                startTimer();
            }
        });
        pauseBtn.style.position = 'fixed';
        pauseBtn.style.top = 0;
        pauseBtn.style.right = 0;
        pauseBtn.style.zIndex = '9999';
        
        
        document.body.appendChild(pauseBtn);

    }

    return {
        startTimer: startTimer,
        stopTimer: stopTimer,
        updateTimer: updateTimer,
        getTimer: getTimer,
        pauseMode: pauseMode
    }
});