document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Unauthorized! Please log in.");
        window.location.href = "login.html";
        return;
    }

    await fetchUserRole();
    fetchMaterials();

    // ✅ Logout Button
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            const confirmLogout = confirm("Are you sure you want to leave? 😢 We'll miss you!");
            if (confirmLogout) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }
        });
    }
});

let userRole = null;

// ✅ Fetch User Role (Admin/Student)
async function fetchUserRole() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/auth/me", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        userRole = data.role?.toLowerCase();

        if (userRole === "admin") {
            document.getElementById("uploadSection").style.display = "block";
        } else {
            document.getElementById("materialsListContainer").classList.add("student-view");
        }
    } catch (error) {
        console.error("❌ Error fetching user role:", error);
        alert("Error fetching user role");
    }
}

// ✅ Fetch Study Materials
async function fetchMaterials() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/materials/view", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const responseData = await response.json();
        const materials = responseData.materials || responseData;

        const materialsList = document.getElementById("materialsList");
        materialsList.innerHTML = "";

        materials.forEach(material => {
            const li = document.createElement("li");
            li.className = "material-card";
            li.innerHTML = `
                <strong>${material.title}</strong><br>
                📚 ${material.subject} | 📅 Semester: ${material.semester} <br>
                <button onclick="downloadMaterial('${material._id}', '${material.fileName}')">⬇ Download</button>
            `;
            materialsList.appendChild(li);
        });
    } catch (error) {
        console.error("❌ Error fetching materials:", error);
        alert("Error fetching materials");
    }
}

// ✅ Download Material
async function downloadMaterial(materialId, fileName) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/materials/download/${materialId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        fileName = fileName?.trim() || "study_material";
        if (!fileName.toLowerCase().endsWith(".pdf")) fileName += ".pdf";

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("❌ Download Error:", error);
        alert(error.message);
    }
}

// ✅ Upload Material (For Admins)
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("titleInput").value;
    const subject = document.getElementById("subjectInput").value;
    const semester = document.getElementById("semesterInput").value;
    const file = document.getElementById("fileInput").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("semester", semester);
    formData.append("file", file);

    try {
        const res = await fetch("http://localhost:5000/api/materials/upload", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            alert("Upload successful!");
            location.reload(); // or fetch and display materials again
        } else {
            alert("Upload failed: " + data.msg);
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert("Something went wrong!");
    }
});