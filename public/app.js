const busSelect = (select, buses, label = "Select a bus…") => {
  select.innerHTML =
    `<option value="">${label}</option>` +
    buses.map((bus) =>
      `<option value="${bus.bus_no}">
        ${bus.bus_no} — ${bus.source} to ${bus.destination}
      </option>`
    ).join("");
};

async function getBuses() {
  const response = await fetch("/buses");

  if (!response.ok) {
    throw new Error("Unable to load buses from the database.");
  }

  return response.json();
}

function showMessage(message, error = false) {
  const status = document.querySelector("#status");

  if (!status) return;

  status.textContent = message;
  status.className = error ? "status error" : "status";
}

async function loadDropdown(id) {
  const select = document.querySelector(id);

  if (!select) return [];

  try {
    const buses = await getBuses();

    busSelect(
      select,
      buses,
      buses.length ? "Select a bus…" : "No buses available"
    );

    return buses;
  } catch (error) {
    select.innerHTML = '<option value="">Unable to load buses</option>';
    showMessage(error.message, true);
    return [];
  }
}

async function setupList() {
  const table = document.querySelector("#bus-table");

  try {
    const buses = await getBuses();

    await loadDropdown("#list-select");

    table.innerHTML = buses.map((bus) => `
      <tr>
        <td>${bus.bus_no}</td>
        <td>${bus.source}</td>
        <td>${bus.destination}</td>
        <td>${bus.time_of_departure}</td>
        <td>${bus.total_no_of_seats}</td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function setupOne() {
  const select = document.querySelector("#bus-select");

  await loadDropdown("#bus-select");

  select.addEventListener("change", async () => {
    const result = document.querySelector("#bus-result");

    result.innerHTML = "";

    if (!select.value) return;

    const response = await fetch(
      `/buses/${encodeURIComponent(select.value)}`
    );

    const buses = await response.json();

    if (!buses.length) {
      result.textContent = "Bus not found.";
      return;
    }

    const bus = buses[0];

    result.innerHTML = `
      <h3>Bus ${bus.bus_no}</h3>
      <p><b>Route:</b> ${bus.source} → ${bus.destination}</p>
      <p><b>Departure:</b> ${bus.time_of_departure}</p>
      <p><b>Total seats:</b> ${bus.total_no_of_seats}</p>
    `;
  });
}

function setupInsert() {
  document.querySelector("#bus-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const body = {
      busNo: document.querySelector("#bus-no").value,
      source: document.querySelector("#source").value,
      destination: document.querySelector("#destination").value,
      timeOfDeparture: document.querySelector("#departure").value,
      totalNoOfSeats: document.querySelector("#seats").value
    };

    const response = await fetch("/buses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    showMessage(await response.text(), !response.ok);

    if (response.ok) {
      event.target.reset();
    }
  });
}

async function setupUpdate() {
  const select = document.querySelector("#bus-select");

  await loadDropdown("#bus-select");

  select.addEventListener("change", async () => {
    if (!select.value) return;

    const response = await fetch(
      `/buses/${encodeURIComponent(select.value)}`
    );

    const buses = await response.json();
    const bus = buses[0];

    if (!bus) return;

    document.querySelector("#source").value = bus.source;
    document.querySelector("#destination").value = bus.destination;
    document.querySelector("#departure").value = bus.time_of_departure;
    document.querySelector("#seats").value = bus.total_no_of_seats;

    document.querySelector("#bus-form").hidden = false;
  });

  document.querySelector("#bus-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const body = {
      source: document.querySelector("#source").value,
      destination: document.querySelector("#destination").value,
      timeOfDeparture: document.querySelector("#departure").value,
      totalNoOfSeats: document.querySelector("#seats").value
    };

    const response = await fetch(
      `/buses/${encodeURIComponent(select.value)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    showMessage(await response.text(), !response.ok);
  });
}

async function setupDelete() {
  const select = document.querySelector("#bus-select");

  await loadDropdown("#bus-select");

  document.querySelector("#delete-button").addEventListener("click", async () => {
    if (!select.value) {
      showMessage("Select a bus first.", true);
      return;
    }

    if (!confirm(`Delete bus ${select.value}?`)) return;

    const response = await fetch(
      `/buses/${encodeURIComponent(select.value)}`,
      {
        method: "DELETE"
      }
    );

    showMessage(await response.text(), !response.ok);

    if (response.ok) {
      await loadDropdown("#bus-select");
    }
  });
}

const page = document.body.dataset.page;

if (page === "list") setupList();
if (page === "one") setupOne();
if (page === "insert") setupInsert();
if (page === "update") setupUpdate();
if (page === "delete") setupDelete();