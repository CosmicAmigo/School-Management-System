const STORAGE_KEY = "behavitracker-data-v2";

const defaultData = {
  settings: { awardMode: "both" },
  divisions: {
    classes: ["7A", "8B", "9C"],
    streams: ["STEM", "Arts", "Business"],
    teams: ["Falcons", "Lions", "Sharks"]
  },
  teachers: [
    { id: "t1", name: "Ms. Carter", classLead: "7A", active: true },
    { id: "t2", name: "Mr. Kamau", classLead: "8B", active: true },
    { id: "t3", name: "Ms. Ali", classLead: "9C", active: true }
  ],
  students: [
    { id: "s1", name: "Maya Chen", className: "7A", stream: "STEM", team: "Falcons", teacherId: "t1" },
    { id: "s2", name: "Liam Patel", className: "7A", stream: "Arts", team: "Lions", teacherId: "t1" },
    { id: "s3", name: "Ava Johnson", className: "8B", stream: "STEM", team: "Sharks", teacherId: "t2" },
    { id: "s4", name: "Noah Brown", className: "8B", stream: "Business", team: "Falcons", teacherId: "t2" },
    { id: "s5", name: "Sofia Garcia", className: "9C", stream: "Arts", team: "Lions", teacherId: "t3" }
  ],
  rules: [
    { id: "r1", name: "Homework Completed", trigger: "Academic", points: 10, description: "Completed all homework on time", active: true },
    { id: "r2", name: "Helping Others", trigger: "Social", points: 15, description: "Helped classmates respectfully", active: true },
    { id: "r3", name: "Late to Class", trigger: "Punctuality", points: -5, description: "Arrived late without reason", active: true },
    { id: "r4", name: "Disruptive Behaviour", trigger: "Conduct", points: -15, description: "Repeated class disruptions", active: true }
  ],
  transactions: [
    { id: "tx1", studentId: "s1", teacherId: "t1", ruleId: "r1", type: "merit", points: 10, description: "Great effort", date: "2026-02-08T10:00:00Z" },
    { id: "tx2", studentId: "s2", teacherId: "t1", ruleId: "r3", type: "demerit", points: -5, description: "Late arrival", date: "2026-02-08T10:30:00Z" },
    { id: "tx3", studentId: "s3", teacherId: "t2", ruleId: "r2", type: "merit", points: 15, description: "Peer support", date: "2026-02-09T09:00:00Z" },
    { id: "tx4", studentId: "s4", teacherId: "t2", ruleId: "r4", type: "demerit", points: -15, description: "Disrupted lesson", date: "2026-02-09T11:00:00Z" }
  ]
};

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}-${Date.now()}`;
}

function cloneDefaults() {
  return JSON.parse(JSON.stringify(defaultData));
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaults();
  try {
    const parsed = JSON.parse(raw);
    return {
      settings: parsed.settings || cloneDefaults().settings,
      divisions: parsed.divisions || cloneDefaults().divisions,
      teachers: parsed.teachers || [],
      students: parsed.students || [],
      rules: parsed.rules || [],
      transactions: parsed.transactions || []
    };
  } catch {
    return cloneDefaults();
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStudentScore(data, studentId) {
  return data.transactions.filter((tx) => tx.studentId === studentId).reduce((sum, tx) => sum + Number(tx.points), 0);
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

function attachReset() {
  const button = document.getElementById("reset-data");
  if (!button) return;
  button.addEventListener("click", () => {
    if (!window.confirm("Reset all data to defaults?")) return;
    localStorage.removeItem(STORAGE_KEY);
    saveData(cloneDefaults());
    window.location.reload();
  });
}

function populateSelect(select, values, placeholder = null) {
  if (!select) return;
  const first = placeholder ? `<option value="">${placeholder}</option>` : "";
  select.innerHTML = first + values.join("");
}

function teacherLabel(data, teacherId) {
  return data.teachers.find((t) => t.id === teacherId)?.name || "Unassigned";
}

function renderDashboard(data) {
  const classFilter = document.getElementById("class-filter");
  const statusFilter = document.getElementById("status-filter");
  const teamFilter = document.getElementById("team-filter");
  const tbody = document.getElementById("student-table-body");
  const sortButton = document.getElementById("sort-score");

  const form = document.getElementById("points-form");
  const teacherSelect = document.getElementById("teacher-select");
  const studentSelect = document.getElementById("student-select");
  const ruleSelect = document.getElementById("rule-select");
  const pointType = document.getElementById("point-type");
  const pointValue = document.getElementById("point-value");
  const pointDescription = document.getElementById("point-description");
  const modeNote = document.getElementById("award-mode-note");

  const addForm = document.getElementById("teacher-add-student-form");
  const addTeacher = document.getElementById("teacher-add-teacher");
  const addName = document.getElementById("teacher-add-name");
  const addClass = document.getElementById("teacher-add-class");
  const addStream = document.getElementById("teacher-add-stream");
  const addTeam = document.getElementById("teacher-add-team");

  if (!tbody) return;

  const activeTeachers = data.teachers.filter((t) => t.active);
  populateSelect(classFilter, [`<option value="all">All</option>`, ...data.divisions.classes.map((c) => `<option value="${c}">${c}</option>`)]);
  populateSelect(teamFilter, [`<option value="all">All</option>`, ...data.divisions.teams.map((t) => `<option value="${t}">${t}</option>`)]);
  populateSelect(teacherSelect, activeTeachers.map((t) => `<option value="${t.id}">${t.name}</option>`));
  populateSelect(addTeacher, activeTeachers.map((t) => `<option value="${t.id}">${t.name}</option>`));
  populateSelect(addClass, data.divisions.classes.map((c) => `<option value="${c}">${c}</option>`));
  populateSelect(addStream, data.divisions.streams.map((s) => `<option value="${s}">${s}</option>`));
  populateSelect(addTeam, data.divisions.teams.map((t) => `<option value="${t}">${t}</option>`));
  populateSelect(studentSelect, data.students.map((s) => `<option value="${s.id}">${s.name} (${s.className}/${s.stream})</option>`));

  const activeRules = data.rules.filter((r) => r.active);
  populateSelect(ruleSelect, [`<option value="">Manual points</option>`, ...activeRules.map((r) => `<option value="${r.id}">${r.name} (${r.points > 0 ? "+" : ""}${r.points})</option>`)]);

  const mode = data.settings.awardMode || "both";
  modeNote.textContent = `Current mode: ${mode}.`;
  if (mode === "rules") {
    ruleSelect.required = true;
    pointValue.disabled = true;
    pointType.disabled = true;
  }
  if (mode === "free") {
    ruleSelect.disabled = true;
  }

  let scoreSortDesc = true;

  const drawRows = () => {
    const cFilter = classFilter.value;
    const sFilter = statusFilter.value;
    const tFilter = teamFilter.value;

    let rows = data.students.map((student) => {
      const score = getStudentScore(data, student.id);
      const status = getStatus(score);
      return { ...student, score, status };
    });

    rows = rows.filter((row) => (cFilter === "all" || row.className === cFilter)
      && (sFilter === "all" || row.status === sFilter)
      && (tFilter === "all" || row.team === tFilter));
    rows.sort((a, b) => (scoreSortDesc ? b.score - a.score : a.score - b.score));

    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td><a href="students.html?id=${row.id}">${row.name}</a></td>
        <td>${row.className} / ${row.stream}</td>
        <td>${row.team}</td>
        <td>${row.score}</td>
        <td><span class="badge ${getStatusClass(row.status)}">${row.status}</span></td>
      </tr>
    `).join("");
  };

  classFilter.addEventListener("change", drawRows);
  statusFilter.addEventListener("change", drawRows);
  teamFilter.addEventListener("change", drawRows);
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
    const selectedRule = data.rules.find((r) => r.id === ruleSelect.value);
    const manualPoints = Number(pointValue.value);
    const type = pointType.value;

    let signedPoints;
    if (mode === "rules" && selectedRule) {
      signedPoints = selectedRule.points;
    } else {
      signedPoints = type === "merit" ? Math.abs(manualPoints) : -Math.abs(manualPoints);
      if (mode === "rules" && !selectedRule) return;
    }

    data.transactions.push({
      id: uid("tx"),
      studentId: studentSelect.value,
      teacherId: teacherSelect.value,
      ruleId: selectedRule?.id || null,
      type: signedPoints >= 0 ? "merit" : "demerit",
      points: signedPoints,
      description: pointDescription.value.trim() || selectedRule?.description || "Manual entry",
      date: new Date().toISOString()
    });

    saveData(data);
    form.reset();
    pointValue.value = 5;
    drawRows();
  });

  addForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const student = {
      id: uid("s"),
      name: addName.value.trim(),
      className: addClass.value,
      stream: addStream.value,
      team: addTeam.value,
      teacherId: addTeacher.value
    };
    if (!student.name) return;
    data.students.push(student);
    saveData(data);
    addForm.reset();
    populateSelect(studentSelect, data.students.map((s) => `<option value="${s.id}">${s.name} (${s.className}/${s.stream})</option>`));
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

  populateSelect(select, data.students.map((s) => `<option value="${s.id}">${s.name} (${s.className})</option>`));

  const params = new URLSearchParams(window.location.search);
  const idFromQuery = params.get("id");
  if (idFromQuery && data.students.some((s) => s.id === idFromQuery)) select.value = idFromQuery;

  const drawStudent = () => {
    const student = data.students.find((s) => s.id === select.value);
    if (!student) return;

    const score = getStudentScore(data, student.id);
    const status = getStatus(score);
    summary.innerHTML = `
      <strong>${student.name}</strong><br>
      Class: ${student.className} · ${student.stream}<br>
      Team: ${student.team}<br>
      Mentor: ${teacherLabel(data, student.teacherId)}<br>
      Total Score: <strong>${score}</strong><br>
      Status: <span class="badge ${getStatusClass(status)}">${status}</span>
    `;

    const badges = getBadges(score);
    badgeList.innerHTML = badges.length
      ? badges.map((b) => `<span class="badge achievement">${b}</span>`).join("")
      : `<span class="badge risk">No badges yet</span>`;

    const history = data.transactions.filter((tx) => tx.studentId === student.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    historyList.innerHTML = history.length
      ? history.map((tx) => `<li class="${tx.type}">${new Date(tx.date).toLocaleString()} · ${tx.points > 0 ? "+" : ""}${tx.points} · ${tx.description} (${teacherLabel(data, tx.teacherId)})</li>`).join("")
      : "<li>No history yet.</li>";
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
        <td>${r.name}</td><td>${r.trigger}</td><td>${r.points > 0 ? "+" : ""}${r.points}</td>
        <td>${r.description}</td>
        <td><span class="badge ${r.active ? "excellent" : "risk"}">${r.active ? "Active" : "Inactive"}</span></td>
        <td><button type="button" class="btn-ghost" data-edit="${r.id}">Edit</button><button type="button" class="btn-ghost" data-toggle="${r.id}">${r.active ? "Deactivate" : "Activate"}</button></td>
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
    const payload = {
      name: fields.name.value.trim(),
      trigger: fields.trigger.value.trim(),
      points: Number(fields.points.value),
      description: fields.description.value.trim(),
      active: fields.active.checked
    };
    if (fields.id.value) {
      const rule = data.rules.find((r) => r.id === fields.id.value);
      if (rule) Object.assign(rule, payload);
    } else {
      data.rules.push({ id: uid("rule"), ...payload });
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
  const teamRank = document.getElementById("team-ranking");
  const classRank = document.getElementById("class-ranking");
  const classMajority = document.getElementById("class-majority");

  const studentScores = data.students.map((s) => ({ ...s, score: getStudentScore(data, s.id), status: getStatus(getStudentScore(data, s.id)) }));

  const classTotals = {};
  data.divisions.classes.forEach((c) => {
    const items = studentScores.filter((s) => s.className === c);
    classTotals[c] = items.reduce((sum, s) => sum + s.score, 0);
  });

  const meritCount = data.transactions.filter((tx) => tx.points > 0).length;
  const demeritCount = data.transactions.filter((tx) => tx.points < 0).length;

  const topStudents = [...studentScores].sort((a, b) => b.score - a.score).slice(0, 5);

  if (window.Chart) {
    new Chart(document.getElementById("classChart"), {
      type: "bar",
      data: { labels: Object.keys(classTotals), datasets: [{ label: "Total Class Score", data: Object.values(classTotals), backgroundColor: "#4b70e2" }] }
    });

    new Chart(document.getElementById("meritChart"), {
      type: "pie",
      data: { labels: ["Merits", "Demerits"], datasets: [{ data: [meritCount, demeritCount], backgroundColor: ["#2ea86a", "#da4955"] }] }
    });

    new Chart(document.getElementById("topChart"), {
      type: "line",
      data: { labels: topStudents.map((s) => s.name), datasets: [{ label: "Score", data: topStudents.map((s) => s.score), borderColor: "#7b4ee0", tension: 0.3 }] }
    });
  }

  const teamAverages = data.divisions.teams.map((team) => {
    const members = studentScores.filter((s) => s.team === team);
    const avg = members.length ? members.reduce((sum, s) => sum + s.score, 0) / members.length : 0;
    return { team, avg };
  }).sort((a, b) => b.avg - a.avg);

  const classAverages = data.divisions.classes.map((className) => {
    const members = studentScores.filter((s) => s.className === className);
    const avg = members.length ? members.reduce((sum, s) => sum + s.score, 0) / members.length : 0;
    return { className, avg };
  }).sort((a, b) => b.avg - a.avg);

  const majorityStatuses = data.divisions.classes.map((className) => {
    const members = studentScores.filter((s) => s.className === className);
    const counts = { Excellent: 0, Watch: 0, "At Risk": 0 };
    members.forEach((m) => { counts[m.status] += 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { className, status: top?.[0] || "N/A", count: top?.[1] || 0, total: members.length };
  });

  teamRank.innerHTML = teamAverages.map((t) => `<li>${t.team}: ${t.avg.toFixed(1)}</li>`).join("");
  classRank.innerHTML = classAverages.map((c) => `<li>${c.className}: ${c.avg.toFixed(1)}</li>`).join("");
  classMajority.innerHTML = majorityStatuses.map((c) => `<li>${c.className}: ${c.status} (${c.count}/${c.total})</li>`).join("");
}

function renderAdminPage(data) {
  const modeForm = document.getElementById("mode-form");
  const pointMode = document.getElementById("point-mode");
  pointMode.value = data.settings.awardMode || "both";
  modeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    data.settings.awardMode = pointMode.value;
    saveData(data);
    alert("Mode saved.");
  });

  const teacherForm = document.getElementById("teacher-form");
  const teacherBody = document.getElementById("teachers-table-body");
  const tId = document.getElementById("teacher-id");
  const tName = document.getElementById("teacher-name");
  const tClass = document.getElementById("teacher-class");
  const tActive = document.getElementById("teacher-active");

  const drawTeachers = () => {
    teacherBody.innerHTML = data.teachers.map((t) => `
      <tr>
        <td>${t.name}</td><td>${t.classLead || "-"}</td>
        <td><span class="badge ${t.active ? "excellent" : "risk"}">${t.active ? "Active" : "Inactive"}</span></td>
        <td><button type="button" class="btn-ghost" data-edit="${t.id}">Edit</button><button type="button" class="btn-ghost" data-toggle="${t.id}">${t.active ? "Deactivate" : "Activate"}</button></td>
      </tr>
    `).join("");

    teacherBody.querySelectorAll("button[data-edit]").forEach((btn) => btn.addEventListener("click", () => {
      const teacher = data.teachers.find((t) => t.id === btn.dataset.edit);
      if (!teacher) return;
      tId.value = teacher.id;
      tName.value = teacher.name;
      tClass.value = teacher.classLead || "";
      tActive.checked = teacher.active;
    }));

    teacherBody.querySelectorAll("button[data-toggle]").forEach((btn) => btn.addEventListener("click", () => {
      const teacher = data.teachers.find((t) => t.id === btn.dataset.toggle);
      if (!teacher) return;
      teacher.active = !teacher.active;
      saveData(data);
      drawTeachers();
    }));
  };

  teacherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = { name: tName.value.trim(), classLead: tClass.value.trim(), active: tActive.checked };
    if (!payload.name) return;
    if (tId.value) {
      const teacher = data.teachers.find((t) => t.id === tId.value);
      if (teacher) Object.assign(teacher, payload);
    } else {
      data.teachers.push({ id: uid("teacher"), ...payload });
    }
    saveData(data);
    teacherForm.reset();
    tId.value = "";
    drawTeachers();
  });

  const setupDivisionManager = (formId, inputId, listId, field) => {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    const draw = () => {
      list.innerHTML = data.divisions[field].map((name) => `<li>${name}<button type="button" data-remove="${name}">×</button></li>`).join("");
      list.querySelectorAll("button[data-remove]").forEach((btn) => btn.addEventListener("click", () => {
        data.divisions[field] = data.divisions[field].filter((item) => item !== btn.dataset.remove);
        saveData(data);
        draw();
      }));
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value || data.divisions[field].includes(value)) return;
      data.divisions[field].push(value);
      saveData(data);
      form.reset();
      draw();
    });

    draw();
  };

  setupDivisionManager("class-form", "class-input", "class-list", "classes");
  setupDivisionManager("stream-form", "stream-input", "stream-list", "streams");
  setupDivisionManager("team-form", "team-input", "team-list", "teams");

  const studentsBody = document.getElementById("admin-students-body");
  const drawStudents = () => {
    studentsBody.innerHTML = data.students.map((s) => `
      <tr>
        <td>${s.name}</td><td>${s.className}</td><td>${s.stream}</td><td>${s.team}</td><td>${teacherLabel(data, s.teacherId)}</td>
        <td><button type="button" class="btn-ghost" data-cycle="${s.id}">Cycle Team</button><button type="button" class="btn-ghost" data-remove="${s.id}">Remove</button></td>
      </tr>
    `).join("");

    studentsBody.querySelectorAll("button[data-cycle]").forEach((btn) => btn.addEventListener("click", () => {
      const student = data.students.find((s) => s.id === btn.dataset.cycle);
      if (!student || !data.divisions.teams.length) return;
      const idx = data.divisions.teams.indexOf(student.team);
      student.team = data.divisions.teams[(idx + 1) % data.divisions.teams.length];
      saveData(data);
      drawStudents();
    }));

    studentsBody.querySelectorAll("button[data-remove]").forEach((btn) => btn.addEventListener("click", () => {
      data.students = data.students.filter((s) => s.id !== btn.dataset.remove);
      data.transactions = data.transactions.filter((t) => t.studentId !== btn.dataset.remove);
      saveData(data);
      drawStudents();
    }));
  };

  drawTeachers();
  drawStudents();
}

(function init() {
  const data = loadData();
  saveData(data);
  attachReset();

  const page = document.body.dataset.page;
  if (page === "dashboard") renderDashboard(data);
  if (page === "students") renderStudentsPage(data);
  if (page === "rules") renderRulesPage(data);
  if (page === "stats") renderStatsPage(data);
  if (page === "admin") renderAdminPage(data);
})();
