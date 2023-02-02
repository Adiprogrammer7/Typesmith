// import { Buffer } from 'node:buffer';
// const stripComments = require('strip-comments');
// var stripComments = require("strip-comments");
const p = document.getElementById("para");
const timer_div = document.getElementById("timer");
const wpm_div = document.getElementById("wpm");
const accuracy_div = document.getElementById("accuracy");
const timeupModal = document.getElementById("timeupModal")
const darkToggle = document.getElementById("darkToggle");
const select = document.querySelector('#selectLanguage');
const blacklist_chars = ['Shift', 'CapsLock', 'Control', 'Alt', 'Meta', 'Backspace'];
const programmingLanguages = ["plaintext", "assembly", "c", "c++", "go", "java", "javascript", "kotlin", "perl", "php", "python", "r", "ruby", "rust", "scala", "sh", "swift", "typescript"];
let current_char, typed_chars, para_text, para_len, cursor_index;
let isRight, isStarted, wpm, accuracy, total_errors, uncorrected_errors;
let initial_min, initial_sec, min, sec;

// Populate the dropdown menu with options
programmingLanguages.forEach(language => {
	const option = document.createElement('option');
	option.value = language;
	option.textContent = language;
	select.appendChild(option);
});

// async code to fetch text from api
// If you use the async keyword before a function definition, you can then use await within the function. When you await a promise, the function is paused in a non-blocking way until the promise settles. If the promise fulfills, you get the value back. If the promise rejects, the rejected value is thrown.
// The await operator is used to wait for a Promise and get its fulfillment value.
const getData = async () => {
	const response = await fetch('https://api.quotable.io/random?minLength=100&maxLength=600');
	const data = await response.json();
	return data;
}

async function fetch_text() {
	getData().then((data) => {  //when promise is resolved
		para_text = data['content'];
		span_chars();
	}).catch((e) => {  //when error occurs
		para_text = "Warning: some error has occured!";
		span_chars();
		console.log(e.message);
	});
	return para_text;
}

function randChoose(data) {
	let max = data['items'].length;
	let randomNum = Math.floor(Math.random() * max);
	return randomNum;
}

