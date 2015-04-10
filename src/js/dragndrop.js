

var stage_content = {
		taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
		letters : ['e', 'm','i', 'c', 'a', 't', 's', 'p','c','r']
};
var word = '';
var that;
var counter = 0 ;



function drag(event) {    	
        event.dataTransfer.setData('text/html', $(event.target).html()); 
        that = $(event.target);       
        return false;
}


function allowDrop(event) {
    event.preventDefault();
    

}

function drop(event) {
	event.preventDefault();
    var data =  '<figure class="letters" ondragover="nodrop(event)"> '+ event.dataTransfer.getData('text/html') + '</figure>';
    var html =  $(event.target).html();
 	  $('.makeWord').css ('background-color', '#fff');
    word += that.children().text();   
    that.hide();
    counter ++;
    $(event.target).html(html + data); 
    if (counter === 10) {
    	$('#sendWord').show();
        return false;
    }       
}

function nodrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "none";
    return false;
}

function over(event) {
	 event.preventDefault();
	 that.css('opacity', '0.5');     
     return false;
	
	
}

function leave(event) {
	event.preventDefault();
	that.css('opacity', '1');
    $('.makeWord').css ('background-color', 'yellow');
	return false;		
}


function appendPopupTask (name) {
	var templUrl = 'src/templates/' + name; 

	$.ajax({
        url: templUrl,
        method: 'GET',
        async: false,
        success: function(data) {
        	var a = _.template(data, stage_content)
        		$('.popup').prepend(a);
        }
    });
}

 function up() {
    console.log (word.length, word);
	if (word === 'ecmascript'.toUpperCase()) {
			alert (word);	
	}
	$('.gun').show();
}
