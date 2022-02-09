const p = document.getElementById("para");
const blacklist_chars = ['Shift', 'CapsLock', 'Control', 'Alt', 'Meta', 'Backspace', 'Enter'];
let current_char, para_text, para_len, cursor_index;
let isRight = true;

// async code to fetch text from api
const getData = async () => {
	const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=600');
	const data = await response.json();
	return data;
}
getData().then((data) => {  //when promise is resolved
	para_text = data['content'];
	span_chars(para_text);
	console.log(para_text);
}).catch((e) => {  //when error occurs
	para_text = "its some error text";
	span_chars(para_text);
	console.log(e.message);
});

// create span for each char and add it to html paragraph element
function span_chars(input_text){
	p.innerHTML = "";
	cursor_index = 0;
	para_len = input_text.length;
	const chars = input_text.split("");
	for(let i = 0; i < chars.length; i++){
		let span_tag = document.createElement('span');
		span_tag.innerHTML = chars[i];
		p.appendChild(span_tag);
	}
	// adding cursor to the first char
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
	// to fetch the next text in advance when half of the previous text is done typing
	if(cursor_index === Math.round(para_len/2)){
		getData().then((data) => {  //when promise is resolved
			para_text = data['content'];
			console.log(para_text);
		}).catch((e) => {  //when error occurs
			para_text = "its some error text";
			console.log(e.message);
		});
	}
}

document.addEventListener('keydown', (e) => {
	// when current text is done typing
	if(cursor_index === (para_len - 1)){
		span_chars(para_text);
	}
	// right character is pressed
	else if(e.key === current_char.innerText && !(blacklist_chars.includes(e.key))){
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