define(function(require) {
    var Stage = require('src/js/app/Stage.js');
    var stage1 = new Stage('stage1.html');
    var $ = require('jquery');

    stage1.initEvents = function() {
        $('.door').on('click', function() {
            stage1.moveToDoor();
        });
    };

    stage1.moveToDoor = function() {
        var stage_content = {
                taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
                letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        }; 
        var word = null; /* DELETE AFTER|\!!!!*/
        if (!word) {
            $('.man').animate({'left' : '750'}, 2000, function() {
                stage1.getTmpl('popup.html');
                $('.popup').append('<button class="item gun"> </button>');
                stage1.getTmpl('task1.html','.popup', stage_content);
                $('.item.gun').on('click', sendDnDWord);

                return false;  /* what for ???/*/
            });
        } else {
            //localStorage.setItem('active', JSON.stringify(activeItems));
            //next();
        }

        function sendDnDWord(event) {
            $('#stage1Popup1').remove();
            $('.popupWrap').remove();

            $('.door').css('opacity','1');
            $('.totalLevel').css({'display': 'block', 'opacity' : '1'});
            var myVar = setInterval(function() { 
                /*remove leafes*/
                if($('.leafes')) $('.leafes').remove();
                /*flashing box border animation*/
                $('.totalLevel').animate({'opacity': '1'}, 400, function() { $('.totalLevel').animate({'opacity' : '0'},400); } );
            }, 830);
            $('.totalLevel').on('click', function() {
                clearInterval(myVar);
                moveToBox();
            });
            $('.gun').removeClass('noItem').addClass('activeItem');
            //activeItems.push('.gun');
        }

        function moveToBox() {
            $('.popupWrap').remove();/*!!!*/
            $('.man').animate({'left' : '450'}, 1000, function() {
                $('.totalLevel').remove();
                getTemplate('popup.html');
                $('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>'); /* set sizes*/
                $('.popup').append('<button class="item battery"></button>');  
                wade.init('flow.js');
                $('.popup').on('click',closePopup);  
            });
        }
        function closePopup(event) {
            $('.popupWrap').remove();
            $('.totalLevel').css({'opacity':'1'});
            $('.batteries').removeClass('noItem').addClass('activeItem');
            activeItems.push('.batteries'); 
        }
       
    };
   return stage1;
});