const feelings = {
	Mad: "mad",
	Bored: "bored",
	Happy: "happy",
	Sick: "sick",
	Sad: "sad",
	Tired: "tired",
	Silly: "silly",
	Hungry: "hungry"
};

const students = [
	"Abigail",
	"Aiden",
	"Eli",
	"Gianna",
	"Ivar",
	"Oliver",
	"Theo",
	"Vincent"
];
const main = document.getElementById("main");
const container = document.getElementById("students");
const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");
const feelingOptions = document.getElementById("feelings");
let selectedStudent = null;

students.forEach((name) => {
	const studentDiv = document.createElement("li");
	studentDiv.classList.add("student");
	studentDiv.textContent = name;

	studentDiv.addEventListener("click", function () {
		selectedStudent = studentDiv;
		main.classList.add("blur");
		overlay.style.display = "flex";
	});

	container.appendChild(studentDiv);
});

Object.keys(feelings).forEach((feeling) => {
	const button = document.createElement("li");
	button.textContent = feeling;
	button.classList.add("feeling", feelings[feeling]);

	button.addEventListener("click", function () {
		if (selectedStudent) {
			Object.values(feelings).forEach((feelingClass) => {
				selectedStudent.classList.remove(feelingClass);
			});
			selectedStudent.classList.add(feelings[feeling]);
			main.classList.remove("blur");
			overlay.style.display = "none";
		}
	});

	feelingOptions.appendChild(button);
});

overlay.addEventListener("click", function (event) {
	if (!popup.contains(event.target)) {
		selectedStudent.setAttribute("class", "student");
		main.classList.remove("blur");
		overlay.style.display = "none";
	}
});