function removeComments(code) {
	// Match single-line comments in C-style syntax (//)
	code = code.replace(/\/\/.*/g, '');
	// Match multi-line comments in C-style syntax (/* ... */)
	code = code.replace(/\/\*[\s\S]*?\*\//g, '');
	// Match single-line comments in Python-style syntax (#)
	code = code.replace(/#.*/g, '');
	return code;
}

function format_code(code, word_limit) {
	code = removeComments(code);
	// code = stripComments(code);
	// to remove blank lines
	let lines = code.split("\n");
	code = lines.filter(line => line.trim() !== "").join("\n");
	// code indentation
	const tabSize = 4;
	const formattedCode = code
		.split("\n")
		.map((line) => {
			let leadingSpaces = 0;
			for (let i = 0; i < line.length; i++) {
				if (line[i] !== " ") break;
				leadingSpaces++;
			}
			return "\t".repeat(Math.floor(leadingSpaces / tabSize)) + line.slice(leadingSpaces);
		})
		.join("\n");
	let words = formattedCode.split(" ");
	words = words.slice(0, word_limit);
	words = words.join(" ");
	return words;
}

async function fetch_code(selectedLanguage) {
	var full_repo;
	const result = async () => {
		const response = await fetch(`https://api.github.com/search/repositories?q=language:${selectedLanguage}&sort=stars&order=desc`); // First request
		const data = await response.json();
		return data;
	}
	result().then(function (data) {
		// to randomally choose a repo
		console.log(data);
		let randomNum = randChoose(data);
		full_repo = data['items'][randomNum]['full_name'];
		return full_repo;
	})
		.then(function (full_repo) {
			let response = fetch(`https://api.github.com/search/code?q=%20+language:${selectedLanguage}+repo:${full_repo}`);
			return response;
		})
		.then(function (response) {
			let data = response.json();
			console.log(full_repo);
			return data;
		})
		.then(function (data) {
			// to randomly choose a file
			let randomNum = randChoose(data);
			console.log(data['items'][randomNum]);
			let full_path = data['items'][randomNum]['path'];
			console.log(full_path);
			response = fetch(`https://api.github.com/repos/${full_repo}/contents/${full_path}`);
			return response;
		})
		.then(function (response) {
			data = response.json();
			return data;
		})
		.then(function (data) {
			// const result = Buffer.from(data['content'], 'base64').toString('ascii');
			const result = atob(data['content']);
			// console.log(result);
			let formatted_code = format_code(result, 30);
			para_text = formatted_code;
			span_chars();
		})
		.catch(function (e) {
			para_text = "Warning: some error has occured!";
			span_chars();
			console.log(e);
		})
		return para_text;
}

function text_or_code(){
	let selected_option = select.value;
	if(selected_option == 'plaintext'){
		fetch_text();
	}
	else{
		fetch_code(selected_option);
	}
	return para_text;
}

// text_or_code().then(() => {
// 	// code to execute after text_or_code is done executing
// 	span_chars();
// });

// // when document is first loaded read dropdown
// document.addEventListener("DOMContentLoaded", function() {
// 	text_or_code(select.value);
// });

// Listen for changes in the dropdown menu
select.addEventListener('change', async event => {
	// const selectedLanguage = event.target.value;
	text_or_code();
	select.blur(); //to remove focus from dropdown after option selected 
});

// to initialize variables
function initialize() {
	isStarted = false;
	isRight = true
	initial_min = min = 0;
	initial_sec = sec = 60;
	typed_chars = total_errors = uncorrected_errors = 0;
	text_or_code(); //fetch based on dropdown menu
	//to nicely format the timer shown
	timer_div.innerHTML = String(min).padStart(2, '0') + " : " + String(sec).padStart(2, '0');
	// for wpm and accuracy div
	wpm_div.innerHTML = 0;
	accuracy_div.innerHTML = 0;
	// specifying event listener
	document.addEventListener('keydown', typing_handler);
}
initialize();

// to add cursor class style based upon theme
function add_cursor(char){
	// dark mode
	if(darkToggle.checked){
		char.classList.add("dark_theme_cursor");
	}
	// white mode
	else{
		char.classList.add("cursor");
	}
}

// to remove cursor class style based upon theme
function remove_cursor(char){
	// dark mode
	if(darkToggle.checked){
		char.classList.remove("dark_theme_cursor");
	}
	// white mode
	else{
		char.classList.remove("cursor");
	}
}

// create span for each char and add it to html paragraph element
function span_chars() {
	p.innerHTML = "";
	cursor_index = 0;
	para_len = para_text.length;
	const chars = para_text.split("");
	for (let i = 0; i < chars.length; i++) {
		let span_tag = document.createElement('span');
		span_tag.innerHTML = chars[i];
		p.appendChild(span_tag);
	}
	// adding cursor to the first char
	current_char = $("#para span")[cursor_index];
	add_cursor(current_char);
}

// the way cursor will move to next char depending upon if right or wrong key was pressed
function cursor_forward(isRight) {
	remove_cursor(current_char);
	if (isRight) {
		current_char.classList.add("done_char");
	}
	else {
		current_char.classList.add("warn_char");
	}
	cursor_index++;
	current_char = $("#para span")[cursor_index];
	add_cursor(current_char);
	// // to fetch the next text in advance when half of the previous text is done typing
	// if (cursor_index === Math.round(para_len / 2)) {
	// 	text_or_code();
	// }
}

//to display popup box after timer is over
function display_modal() {
	$('#timeupModal').modal('show');
	document.getElementById("modal_wpm").innerHTML = wpm;
	document.getElementById("modal_accuracy").innerHTML = accuracy;
}

// to handle timer countdown
function timer(min, sec) {
	//setInterval() will execute this arrow function snippet repeatedly after every 1000 millisec
	const interval_id = setInterval(() => {

		if (min == 0 && sec == 0) {
			console.log("timer done");
			document.removeEventListener("keydown", typing_handler);
			clearInterval(interval_id);
			display_modal();
			return;
		}
		else if (sec == 0) {
			sec = 59;
			min--;
		}
		else {
			sec--;
		}

		//padStart() to have preceding 0 for single digit numbers.
		timer_div.innerHTML = String(min).padStart(2, '0') + " : " + String(sec).padStart(2, '0');

		// for calculation of wpm and accuracy
		let time_passed = (initial_min + (initial_sec / 60)) - (min + (sec / 60));
		wpm = Math.round(((typed_chars / 5) - uncorrected_errors) / time_passed);
		wpm = Math.max(0, wpm); //to avoid negative wpm values
		accuracy = Math.round(((typed_chars - total_errors) / typed_chars) * 100);
		wpm_div.innerHTML = wpm;
		accuracy_div.innerHTML = accuracy;
	}, 1000);
}

// Event handling function for typing
function typing_handler(e) {
	// when first time started typing
	if (!isStarted) {
		isStarted = true;
		timer(min, sec);
	}
	// to prevent getting off track from typing interface or avoid selecting other elements on screen or scrolling document.
	if(e.key === ' ' || e.key === 'Tab'){
		e.preventDefault();
	}
	// when current text is done typing
	if (cursor_index === (para_len - 1)) {
		text_or_code();
		// span_chars(); //we will span the newly fetched text
	}
	// right character is pressed
	else if (e.key === current_char.innerText && !(blacklist_chars.includes(e.key))) {
		isRight = true;
		typed_chars++;
		cursor_forward(isRight);
	}
	// wrong character is pressed
	else if (!(blacklist_chars.includes(e.key))) {
		isRight = false;
		total_errors++;
		uncorrected_errors++;
		typed_chars++;
		cursor_forward(isRight);
	}
	// when BACKSPACE is pressed
	else if (e.key === "Backspace") {
		// means there is room to go back
		if (cursor_index !== 0) {
			current_char.className = ""; //to clear out classes added 
			cursor_index--;
			current_char = $("#para span")[cursor_index];
			//means we are backspacing to a wrongly typed character, hence decrementing uncorrected cnt
			if (current_char.classList.contains("warn_char")) {
				uncorrected_errors--;
			}
			current_char.className = "";
			add_cursor(current_char);
			typed_chars--;
		}
	}
}

// so even when the time over modal is closed by clicking outside it, initialize function can be runned
timeupModal.addEventListener('hidden.bs.modal', function () {
	initialize();
})

// dark mode toggle handling
darkToggle.addEventListener("click", function () {
	// when toggle in on
	if (darkToggle.checked) {
		document.body.classList.remove("light_theme");
		document.body.classList.add("dark_theme");
		current_char.classList.remove("cursor");
		current_char.classList.add("dark_theme_cursor");
	}
	// when toggle is off
	else {
		document.body.classList.remove("dark_theme");
		document.body.classList.add("light_theme");
		current_char.classList.remove("dark_theme_cursor");
		current_char.classList.add("cursor");
	}
	darkToggle.blur(); //to remove the focus from it when toggle is used
})

// p.addEventListener("keydown", function (event) {
// 	if (isStarted) {
// 		if (event.key === "Tab" || event.key === " ") {
// 			console.log('executing');
// 			event.preventDefault();
// 		}
// 	}
// });