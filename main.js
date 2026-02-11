const STORAGE_KEY = "behavitracker-data-v1";

const defaultData = {
  students: [
    { id: "s1", name: "Maya Chen", className: "7A" },
    { id: "s2", name: "Liam Patel", className: "7A" },
    { id: "s3", name: "Ava Johnson", className: "8B" },
    { id: "s4", name: "Noah Brown", className: "8B" },
    { id: "s5", name: "Sofia Garcia", className: "9C" }
  ],
  rules: [
    { id: "r1", name: "Homework Completed", trigger: "Academic", points: 10, description: "Completed all homework on time", active: true },
    { id: "r2", name: "Helping Others", trigger: "Social", points: 15, description: "Helped classmates respectfully", active: true },
    { id: "r3", name: "Late to Class", trigger: "Punctuality", points: -5, description: "Arrived late without reason", active: true },
    { id: "r4", name: "Disruptive Behaviour", trigger: "Conduct", points: -15, description: "Repeated class disruptions", active: true }
  ],
  transactions: [
    { id: "t1", studentId: "s1", ruleId: "r1", type: "merit", points: 10, description: "Great effort", date: "2026-02-08T10:00:00Z" },
    { id: "t2", studentId: "s2", ruleId: "r3", type: "demerit", points: -5, description: "Late arrival", date: "2026-02-08T10:30:00Z" },
    { id: "t3", studentId: "s3", ruleId: "r2", type: "merit", points: 15, description: "Peer support", date: "2026-02-09T09:00:00Z" },
    { id: "t4", studentId: "s4", ruleId: "r4", type: "demerit", points: -15, description: "Disrupted lesson", date: "2026-02-09T11:00:00Z" }
  ]
};

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}-${Date.now()}`;
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultData);
  try {
    const parsed = JSON.parse(raw);
    return {
      students: parsed.students || [],
      rules: parsed.rules || [],
      transactions: parsed.transactions || []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStudentScore(data, studentId) {
  return data.transactions
    .filter((tx) => tx.studentId === studentId)
    .reduce((sum, tx) => sum + Number(tx.points), 0);
}

function getStatus(score) {
  if (score >= 150) return "Excellent";
  if (score >= 50) return "Watch";
  return "At Risk";
}

function getStatusClass(status) {
  if (status === "Excellent") return "excellent";
  if (status === "Watch") return "watch";
  return "risk";
}

function getBadges(score) {
  const badges = [];
  if (score >= 100) badges.push("Bronze Badge");
  if (score >= 200) badges.push("Silver Badge");
  if (score >= 300) badges.push("Gold Badge");
  return badges;
}

function attachReset(data) {
  const button = document.getElementById("reset-data");
  if (!button) return;
  button.addEventListener("click", () => {
    if (!window.confirm("Reset all data to defaults?")) return;
    localStorage.removeItem(STORAGE_KEY);
    saveData(structuredClone(defaultData));
    window.location.reload();
  });
}

function populateStudentSelect(select, data) {
  if (!select) return;
  select.innerHTML = data.students.map((s) => `<option value="${s.id}">${s.name} (${s.className})</option>`).join("");
}

function populateRuleSelect(select, data) {
  if (!select) return;
  const activeRules = data.rules.filter((r) => r.active);
  select.innerHTML = `<option value="">Manual points</option>` + activeRules
    .map((r) => `<option value="${r.id}">${r.name} (${r.points > 0 ? "+" : ""}${r.points})</option>`)
    .join("");
}

function renderDashboard(data) {
  const classFilter = document.getElementById("class-filter");
  const statusFilter = document.getElementById("status-filter");
  const tbody = document.getElementById("student-table-body");
  const sortButton = document.getElementById("sort-score");
  const form = document.getElementById("points-form");
  const studentSelect = document.getElementById("student-select");
  const ruleSelect = document.getElementById("rule-select");
  const pointType = document.getElementById("point-type");
  const pointValue = document.getElementById("point-value");
  const pointDescription = document.getElementById("point-description");

  if (!tbody) return;

  const classes = [...new Set(data.students.map((s) => s.className))];
  classFilter.innerHTML = `<option value="all">All</option>` + classes.map((c) => `<option value="${c}">${c}</option>`).join("");
  populateStudentSelect(studentSelect, data);
  populateRuleSelect(ruleSelect, data);

  let scoreSortDesc = true;

  const drawRows = () => {
    const cFilter = classFilter.value;
    const sFilter = statusFilter.value;

    let rows = data.students.map((student) => {
      const score = getStudentScore(data, student.id);
      const status = getStatus(score);
      return { ...student, score, status };
    });

    rows = rows.filter((row) => (cFilter === "all" || row.className === cFilter) && (sFilter === "all" || row.status === sFilter));
    rows.sort((a, b) => scoreSortDesc ? b.score - a.score : a.score - b.score);

    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td><a href="students.html?id=${row.id}">${row.name}</a></td>
        <td>${row.className}</td>
        <td>${row.score}</td>
        <td><span class="badge ${getStatusClass(row.status)}">${row.status}</span></td>
      </tr>
    `).join("");
  };

  classFilter.addEventListener("change", drawRows);
  statusFilter.addEventListener("change", drawRows);
  sortButton.addEventListener("click", () => {
    scoreSortDesc = !scoreSortDesc;
    drawRows();
  });

  ruleSelect.addEventListener("change", () => {
    const selected = data.rules.find((r) => r.id === ruleSelect.value);
    if (!selected) return;
    pointType.value = selected.points >= 0 ? "merit" : "demerit";
    pointValue.value = Math.abs(selected.points);
    pointDescription.value = selected.description;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedStudent = studentSelect.value;
    const selectedRule = data.rules.find((r) => r.id === ruleSelect.value);
    const inputPoints = Number(pointValue.value);
    const type = pointType.value;
    const signedPoints = type === "merit" ? Math.abs(inputPoints) : -Math.abs(inputPoints);

    data.transactions.push({
      id: uid("tx"),
      studentId: selectedStudent,
      ruleId: selectedRule?.id || null,
      type,
      points: signedPoints,
      description: pointDescription.value.trim() || selectedRule?.description || "Manual entry",
      date: new Date().toISOString()
    });

    saveData(data);
    form.reset();
    pointValue.value = 5;
    populateStudentSelect(studentSelect, data);
    populateRuleSelect(ruleSelect, data);
    drawRows();
  });

  drawRows();
}

