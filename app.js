const STORAGE_KEY = "merit-tracker-data-v1";

const state = {
  students: []
};

const elements = {
  studentForm: document.getElementById("student-form"),
  studentName: document.getElementById("student-name"),
  pointsForm: document.getElementById("points-form"),
  studentSelect: document.getElementById("student-select"),
  pointType: document.getElementById("point-type"),
  pointValue: document.getElementById("point-value"),
  pointReason: document.getElementById("point-reason"),
  studentList: document.getElementById("student-list"),
  resetButton: document.getElementById("reset-button"),
  studentCardTemplate: document.getElementById("student-card-template")
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data.students)) {
      state.students = data.students;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderStudentOptions() {
  const currentValue = elements.studentSelect.value;

  elements.studentSelect.innerHTML = '<option value="">Select a student</option>';
  for (const student of state.students) {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = student.name;
    elements.studentSelect.append(option);
  }

  if (state.students.some((student) => student.id === currentValue)) {
    elements.studentSelect.value = currentValue;
  }
}

function formatEntry(entry) {
  const sign = entry.type === "merit" ? "+" : "-";
  const date = new Date(entry.timestamp).toLocaleString();
  return `${date}: ${sign}${entry.points} (${entry.reason})`;
}

function renderStudentCards() {
  elements.studentList.innerHTML = "";

  if (state.students.length === 0) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = "No students yet. Add one to start tracking behaviour points.";
    elements.studentList.append(message);
    return;
  }

  const sorted = [...state.students].sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name));

  for (const student of sorted) {
    const clone = elements.studentCardTemplate.content.cloneNode(true);
    clone.querySelector(".student-name").textContent = student.name;
    clone.querySelector(".student-score").textContent = `Total: ${student.totalPoints}`;

    const historyList = clone.querySelector(".history");
    if (!student.history.length) {
      const entry = document.createElement("li");
      entry.className = "history-entry empty";
      entry.textContent = "No behaviour entries yet.";
      historyList.append(entry);
    } else {
      for (const entryData of [...student.history].reverse().slice(0, 8)) {
        const entry = document.createElement("li");
        entry.className = `history-entry entry-${entryData.type}`;
        entry.textContent = formatEntry(entryData);
        historyList.append(entry);
      }
    }

    elements.studentList.append(clone);
  }
}

function render() {
  renderStudentOptions();
  renderStudentCards();
}

function addStudent(name) {
  state.students.push({
    id: crypto.randomUUID(),
    name,
    totalPoints: 0,
    history: []
  });
  saveState();
  render();
}

function addBehaviourRecord({ studentId, type, points, reason }) {
  const student = state.students.find((item) => item.id === studentId);
  if (!student) return;

  const signedPoints = type === "merit" ? points : -points;
  student.totalPoints += signedPoints;
  student.history.push({
    type,
    points,
    reason,
    timestamp: Date.now()
  });

  saveState();
  render();
}

function resetAllData() {
  state.students = [];
  saveState();
  render();
}

function setupEvents() {
  elements.studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = elements.studentName.value.trim();
    if (!name) return;

    addStudent(name);
    elements.studentName.value = "";
    elements.studentName.focus();
  });

  elements.pointsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const studentId = elements.studentSelect.value;
    const type = elements.pointType.value;
    const points = Number(elements.pointValue.value);
    const reason = elements.pointReason.value.trim();

    if (!studentId || !reason || points < 1 || !Number.isFinite(points)) return;

    addBehaviourRecord({ studentId, type, points, reason });
    elements.pointReason.value = "";
    elements.pointValue.value = "1";
    elements.pointReason.focus();
  });

  elements.resetButton.addEventListener("click", () => {
    const confirmed = window.confirm("This will remove all students and behaviour history. Continue?");
    if (confirmed) resetAllData();
  });
}

loadState();
setupEvents();
render();
