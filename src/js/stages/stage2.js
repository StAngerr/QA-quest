 define(function (require) {
     var Stage = require('src/js/Stage.js');
     var stage2 = new Stage('stage2Tmpl.html');
     var $ = require('jquery');

     stage2.initEvents = function () {        
    /*turn off the light */
       // turnOffTheLight();
       // addFlashLightEvents();
    /*start to play cross-zero*/
        $('.field').on('click', function (event) {
            event.stopPropagation();
            yourChoice($(this).attr('id'));
        });
        $('.newGameB').on('click', playAgain);
        $('.oil').on('click', addOil);
     };

    stage2.finishStage = function() {
        removeFlashLightEvents();
        $('#mainSection').trigger('main:stageFinished');
    };

    function turnOffTheLight() {
         $('html').addClass('lightOff');
         $('body').addClass('flashLight');
         $('body').append('<div class="flashLightShadow"></div>');
     };
     /*    Move events to flash light*/
    function addFlashLightEvents() {
        $(document).mousemove(function (e) {
            $('body').css({
                '-webkit-clip-path': 'circle(100px at ' + e.pageX + 'px ' + e.pageY + 'px)'
            });
            $('.flashLightShadow').css({
                'top': (e.pageY - 100) + 'px',
                'left': (e.pageX + 102) + 'px'
            });
        });
    };

    function removeFlashLightEvents() {
        $(document).off('mousemove');
        $('html').removeClass('lightOff');
        $('body').removeClass('flashLight');
        $('.flashLightShadow').remove();
        $('body').css({'-webkit-clip-path': 'none'});
    };

     function removeFlashLightEvents() {
        $(document).off('mousemove');
        $('html').removeClass('lightOff');
        $('body').css({'-webkit-clip-path': 'none' });
        $('body').removeClass('flashLight');
        $('.flashLightShadow').remove();
     };


     /*functions and variables to play tictictoe game*/
    var x = "src/images/x.png";
    var oz = "src/images/o.png";
    var pause = 0;
    var all = 0;
    var a = 0;
    var b = 0;
    var c = 0;
    var d = 0;
    var e = 0;
    var f = 0;
    var g = 0;
    var h = 0;
    var i = 0;
    var j = 0;
    var k = 0;
    var l = 0;
    var m = 0;
    var n = 0;
    var o = 0;
    var p = 0;
    var temp = "";
    var ok = 0;
    var cf = 0;
    var choice = 16;
    var aRandomNumber = 0;
    var comp = 0;
    var t = 0;
    var wn = 0;
    var ls = 0;
    var ts = 0;
     // logic to know who is winner
     // 1 - X; 2 - 0; 3 - noone
    function logicOne() {
         if ((a == 1) && (b == 1) && (c == 1) && (d == 1)) all = 1;
         if ((a == 1) && (f == 1) && (k == 1) && (p == 1)) all = 1;
         if ((a == 1) && (e == 1) && (i == 1) && (m == 1)) all = 1;
         if ((b == 1) && (f == 1) && (j == 1) && (n == 1)) all = 1;
         if ((c == 1) && (g == 1) && (k == 1) && (o == 1)) all = 1;
         if ((d == 1) && (h == 1) && (l == 1) && (p == 1)) all = 1;
         if ((e == 1) && (f == 1) && (g == 1) && (h == 1)) all = 1;
         if ((g == 1) && (i == 1) && (k == 1) && (l == 1)) all = 1;
         if ((m == 1) && (n == 1) && (o == 1) && (p == 1)) all = 1;
         if ((m == 1) && (j == 1) && (g == 1) && (d == 1)) all = 1;
         //
         if ((a == 2) && (b == 2) && (c == 2) && (d == 2)) all = 2;
         if ((a == 2) && (f == 2) && (k == 2) && (p == 2)) all = 2;
         if ((a == 2) && (e == 2) && (i == 2) && (m == 2)) all = 2;
         if ((b == 2) && (f == 2) && (j == 2) && (n == 2)) all = 2;
         if ((c == 2) && (g == 2) && (k == 2) && (o == 2)) all = 2;
         if ((d == 2) && (h == 2) && (l == 2) && (p == 2)) all = 2;
         if ((e == 2) && (f == 2) && (g == 2) && (h == 2)) all = 2;
         if ((g == 2) && (i == 2) && (k == 2) && (l == 2)) all = 2;
         if ((m == 2) && (n == 2) && (o == 2) && (p == 2)) all = 2;
         if ((m == 2) && (j == 2) && (g == 2) && (d == 2)) all = 2;

         if ((a != 0) && (b != 0) && (c != 0) && (d != 0) && (e != 0) && (f != 0) && (g != 0) && (h != 0) && (i != 0) && (j != 0) && (k != 0) && (l != 0) && (m != 0) && (n != 0) && (o != 0) && (p != 0) && (all == 0)) all = 3;

     }
         // logic for AI move
     function logicTwo() {
             if ((a == 2) && (b == 2) && (c == 0) && (d == 2) && (temp == "")) temp = "C";
             if ((a == 2) && (b == 0) && (c == 2) && (d == 2) && (temp == "")) temp = "B";
             if ((a == 0) && (b == 2) && (c == 2) && (d == 2) && (temp == "")) temp = "A";
             if ((a == 2) && (b == 2) && (c == 2) && (d == 0) && (temp == "")) temp = "D";
             if ((a == 2) && (e == 2) && (i == 2) && (m == 0) && (temp == "")) temp = "M";
             if ((a == 2) && (e == 0) && (i == 2) && (m == 2) && (temp == "")) temp = "E";
             if ((a == 0) && (e == 2) && (i == 2) && (m == 2) && (temp == "")) temp = "A";
             if ((a == 2) && (e == 2) && (i == 0) && (m == 2) && (temp == "")) temp = "I";
             if ((a == 2) && (f == 2) && (k == 0) && (p == 2) && (temp == "")) temp = "K";
             if ((a == 2) && (f == 0) && (k == 2) && (p == 2) && (temp == "")) temp = "F";
             if ((a == 0) && (f == 2) && (k == 2) && (p == 2) && (temp == "")) temp = "A";
             if ((a == 2) && (f == 2) && (k == 2) && (p == 0) && (temp == "")) temp = "P";
             if ((b == 2) && (f == 2) && (j == 2) && (n == 0) && (temp == "")) temp = "N";
             if ((b == 2) && (f == 2) && (j == 0) && (n == 2) && (temp == "")) temp = "J";
             if ((b == 2) && (f == 0) && (j == 2) && (n == 2) && (temp == "")) temp = "F";
             if ((b == 0) && (f == 2) && (j == 2) && (n == 2) && (temp == "")) temp = "B";
             if ((c == 0) && (g == 2) && (k == 2) && (o == 2) && (temp == "")) temp = "C";
             if ((c == 2) && (g == 0) && (k == 2) && (o == 2) && (temp == "")) temp = "G";
             if ((c == 2) && (g == 2) && (k == 0) && (o == 2) && (temp == "")) temp = "K";
             if ((c == 2) && (g == 2) && (k == 2) && (o == 0) && (temp == "")) temp = "O";
             if ((d == 0) && (h == 2) && (l == 2) && (p == 2) && (temp == "")) temp = "D";
             if ((d == 2) && (h == 0) && (l == 2) && (p == 2) && (temp == "")) temp = "H";
             if ((d == 2) && (h == 2) && (l == 0) && (p == 2) && (temp == "")) temp = "L";
             if ((d == 2) && (h == 2) && (l == 2) && (p == 0) && (temp == "")) temp = "P";
             if ((d == 0) && (g == 2) && (j == 2) && (m == 2) && (temp == "")) temp = "D";
             if ((d == 2) && (g == 0) && (j == 2) && (m == 2) && (temp == "")) temp = "G";
             if ((d == 2) && (g == 2) && (j == 0) && (m == 2) && (temp == "")) temp = "J";
             if ((d == 2) && (g == 2) && (j == 2) && (m == 0) && (temp == "")) temp = "M";
             if ((e == 0) && (f == 2) && (g == 2) && (h == 2) && (temp == "")) temp = "E";
             if ((e == 2) && (f == 0) && (g == 2) && (h == 2) && (temp == "")) temp = "F";
             if ((e == 2) && (f == 2) && (g == 0) && (h == 2) && (temp == "")) temp = "G";
             if ((e == 2) && (f == 2) && (g == 2) && (h == 0) && (temp == "")) temp = "H";
             if ((i == 0) && (j == 2) && (k == 2) && (l == 2) && (temp == "")) temp = "I";
             if ((i == 2) && (j == 0) && (k == 2) && (l == 2) && (temp == "")) temp = "J";
             if ((i == 2) && (j == 2) && (k == 0) && (l == 2) && (temp == "")) temp = "K";
             if ((i == 2) && (j == 2) && (k == 2) && (l == 0) && (temp == "")) temp = "L";
             if ((m == 0) && (n == 2) && (o == 2) && (p == 2) && (temp == "")) temp = "M";
             if ((m == 2) && (n == 0) && (o == 2) && (p == 2) && (temp == "")) temp = "N";
             if ((m == 2) && (n == 2) && (o == 0) && (p == 2) && (temp == "")) temp = "O";
             if ((m == 2) && (n == 2) && (o == 2) && (p == 0) && (temp == "")) temp = "P";
         }
         // logic for AI block your win
     function logicThree() {
         if ((a == 1) && (b == 1) && (c == 0) && (d == 1) && (temp == "")) temp = "C";
         if ((a == 1) && (b == 0) && (c == 1) && (d == 1) && (temp == "")) temp = "B";
         if ((a == 0) && (b == 1) && (c == 1) && (d == 1) && (temp == "")) temp = "A";
         if ((a == 1) && (b == 1) && (c == 1) && (d == 0) && (temp == "")) temp = "D";
         if ((a == 1) && (e == 1) && (i == 1) && (m == 0) && (temp == "")) temp = "M";
         if ((a == 1) && (e == 0) && (i == 1) && (m == 1) && (temp == "")) temp = "E";
         if ((a == 0) && (e == 1) && (i == 1) && (m == 1) && (temp == "")) temp = "A";
         if ((a == 1) && (e == 1) && (i == 0) && (m == 1) && (temp == "")) temp = "I";
         if ((a == 1) && (f == 1) && (k == 0) && (p == 1) && (temp == "")) temp = "K";
         if ((a == 1) && (f == 0) && (k == 1) && (p == 1) && (temp == "")) temp = "F";
         if ((a == 0) && (f == 1) && (k == 1) && (p == 1) && (temp == "")) temp = "A";
         if ((a == 1) && (f == 1) && (k == 1) && (p == 0) && (temp == "")) temp = "P";
         if ((b == 1) && (f == 1) && (j == 1) && (n == 0) && (temp == "")) temp = "N";
         if ((b == 1) && (f == 1) && (j == 0) && (n == 1) && (temp == "")) temp = "J";
         if ((b == 1) && (f == 0) && (j == 1) && (n == 1) && (temp == "")) temp = "F";
         if ((b == 0) && (f == 1) && (j == 1) && (n == 1) && (temp == "")) temp = "B";
         if ((c == 0) && (g == 1) && (k == 1) && (o == 1) && (temp == "")) temp = "C";
         if ((c == 1) && (g == 0) && (k == 1) && (o == 1) && (temp == "")) temp = "G";
         if ((c == 1) && (g == 1) && (k == 0) && (o == 1) && (temp == "")) temp = "K";
         if ((c == 1) && (g == 1) && (k == 1) && (o == 0) && (temp == "")) temp = "O";
         if ((d == 0) && (h == 1) && (l == 1) && (p == 1) && (temp == "")) temp = "D";
         if ((d == 1) && (h == 0) && (l == 1) && (p == 1) && (temp == "")) temp = "H";
         if ((d == 1) && (h == 1) && (l == 0) && (p == 1) && (temp == "")) temp = "L";
         if ((d == 1) && (h == 1) && (l == 1) && (p == 0) && (temp == "")) temp = "P";
         if ((d == 0) && (g == 1) && (j == 1) && (m == 1) && (temp == "")) temp = "D";
         if ((d == 1) && (g == 0) && (j == 1) && (m == 1) && (temp == "")) temp = "G";
         if ((d == 1) && (g == 1) && (j == 0) && (m == 1) && (temp == "")) temp = "J";
         if ((d == 1) && (g == 1) && (j == 1) && (m == 0) && (temp == "")) temp = "M";
         if ((e == 0) && (f == 1) && (g == 1) && (h == 1) && (temp == "")) temp = "E";
         if ((e == 1) && (f == 0) && (g == 1) && (h == 1) && (temp == "")) temp = "F";
         if ((e == 1) && (f == 1) && (g == 0) && (h == 1) && (temp == "")) temp = "G";
         if ((e == 1) && (f == 1) && (g == 1) && (h == 0) && (temp == "")) temp = "H";
         if ((i == 0) && (j == 1) && (k == 1) && (l == 1) && (temp == "")) temp = "I";
         if ((i == 1) && (j == 0) && (k == 1) && (l == 1) && (temp == "")) temp = "J";
         if ((i == 1) && (j == 1) && (k == 0) && (l == 1) && (temp == "")) temp = "K";
         if ((i == 1) && (j == 1) && (k == 1) && (l == 0) && (temp == "")) temp = "L";
         if ((m == 0) && (n == 1) && (o == 1) && (p == 1) && (temp == "")) temp = "M";
         if ((m == 1) && (n == 0) && (o == 1) && (p == 1) && (temp == "")) temp = "N";
         if ((m == 1) && (n == 1) && (o == 0) && (p == 1) && (temp == "")) temp = "O";
         if ((m == 1) && (n == 1) && (o == 1) && (p == 0) && (temp == "")) temp = "P";
     }

     function checkSpace() {
         if ((temp == "A") && (a == 0)) {
             ok = 1;
             if (cf == 0) a = 1;
             if (cf == 1) a = 2;
             return true;
         }
         if ((temp == "B") && (b == 0)) {
             ok = 1;
             if (cf == 0) b = 1;
             if (cf == 1) b = 2;
             return true;
         }
         if ((temp == "C") && (c == 0)) {
             ok = 1;
             if (cf == 0) c = 1;
             if (cf == 1) c = 2;
             return true;
         }
         if ((temp == "D") && (d == 0)) {
             ok = 1;
             if (cf == 0) d = 1;
             if (cf == 1) d = 2;
             return true;
         }
         if ((temp == "E") && (e == 0)) {
             ok = 1;
             if (cf == 0) e = 1;
             if (cf == 1) e = 2;
             return true;
         }
         if ((temp == "F") && (f == 0)) {
             ok = 1;
             if (cf == 0) f = 1;
             if (cf == 1) f = 2;
             return true;
         }
         if ((temp == "G") && (g == 0)) {
             ok = 1;
             if (cf == 0) g = 1;
             if (cf == 1) g = 2;
             return true;
         }
         if ((temp == "H") && (h == 0)) {
             ok = 1;
             if (cf == 0) h = 1;
             if (cf == 1) h = 2;
             return true;
         }
         if ((temp == "I") && (i == 0)) {
             ok = 1;
             if (cf == 0) i = 1;
             if (cf == 1) i = 2;
             return true;
         }
         if ((temp == "J") && (j == 0)) {
             ok = 1;
             if (cf == 0) j = 1;
             if (cf == 1) j = 2;
             return true;
         }
         if ((temp == "K") && (k == 0)) {
             ok = 1;
             if (cf == 0) k = 1;
             if (cf == 1) k = 2;
             return true;
         }
         if ((temp == "L") && (l == 0)) {
             ok = 1;
             if (cf == 0) l = 1;
             if (cf == 1) l = 2;
             return true;
         }
         if ((temp == "M") && (m == 0)) {
             ok = 1;
             if (cf == 0) m = 1;
             if (cf == 1) m = 2;
             return true;
         }
         if ((temp == "N") && (n == 0)) {
             ok = 1;
             if (cf == 0) n = 1;
             if (cf == 1) n = 2;
             return true;
         }
         if ((temp == "O") && (o == 0)) {
             ok = 1;
             if (cf == 0) o = 1;
             if (cf == 1) o = 2;
             return true;
         }
         if ((temp == "P") && (p == 0)) {
             ok = 1;
             if (cf == 0) p = 1;
             if (cf == 1) p = 2;
             return true;
         }
     }
  
     function yourChoice(chName) {
       
        pause = 0;
        if (all != 0) ended();
        if (all == 0) {
             cf = 0;
             ok = 0;
             temp = chName;
             checkSpace();
            if (ok == 1) {
                  $('#'+chName).addClass('tic');
                
            }
             process();
             if (ok == 0) taken();
            
             if ((all == 0) && (pause == 0)) {
                 setTimeout(function(){
                    myChoice();
                }, 500);
                
            }
            
         }
     }

     function taken() {
         return false;
     }

     function myChoice() {
      
         temp = "";
         ok = 0;
         cf = 1;
         logicTwo();
         logicThree();
         checkSpace();
         while (ok == 0) {
             aRandomNumber = Math.random()
             comp = Math.round((choice - 1) * aRandomNumber) + 1;
             if (comp == 1) temp = "A";
             if (comp == 2) temp = "B";
             if (comp == 3) temp = "C";
             if (comp == 4) temp = "D";
             if (comp == 5) temp = "E";
             if (comp == 6) temp = "F";
             if (comp == 7) temp = "G";
             if (comp == 8) temp = "H";
             if (comp == 9) temp = "I";
             if (comp == 10) temp = "J";
             if (comp == 11) temp = "K";
             if (comp == 12) temp = "L";
             if (comp == 13) temp = "M";
             if (comp == 14) temp = "N";
             if (comp == 15) temp = "O";
             if (comp == 16) temp = "P";
             checkSpace();
         }
         $('#' + temp).addClass('toe');
         process();
     }


     function ended() {
         return false;
     }

     function process() {
        // CHANGE IT THEN!

         logicOne();
         if (all == 1) {
             $('.newGameB').css('visibility', 'hidden');
             $('.oil').css('visibility', 'visible');
                $('#ticTacToe').remove();
         } else if (all == 2 || all == 3) {
             //$('.newGameB').css('visibility', 'visible');
              $('.newGameB').css('visibility', 'hidden');
             $('.oil').css('visibility', 'visible');
                $('#ticTacToe').remove();
         }

     }
       
  
    var counter = 0;

     function playAgain() {
       
         if (all == 2) {
             reset();
         } else if (all == 3) {
             counter++;
             // CHANGE IT THEN!
             if (counter >= 1) { 
                 $('.newGameB').css('visibility', 'hidden');
                  $('#ticTacToe').remove();
                 $('.oil').css('visibility', 'visible');

                 return false;
             }
             
             reset();
             

         }

     }
    

     function reset() {        
        var fields = $('.field');
        fields.each( function(index){
            $(this).removeClass('toe');
            $(this).removeClass('tic');
        });
        $('.newGameB').css('visibility', 'hidden');

         all = 0;
         a = 0;
         b = 0;
         c = 0;
         d = 0;
         e = 0;
         f = 0;
         g = 0;
         h = 0;
         i = 0;
         j = 0;
         k = 0;
         l = 0;
         m = 0;
         n = 0;
         o = 0;
         p = 0;
         temp = "";
         ok = 0;
         cf = 0;
         choice = 16;
         aRandomNumber = 0;
         comp = 0;
        
         
         if (t == 0) {
             t = 2;
             myChoice();
         }
         t--;
     }
     // end of game
     function addOil() {        
        $('#inventory').trigger('inventory:addOil');
        $('button.oil').hide();
        $('#ticTacToe').remove();
        $('.stone').remove();
        stage2.finishStage()
    }
    return stage2;
 });