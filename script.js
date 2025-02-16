// --- Village Data ---
var player_id = 11403285;
var VILLAGE_TIME = 'mapVillageTime'; 
var VILLAGES_LIST = 'mapVillagesList'; 
var TIME_INTERVAL = 60 * 60 * 1000; // Refresh map every 1 hour
var villages = [];
var barbarians = [];
var my_villages = [];

function fetchVillagesData() {
    $.get('/village.txt', function (data) {
        alert("raftam too");
        localStorage.setItem(VILLAGE_TIME, Date.now());
        localStorage.setItem(VILLAGES_LIST, data);
        processVillagesData(data);
    }).fail(function (error) {
        alert("error");
        console.error("Error fetching village data:", error);
        alert("Error fetching village data: " + error);
    });
}

function processVillagesData(data) {
    alert("processVillagesData");
    villages = CSVToArray(data);
    barbarians = [];
    my_villages = [];

    villages.forEach(village => {
        if (village[4] === '0') {
            barbarians.push(village);
        } else if (village[4] == player_id) {
            my_villages.push(village);
        }
    });
    
    populateVillageOptions();
    renderVillageMenu(my_villages);
}

function CSVToArray(data) {
    return data.trim().split("\n").map(row => row.split(","));
}

function checkMap() {
    let cachedData = localStorage.getItem(VILLAGES_LIST);
    let lastFetchTime = parseInt(localStorage.getItem(VILLAGE_TIME) || "0");

    if (cachedData && Date.now() < lastFetchTime + TIME_INTERVAL) {
        processVillagesData(cachedData);
    } else {
        fetchVillagesData();
    }
}

// Populate datalist for Source Village in Command Form
function populateVillageOptions() {
    const datalist = document.getElementById("villageOptions");
    datalist.innerHTML = "";
    
    my_villages.forEach(village => {
        const option = document.createElement("option");
        option.value = village[1]; // Village name
        datalist.appendChild(option);
    });
}

// --- Village Manager Section ---
let filteredVillages = [];
const villageMenuEl = document.getElementById('villageMenu');
const villageDetailsEl = document.getElementById('villageDetails');
const villageSearchInput = document.getElementById('villageSearch');

function renderVillageMenu(list) {
    villageMenuEl.innerHTML = '';
    list.forEach(village => {
        const item = document.createElement('div');
        item.className = 'village-item';
        item.textContent = `${village[1]} (${village[2]})`;
        item.onclick = () => loadVillageDetails(village[0]);
        villageMenuEl.appendChild(item);
    });
}

function loadVillageDetails(villageId) {
    const village = my_villages.find(v => v[0] === villageId);
    if (!village) return;

    villageDetailsEl.innerHTML = `
        <h2>${village[1]} Settings</h2>
        <form id="villageForm">
          <div class="detail-group">
            <label for="villageName">Village Name</label>
            <input type="text" id="villageName" value="${village[1]}">
          </div>
          <div class="detail-group">
            <label for="coordinates">Coordinates</label>
            <input type="text" id="coordinates" value="${village[2]}">
          </div>
          <div class="detail-group">
            <label for="someSetting">Specific Setting</label>
            <input type="text" id="someSetting" value="Default Value">
          </div>
          <button type="submit" class="btn">Save Changes</button>
        </form>
    `;

    document.getElementById('villageForm').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Village settings saved!');
        renderVillageMenu(my_villages);
    });
}

villageSearchInput.addEventListener('input', function () {
    const query = villageSearchInput.value.trim().toLowerCase();
    filteredVillages = my_villages.filter(village => village[1].toLowerCase().includes(query));
    renderVillageMenu(filteredVillages);
});

// --- Scheduled Commands Section ---
let commands = [];
const commandForm = document.getElementById("commandForm");
const commandTableBody = document.querySelector("#commandTable tbody");

commandForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const sourceVillage = document.getElementById("sourceVillage").value;
    const targetCoordinates = document.getElementById("targetCoordinates").value;
    const commandDateTime = document.getElementById("commandDateTime").value;
    const commandMilliseconds = document.getElementById("commandMilliseconds").value || "0";
    const commandType = document.getElementById("commandType").value;
    const unitCount = document.getElementById("unitCount").value;

    const fullDateTime = commandDateTime + "." + commandMilliseconds;

    const command = {
        id: Date.now(),
        sourceVillage,
        targetCoordinates,
        commandDateTime: fullDateTime,
        commandType,
        unitCount
    };

    commands.push(command);
    renderCommandTable();
    commandForm.reset();
});

function renderCommandTable() {
    commandTableBody.innerHTML = "";
    commands.forEach(cmd => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cmd.sourceVillage}</td>
          <td>${cmd.targetCoordinates}</td>
          <td>${cmd.commandDateTime}</td>
          <td>${cmd.commandType}</td>
          <td>${cmd.unitCount}</td>
          <td><button onclick="deleteCommand(${cmd.id})" class="btn">Delete</button></td>
        `;
        commandTableBody.appendChild(tr);
    });
}

function deleteCommand(id) {
    commands = commands.filter(cmd => cmd.id !== id);
    renderCommandTable();
}

checkMap();