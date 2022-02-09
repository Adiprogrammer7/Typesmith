const p = document.getElementById("para");
const blacklist_chars = ['Shift', 'CapsLock', 'Control', 'Alt', 'Meta', 'Backspace', 'Enter'];

// initialization to the first char of typing text
let cursor_index = 0;
let current_char;
let isRight = true;
let para_text;

// to fetch text from api
const getData = async () => {
	const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=600');
	const data = await response.json();
	return data;
}
getData().then((data) => {  //when promise is resolved
	para_text = data['content'];
	span_chars(para_text);
	console.log(data['content']);
}).catch((e) => {  //when error occurs
	para_text = "its some error text";
	span_chars(para_text);
	console.log(e.message);
});

// create span for each char and add it to html paragraph element
function span_chars(input_text){
	const chars = input_text.split("");
	for(let i = 0; i < chars.length; i++){
		let span_tag = document.createElement('span');
		span_tag.innerHTML = chars[i];
		p.appendChild(span_tag);
	}
	current_char = $("#para span")[cursor_index];
	current_char.classList.add("cursor");
}

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

document.addEventListener('keydown', (e) => {
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
});