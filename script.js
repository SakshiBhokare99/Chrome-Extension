// ========================================
// Dashboard Layout Requested
// Top: Website Pie Chart
// Middle Left: Productive/Unproductive Summary
// Middle Right: Weekly Report Graph
// ========================================

fetch("http://localhost:3000/api/logs?userId=123")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    if (!data.logs || data.logs.length === 0) {
      throw new Error("No logs found.");
    }

    // -----------------------------
    // Categories
    // -----------------------------
    const productiveSites = [
      "github.com",
      "leetcode.com",
      "stackoverflow.com",
      "chat.openai.com",
      "geeksforgeeks.org",
      "w3schools.com",
      "coursera.org",
      "udemy.com"
    ];

    const unproductiveSites = [
      "youtube.com",
      "instagram.com",
      "facebook.com",
      "twitter.com",
      "x.com",
      "netflix.com"
    ];

    // -----------------------------
    // Last 7 Days
    // -----------------------------
    const today = new Date();
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const weeklyLogs = data.logs.filter(log => {
      return new Date(log.date) >= last7Days;
    });

    // -----------------------------
    // Variables
    // -----------------------------
    const websiteTotals = {};
    const dailyTotals = {
      Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0
    };

    let productiveTotal = 0;
    let unproductiveTotal = 0;

    // -----------------------------
    // Process Logs
    // -----------------------------
    weeklyLogs.forEach(log => {
      const site = new URL(log.url).hostname.replace("www.", "");
      const mins = log.timeSpent / 60;

      websiteTotals[site] = (websiteTotals[site] || 0) + mins;

      const day = new Date(log.date).toLocaleDateString("en-US", {
        weekday: "short"
      });

      dailyTotals[day] += mins;

      if (productiveSites.includes(site)) productiveTotal += mins;
      else if (unproductiveSites.includes(site)) unproductiveTotal += mins;
    });

    // -----------------------------
    // Top 5 Websites
    // -----------------------------
    const topSites = Object.entries(websiteTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = topSites.map(item => item[0]);
    const values = topSites.map(item => item[1].toFixed(2));

    // -----------------------------
    // Layout
    // -----------------------------
    document.body.innerHTML = `
      <h1 style="text-align:center;">📊 Productivity Dashboard</h1>

      <!-- Top Pie Chart -->
      <div style="width:45%; margin:auto;">
        <canvas id="pieChart"></canvas>
      </div>

      <!-- Bottom Two Columns -->
      <div style="
        display:flex;
        justify-content:space-between;
        gap:30px;
        width:90%;
        margin:30px auto;
        flex-wrap:wrap;
      ">

        <!-- Left Summary -->
        <div id="summary" style="
          flex:1;
          min-width:300px;
          padding:20px;
          background:#f8f9fa;
          border-radius:10px;
          box-shadow:0 4px 10px rgba(0,0,0,0.1);
        "></div>

        <!-- Right Weekly Graph -->
        <div style="
          flex:1;
          min-width:300px;
          background:#fff;
          padding:10px;
          border-radius:10px;
        ">
          <canvas id="barChart"></canvas>
        </div>

      </div>
    `;

    // -----------------------------
    // Pie Chart
    // -----------------------------
    new Chart(document.getElementById("pieChart"), {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            "#36A2EB",
            "#FF6384",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF"
          ]
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "🌐  Websites Used"
          },
          legend: {
            position: "bottom"
          }
        }
      }
    });

    // -----------------------------
    // Summary Left Side
    // -----------------------------
    const total = productiveTotal + unproductiveTotal;
    const score = total ? ((productiveTotal / total) * 100).toFixed(1) : 0;

    document.getElementById("summary").innerHTML = `
      <h2> Productive Analysis</h2>
      <p><strong>✅ Productive Time:</strong> ${productiveTotal.toFixed(2)} min</p>
      <p><strong>❌ Unproductive Time:</strong> ${unproductiveTotal.toFixed(2)} min</p>
      <p><strong>⭐ Productivity Score:</strong> ${score}%</p>
      <hr>
      <p>${score >= 60 ? "Great productivity this week!" : "Need more focus this week."}</p>
    `;

    // -----------------------------
    // Weekly Report Right Side
    // -----------------------------
    new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: Object.keys(dailyTotals),
        datasets: [{
          label: "Minutes Used",
          data: Object.values(dailyTotals).map(v => v.toFixed(2)),
          backgroundColor: "#36A2EB"
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "📅 Weekly Usage Report"
          }
        }
      }
    });

  })
  .catch((error) => {
    document.body.innerHTML = `<p style="color:red;">${error.message}</p>`;
  });