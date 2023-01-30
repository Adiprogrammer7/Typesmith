const p = document.getElementById("para");
const timer_div = document.getElementById("timer");
const wpm_div = document.getElementById("wpm");
const accuracy_div = document.getElementById("accuracy");
const timeupModal = document.getElementById("timeupModal")
const darkToggle = document.getElementById("darkToggle");
const blacklist_chars = ['Shift', 'CapsLock', 'Control', 'Alt', 'Meta', 'Backspace', 'Enter'];
let current_char, typed_chars, para_text, para_len, cursor_index;
let isRight, isStarted, wpm, accuracy, total_errors, uncorrected_errors;
let initial_min, initial_sec, min, sec;

// async code to fetch text from api
// If you use the async keyword before a function definition, you can then use await within the function. When you await a promise, the function is paused in a non-blocking way until the promise settles. If the promise fulfills, you get the value back. If the promise rejects, the rejected value is thrown.
// The await operator is used to wait for a Promise and get its fulfillment value.
const getData = async () => {
	const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=600');
	const data = await response.json();
	return data;
}

function fetch_text(){
	getData().then((data) => {  //when promise is resolved
		para_text = data['content'];
		span_chars();
	}).catch((e) => {  //when error occurs
		para_text = "Warning: some error has occured!";
		span_chars();
		console.log(e.message);
	});
}

// to initialize variables
function initialize(){
	isStarted = false;
	isRight = true
	initial_min = min = 0;
	initial_sec = sec = 30;
	typed_chars = total_errors = uncorrected_errors = 0;
	fetch_text();
	//to nicely format the timer shown
	timer_div.innerHTML =  String(min).padStart(2, '0') + " : " + String(sec).padStart(2, '0');
	// for wpm and accuracy div
	wpm_div.innerHTML = 0;
	accuracy_div.innerHTML = 0;
	// specifying event listener
	document.addEventListener('keydown', typing_handler);
}
initialize();

// // to determine curosr during cursor movement according dark or light theme
// function add_cursor_class(){
// 	// toggle is on
// 	if(darkToggle.checked){
// 		current_char.classList.remove("cursor");
// 		current_char.classList.add("dark_theme_cursor");
// 	}
// 	// toggle is off
// 	else{
// 		current_char.classList.remove("dark_theme_cursor");
// 		current_char.classList.add("cursor");
// 	}
// }

// create span for each char and add it to html paragraph element
function span_chars(){
	p.innerHTML = "";
	cursor_index = 0;
	para_len = para_text.length;
	const chars = para_text.split("");
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
		}).catch((e) => {  //when error occurs
			para_text = "its some error text";
			console.log(e.message);
		});
	}
}

//to display popup box after timer is over
function display_modal(){
	$('#timeupModal').modal('show'); 
	document.getElementById("modal_wpm").innerHTML = wpm;
	document.getElementById("modal_accuracy").innerHTML = accuracy;
}

// to handle timer countdown
function timer(min, sec){
	//setInterval() will execute this arrow function snippet repeatedly after every 1000 millisec
	const interval_id = setInterval(() => {
		
		if(min == 0 && sec == 0){
			console.log("timer done");
			document.removeEventListener("keydown", typing_handler);
			clearInterval(interval_id);
			display_modal();
			return;
		}
		else if(sec == 0){
			sec = 59;
			min--;
		}
		else{
			sec--;
		}

		//padStart() to have preceding 0 for single digit numbers.
		timer_div.innerHTML = String(min).padStart(2, '0') + " : " + String(sec).padStart(2, '0');
		
		// for calculation of wpm and accuracy
		let time_passed = (initial_min + (initial_sec/60)) - (min + (sec/60));
		wpm = Math.round(((typed_chars/5) - uncorrected_errors)/time_passed);
		wpm = Math.max(0, wpm); //to avoid negative wpm values
		accuracy = Math.round(((typed_chars - total_errors)/typed_chars)*100);
		wpm_div.innerHTML = wpm;
		accuracy_div.innerHTML = accuracy;
	}, 1000);
}

// Event handling function for typing
function typing_handler(e){
	// when first time started typing
	if(!isStarted){
		isStarted = true;
		timer(min, sec);
	}
	// when current text is done typing
	if(cursor_index === (para_len - 1)){
		span_chars(); //we will span the newly fetched text
	}
	// right character is pressed
	else if(e.key === current_char.innerText && !(blacklist_chars.includes(e.key))){
		isRight = true;
		typed_chars++;
		cursor_forward(isRight);
	}
	// wrong character is pressed
	else if(!(blacklist_chars.includes(e.key))){
		isRight = false;
		total_errors++;
		uncorrected_errors++;
		typed_chars++;
		cursor_forward(isRight);
	}
	// when BACKSPACE is pressed
	else if(e.key === "Backspace"){
		// means there is room to go back
		if(cursor_index !== 0){
			current_char.className = ""; //to clear out classes added 
			cursor_index--;
			current_char = $("#para span")[cursor_index];
			//means we are backspacing to a wrongly typed character, hence decrementing uncorrected cnt
			if(current_char.classList.contains("warn_char")){
				uncorrected_errors--;
			}
			current_char.className = ""; 
			current_char.classList.add("cursor");
			typed_chars--;
		}
	}
}

// so even when the time over modal is closed by clicking outside it, initialize function can be runned
timeupModal.addEventListener('hidden.bs.modal', function () {
  initialize();
})

// dark mode toggle handling
darkToggle.addEventListener("click", function(){
	// when toggle in on
	if(darkToggle.checked){
		document.body.classList.remove("light_theme");
		document.body.classList.add("dark_theme");
		current_char.classList.remove("cursor");
		current_char.classList.add("dark_theme_cursor");
	}
	// when toggle is off
	else{
		document.body.classList.remove("dark_theme");
		document.body.classList.add("light_theme");
		current_char.classList.remove("dark_theme_cursor");
		current_char.classList.add("cursor");		
	}
})