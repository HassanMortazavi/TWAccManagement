// --- Village Data ---
var player_id = 11403285;
var VILLAGE_TIME = 'mapVillageTime'; 
var VILLAGES_LIST = 'mapVillagesList'; 
var TIME_INTERVAL = 60 * 60 * 1000; /*refresh map every 1 hour*/
var villages = [];
var barbarians = [];
var my_villages = [];

function fetchVillagesData() {
    $.get('https://en145.tribalwars.net/map/village.txt', function (data) {
        villages = CSVToArray(data);
        localStorage.setItem(VILLAGE_TIME, Date.parse(new Date()));
        localStorage.setItem(VILLAGES_LIST, data);
    })
        .done(function () {
            findOwnandBarbarianVillages();
        })
        .fail(function (error) {
            console.error(`${scriptInfo()} Error:`, error);
        });
}

function findOwnandBarbarianVillages() {
    villages.forEach((village) => {
        if (village[4] == '0') {
            barbarians.push(village);
        }else if (village[4] == player_id){
			my_villages.push(village);
		}
    });
}

function CSVToArray(strData, strDelimiter) {
    strDelimiter = strDelimiter || ',';
    var objPattern = new RegExp(
        '(\\' +
            strDelimiter +
            '|\\r?\\n|\\r|^)' +
            '(?:"([^"]*(?:""[^"]*)*)"|' +
            '([^"\\' +
            strDelimiter +
            '\\r\\n]*))',
        'gi'
    );
    var arrData = [[]];
    var arrMatches = null;
    while ((arrMatches = objPattern.exec(strData))) {
        var strMatchedDelimiter = arrMatches[1];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {
            arrData.push([]);
        }
        var strMatchedValue;

        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
        } else {
            strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    return arrData;
}

function checkMap(){
	if (localStorage.getItem(VILLAGES_LIST) != null) {
		var mapVillageTime = parseInt(localStorage.getItem(VILLAGE_TIME));
		var data = localStorage.getItem(VILLAGES_LIST);
		villages = CSVToArray(data);
		findOwnandBarbarianVillages();
		if (Date.parse(new Date()) >= mapVillageTime + TIME_INTERVAL) {
			/* hour has passed, refetch village.txt*/
			fetchVillagesData();
		} 
	} else {
		fetchVillagesData();
	}
}

    
    for (let i = 1; i <= 2000; i++) {
      const villageNumber = i.toString().padStart(4, '0');
      villages.push({
        id: i,
        name: `${villageNumber} Noble`,
        coordinates: `${525 + i % 100}|${675 + i % 100}`,
        someSetting: `Setting ${i}`
      });
    }
    
    // Populate datalist for Source Village in Command Form
    function populateVillageOptions() {
      const datalist = document.getElementById("villageOptions");
      datalist.innerHTML = "";
      villages.forEach(village => {
        const option = document.createElement("option");
        option.value = village.name;
        datalist.appendChild(option);
      });
    }
    populateVillageOptions();
    
    // --- Village Manager Section ---
    let filteredVillages = villages.slice(); // Start with full list
    const villageMenuEl = document.getElementById('villageMenu');
    const villageDetailsEl = document.getElementById('villageDetails');
    const villageSearchInput = document.getElementById('villageSearch');
    
    function renderVillageMenu(list) {
      villageMenuEl.innerHTML = '';
      list.forEach(village => {
        const item = document.createElement('div');
        item.className = 'village-item';
        // نمایش نام ویلیج به همراه مختصات در پرانتز
        item.textContent = `${village.name} (${village.coordinates})`;
        item.onclick = () => loadVillageDetails(village.id);
        villageMenuEl.appendChild(item);
      });
    }
    
    function loadVillageDetails(villageId) {
      const village = villages.find(v => v.id === villageId);
      if (!village) return;
      
      villageDetailsEl.innerHTML = `
        <h2>${village.name} Settings</h2>
        <form id="villageForm">
          <div class="detail-group">
            <label for="villageName">Village Name</label>
            <input type="text" id="villageName" name="villageName" value="${village.name}">
          </div>
          <div class="detail-group">
            <label for="coordinates">Coordinates</label>
            <input type="text" id="coordinates" name="coordinates" value="${village.coordinates}">
          </div>
          <div class="detail-group">
            <label for="someSetting">Specific Setting</label>
            <input type="text" id="someSetting" name="someSetting" value="${village.someSetting}">
          </div>
          <button type="submit" class="btn">Save Changes</button>
        </form>
      `;
      
      document.getElementById('villageForm').addEventListener('submit', function(e) {
        e.preventDefault();
        village.name = document.getElementById('villageName').value;
        village.coordinates = document.getElementById('coordinates').value;
        village.someSetting = document.getElementById('someSetting').value;
        alert('Village settings saved!');
        renderVillageMenu(filteredVillages);
      });
    }
    
    villageSearchInput.addEventListener('input', function() {
      const query = villageSearchInput.value.trim().toLowerCase();
      filteredVillages = villages.filter(village => village.name.toLowerCase().includes(query));
      renderVillageMenu(filteredVillages);
    });
    
    renderVillageMenu(filteredVillages);
    
    // --- Scheduled Commands Section ---
    let commands = [];
    const commandForm = document.getElementById("commandForm");
    const commandTableBody = document.querySelector("#commandTable tbody");
    
    commandForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const sourceVillage = document.getElementById("sourceVillage").value;
      const targetCoordinates = document.getElementById("targetCoordinates").value;
      const commandDateTime = document.getElementById("commandDateTime").value;
      const commandMilliseconds = document.getElementById("commandMilliseconds").value || "0";
      const commandType = document.getElementById("commandType").value;
      const unitCount = document.getElementById("unitCount").value;
      
      // ترکیب زمان تاریخ و میلی ثانیه به صورت یک رشته
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