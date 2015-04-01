/*Stage 1*/

function mainPopup() {
	alert('1');
}


function totalPopup() {
	alert('second');
}
function subfc() {

}

function dragStart(e) {
 ev.dataTransfer.setData("text", ev.target.id);
}

function drop(e) {

}

function allowDrop(e) {
	ev.preventDefault();
}