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
const studentList = document.getElementById("student-list");
const container = document.getElementById("students");
const greeting = document.getElementById("greeting");
const greetingDefault = "everyone";
const feelingList = document.getElementById("feeling-list");
const popup = document.getElementById("popup");
const feelingChoices = document.getElementById("feelings");

students.forEach((name) => {
	const studentName = document.createElement("li");
	studentName.classList.add("student");
	studentName.textContent = name;

	studentName.addEventListener("click", function () {
		selectedStudent = studentName;
		container.style.display = "none";
		feelingList.style.display = "grid";
		greeting.textContent = name;
	});

	container.appendChild(studentName);
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
			feelingList.style.display = "none";
			container.style.display = "grid";
			greeting.textContent = greetingDefault;
		}
	});

	feelingChoices.appendChild(button);
});

greeting.addEventListener("click", function (event) {
	if (!feelingChoices.contains(event.target)) {
		selectedStudent.setAttribute("class", "student");
		feelingList.style.display = "none";
		container.style.display = "grid";
		greeting.textContent = greetingDefault;
	}
});
