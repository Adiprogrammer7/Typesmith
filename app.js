const p = document.getElementById("para");
const sample_text = "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Accusamus, odio excepturi autem quibusdam quod eligendi voluptates reprehenderit quos dolores aspernatur modi consequuntur minima ratione aut labore perspiciatis laudantium provident architecto";
const chars = sample_text.split("");
const blacklist_chars = ['Shift', 'CapsLock', 'Control', 'Alt', 'Meta', 'Backspace', 'Enter'];

// create span for each char and add it to html element
for(let i = 0; i < chars.length; i++){
	let span_tag = document.createElement('span');
	span_tag.innerHTML = chars[i];
	p.appendChild(span_tag);
}

let cursor_index = 0;
let current_char = $("#para span")[cursor_index]
current_char.classList.add("cursor");
let isRight = true;

// the way cursor will move to next char depending upon if right or wrong key was pressed
function cursor_forward(isRight){
	current_char.classList.remove("cursor");
	if(isRight){
		current_char.classList.add("done_char");	
	}
	else{
		current_char.classList.add("warn_char");
	}
	cursor_index++;
	current_char = $("#para span")[cursor_index];
	current_char.classList.add("cursor");
}

document.addEventListener('keydown', e => {
	console.log(e.key);
	// right character is pressed
	if(e.key === current_char.innerText && !(blacklist_chars.includes(e.key))){
		isRight = true;
		cursor_forward(isRight);	
	}
	// wrong character is pressed
	else if(!(blacklist_chars.includes(e.key))){
		isRight = false;
		cursor_forward(isRight);
	}
	// when BACKSPACE is pressed
	else if(e.key === "Backspace"){
		// means there is room to go back
		if(cursor_index !== 0){
			current_char.className = ""; //to clear out classes added 
			cursor_index--;
			current_char = $("#para span")[cursor_index];
			current_char.className = ""; 
			current_char.classList.add("cursor");
		}
	}
	// else{
	// 	console.log('nothing');
	// }
});