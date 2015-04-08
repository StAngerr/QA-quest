function drag(event) {    	
        event.dataTransfer.setData('text/plain', $(event.target).html());      
        return true;
}
function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
	event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var word =  $(event.target).val();
     $(event.target).val(word + data);
}