function renderStudentsPage(data) {
  const select = document.getElementById("detail-student-select");
  const summary = document.getElementById("student-summary");
  const badgeList = document.getElementById("badge-list");
  const historyList = document.getElementById("history-list");
  if (!select) return;

  populateStudentSelect(select, data);

  const params = new URLSearchParams(window.location.search);
  const idFromQuery = params.get("id");
  if (idFromQuery && data.students.some((s) => s.id === idFromQuery)) {
    select.value = idFromQuery;
  }

  const drawStudent = () => {
    const student = data.students.find((s) => s.id === select.value);
    if (!student) return;

    const score = getStudentScore(data, student.id);
    const status = getStatus(score);
    summary.innerHTML = `
      <strong>${student.name}</strong><br>
      Class: ${student.className}<br>
      Total Score: <strong>${score}</strong><br>
      Status: <span class="badge ${getStatusClass(status)}">${status}</span>
    `;

    const badges = getBadges(score);
    badgeList.innerHTML = badges.length
      ? badges.map((badge) => `<span class="badge achievement">${badge}</span>`).join("")
      : `<span class="badge risk">No badges yet</span>`;

    const history = data.transactions
      .filter((tx) => tx.studentId === student.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    historyList.innerHTML = history.length
      ? history.map((tx) => `<li class="${tx.type}">${new Date(tx.date).toLocaleString()} · ${tx.points > 0 ? "+" : ""}${tx.points} · ${tx.description}</li>`).join("")
      : `<li>No history yet.</li>`;
  };

  select.addEventListener("change", drawStudent);
  drawStudent();
}

function renderRulesPage(data) {
  const tbody = document.getElementById("rules-table-body");
  const form = document.getElementById("rule-form");
  if (!tbody || !form) return;

  const fields = {
    id: document.getElementById("rule-id"),
    name: document.getElementById("rule-name"),
    trigger: document.getElementById("rule-trigger"),
    points: document.getElementById("rule-points"),
    description: document.getElementById("rule-description"),
    active: document.getElementById("rule-active"),
    title: document.getElementById("rule-form-title")
  };

  const drawRules = () => {
    tbody.innerHTML = data.rules.map((r) => `
      <tr>
        <td>${r.name}</td>
        <td>${r.trigger}</td>
        <td>${r.points > 0 ? "+" : ""}${r.points}</td>
        <td>${r.description}</td>
        <td><span class="badge ${r.active ? "excellent" : "risk"}">${r.active ? "Active" : "Inactive"}</span></td>
        <td>
          <button type="button" data-edit="${r.id}">Edit</button>
          <button type="button" data-toggle="${r.id}">${r.active ? "Deactivate" : "Activate"}</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("button[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rule = data.rules.find((r) => r.id === btn.dataset.edit);
        if (!rule) return;
        fields.id.value = rule.id;
        fields.name.value = rule.name;
        fields.trigger.value = rule.trigger;
        fields.points.value = rule.points;
        fields.description.value = rule.description;
        fields.active.checked = rule.active;
        fields.title.textContent = "Edit Rule";
      });
    });

    tbody.querySelectorAll("button[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const rule = data.rules.find((r) => r.id === btn.dataset.toggle);
        if (!rule) return;
        rule.active = !rule.active;
        saveData(data);
        drawRules();
      });
    });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const rulePayload = {
      name: fields.name.value.trim(),
      trigger: fields.trigger.value.trim(),
      points: Number(fields.points.value),
      description: fields.description.value.trim(),
      active: fields.active.checked
    };

    if (fields.id.value) {
      const rule = data.rules.find((r) => r.id === fields.id.value);
      Object.assign(rule, rulePayload);
    } else {
      data.rules.push({ id: uid("rule"), ...rulePayload });
    }

    saveData(data);
    form.reset();
    fields.id.value = "";
    fields.title.textContent = "Add Rule";
    drawRules();
  });

  drawRules();
}

function renderStatsPage(data) {
  if (!window.Chart) return;

  const classTotals = {};
  data.students.forEach((student) => {
    classTotals[student.className] = (classTotals[student.className] || 0) + getStudentScore(data, student.id);
  });

  const meritCount = data.transactions.filter((tx) => tx.points > 0).length;
  const demeritCount = data.transactions.filter((tx) => tx.points < 0).length;

  const topStudents = data.students
    .map((s) => ({ name: s.name, score: getStudentScore(data, s.id) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  new Chart(document.getElementById("classChart"), {
    type: "bar",
    data: {
      labels: Object.keys(classTotals),
      datasets: [{ label: "Total Class Score", data: Object.values(classTotals), backgroundColor: "#4b70e2" }]
    }
  });

  new Chart(document.getElementById("meritChart"), {
    type: "pie",
    data: {
      labels: ["Merits", "Demerits"],
      datasets: [{ data: [meritCount, demeritCount], backgroundColor: ["#2ea86a", "#da4955"] }]
    }
  });

  new Chart(document.getElementById("topChart"), {
    type: "line",
    data: {
      labels: topStudents.map((s) => s.name),
      datasets: [{ label: "Score", data: topStudents.map((s) => s.score), borderColor: "#7b4ee0", tension: 0.3 }]
    }
  });
}

(function init() {
  const data = loadData();
  saveData(data);
  attachReset(data);

  const page = document.body.dataset.page;
  if (page === "dashboard") renderDashboard(data);
  if (page === "students") renderStudentsPage(data);
  if (page === "rules") renderRulesPage(data);
  if (page === "stats") renderStatsPage(data);
})();
