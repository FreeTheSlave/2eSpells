// Make table
var table;
spellTable();
async function spellTable(){
    const wizard = await fetch('json/wizard.json')
    let wizardData = await wizard.json();
    const cleric = await fetch('json/cleric.json')
    let clericData = await cleric.json();


    // Determines default sort (i.e. initial sort and base for header sorts)
    let jsonData = wizardData.concat(clericData).sort(function(a, b){
        if(a.level != b.level){
            return a.level - b.level;
        } else if(a.name != b.name){
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if(a.school != b.school){
            return a.school.localeCompare(b.school);
        } else if(a.class != b.class){
            return (a.class.localeCompare(b.class));
        }
    });

    table = new Tabulator("#list", {
        data:jsonData, // Assign data to table
        height:"100%",
        layout:"fitData",
        columns:[
            {title:"Lvl", field:"level", sorter:"number"},
            {title:"Name", field:"name", sorter:"alphanum"},
            {title:"School", field:"school", sorter:"alphanum"},
            {title:"Class", field:"class", sorter:"alphanum"}
        ]
    });
    
    table.on("rowClick", function(e, row){drawInfoBox(e, row)});
}


// Draw info box
function drawInfoBox(e, row){
    var spacing = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
    var data = row.getData();

    document.getElementById("Name").innerHTML = data.name;
    document.getElementById("Source").innerHTML = "[" + data.source + "]";

    // Level, School, Sphere
    var sphereString = "";
    var spheres = data.spheres;
    if(spheres != null){
        sphereString += " ["
        for(var i = 0; i < spheres.length - 1; i++){
            sphereString += (spheres[i] + ", ");
        }
        sphereString += (spheres[spheres.length - 1] + "]");
    }

    document.getElementById("Level&School&Sphere").innerHTML = "Level " + data.level + " " + data.school + sphereString + spacing;

    // Casting time, Range, AOE, Save
    document.getElementById("CastingTime").innerHTML = "<strong>Casting Time:</strong> " + data.castingTime + spacing;
    document.getElementById("Range").innerHTML = "<strong>Range:</strong> " + data.range;
    document.getElementById("AOE").innerHTML = "<strong>Area:</strong> " + data.aoe + spacing;
    document.getElementById("Save").innerHTML = "<strong>Save:</strong> " + data.save;

    // Components
    var componentString = "<strong>Components:</strong> ";
    if(data.verbal){
        componentString += "V";
        if(data.somatic || data.material){
            componentString += ", ";
        }
    }
    if(data.somatic){
        componentString += "S";
        if(data.material){
            componentString += ", ";
        }
    }
    if(data.material){
        componentString += "M";
    }
    if(data.materials != ""){
        componentString += " (" + data.materials + ")";
    }

    document.getElementById("Components").innerHTML = componentString + spacing;

    // Duration
    document.getElementById("Duration").innerHTML = "<strong>Duration:</strong> " + data.duration;

    // Description
    description = document.getElementById("Description");
    description.style.borderTop = "2px solid #d29a38";
    description.innerText = data.description;

    // Errata/Rulings
    if(data.errata != null){
        errata = document.getElementById("Errata");
        errata.style.borderTop = "2px solid #d29a38";
        errata.innerHTML = "<strong>Errata: </strong> " + data.errata.replaceAll("\n", "<br>");
    } else{
        errata = document.getElementById("Errata");
        errata.style.borderTop = null;
        errata.innerText = null;
    }
}

// Javascript % doesn't work as desired with negative numbers.
function mod(n, m){
    return ((n % m) + m) % m;
}

// Generating HTML

// Add button to element.
function appendButton(base, type, text){
    const button = document.createElement("button");
    button.appendChild(document.createTextNode(text));
    button.id = text;
    button.classList.add(type);
    button.classList.add("styledButton");
    base.appendChild(button);

    return button;
}

// Add cell to row.
function appendCell(row, type, text){
    const td = row.insertCell();
    td.classList.add(type);
    td.appendChild(document.createTextNode(text));
}

// Gray/Blue/Red colors
var buttonColors = ["rgb(24, 26, 27)", "rgb(51, 122, 183)", "rgb(138, 26, 27)"];

// Sphere Gray/Light-Blue/Blue colors
var sphereColors = ["rgb(24, 26, 27)", "rgb(51, 122, 183)", "rgb(147, 168, 184)"];

// Name filter
document.getElementById("name-filter").addEventListener("keyup", updateFilter);

// Class button listeners
var classButtons = document.getElementsByClassName("classButton");
for(var i = 0; i < classButtons.length; i++){
    classButtons[i].addEventListener("click", function(){ leftClickBinary(this) });
    classButtons[i].addEventListener("contextmenu", function(e){ rightClickBinary(e, this) });
}

// Specialist buttons
var specialistButtons = [];
var specialistNames = ["Abjurer", "Conjurer", "Diviner", "Enchanter", "Illusionist", "Invoker", "Necromancer", "Transmuter"];
var tr = document.getElementById("specialist-table").insertRow();
appendCell(tr, "nameCell", "Specialist");
for(let i = 0; i < specialistNames.length; i++){
    specialistButtons[i] = appendButton(tr.insertCell(), "specialistButton", specialistNames[i])

    specialistButtons[i].addEventListener("click", function(){
        this.value++;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];

        specialistUpdate(this);
    });

    specialistButtons[i].addEventListener("contextmenu", function(e){
        e.preventDefault();
        this.value--;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];

        specialistUpdate(this);
    });
}

// 0 = don't care, 1 = include, 2 = exclude
// Abjuration/Alteration/Conjuration/Divination/Enchantment/Evocation/Illusion/Necromancy
var specialistFilterArray = [
    [0, 2, 0, 0, 0, 0, 2, 0], // Abjurer
    [0, 0, 0, 2, 0, 2, 0, 0], // Conjurer
    [0, 0, 2, 0, 0, 0, 0, 0], // Diviner
    [0, 0, 0, 0, 0, 2, 0, 2], // Enchanter
    [2, 0, 0, 0, 0, 2, 0, 2], // Illusionist
    [0, 0, 2, 0, 2, 0, 0, 0], // Invoker
    [0, 0, 0, 0, 2, 0, 2, 0], // Necromancer
    [2, 0, 0, 0, 0, 0, 0, 2]  // Transmuter
];

function specialistUpdate(element){
    value = element.value;
    clearButtons();
    setButton(element, buttonColors, value);
    setButton(classButtons[1], buttonColors, value);

    var index = element.parentNode.cellIndex - 1;
    if(value == 1){
        for(let i = 0; i < schoolButtons.length; i++){
            schoolButtons[i].value = specialistFilterArray[index][i];
            schoolButtons[i].style.backgroundColor = buttonColors[schoolButtons[i].value];
        }
    }
    
    updateFilter();
}

// Source buttons
var sourceButtons = [];
var sourceNames = ["PHB", "ToM", "S&M", "Koibu", "Divan"];
tr = document.getElementById("source-table").insertRow();
appendCell(tr, "nameCell", "Source");
for(let i = 0; i < sourceNames.length; i++){
    sourceButtons[i] = appendButton(tr.insertCell(), "sourceButton", sourceNames[i]);

    sourceButtons[i].addEventListener("click", function(){ leftClickTrinary(this) });
    sourceButtons[i].addEventListener("contextmenu", function(e){ rightClickTrinary(e, this) });
}


// Level buttons
var lvlButtons = [];
tr = document.getElementById("lvl-table").insertRow();
for(let i = 1; i <= 9; i++){
    lvlButtons[i - 1] = appendButton(tr.insertCell(), "lvlButton", i);
    
    lvlButtons[i - 1].addEventListener("click", function(){ leftClickBinary(this) });
    lvlButtons[i - 1].addEventListener("contextmenu", function(e){ rightClickBinary(e, this) });
}

// School buttons
var schoolButtons = [];
var schoolNames = ["Abjuration", "Alteration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy"];
tr = document.getElementById("school-table").insertRow();
appendCell(tr, "nameCell", "School");
for(let i = 0; i < schoolNames.length; i++){
    schoolButtons[i] = appendButton(tr.insertCell(), "schoolButton", schoolNames[i]);

    schoolButtons[i].addEventListener("click", function(){ leftClickTrinary(this) });
    schoolButtons[i].addEventListener("contextmenu", function(e){ rightClickTrinary(e, this) });
}

// Sphere buttons
var sphereNames = ["All", "Animal", "Astral", "Chaos", "Charm", "Combat", "Creation", "Divination", "Air", "Earth", "Fire", "Water", "Guardian", "Healing", "Law", "Necromantic", "Numbers", "Plant", "Protection", "Summoning", "Sun", "Thought", "Time", "Travelers", "War", "Wards", "Weather"];
tr = document.getElementById("sphere-table").insertRow();
for(let i = 0; i < sphereNames.length; i++){
    appendButton(tr.insertCell(), "sphereButton", sphereNames[i]);
}

// Sphere button listeners
var sphereButtons = document.getElementsByClassName("sphereButton");
for(var i = 0; i < sphereButtons.length; i++){
    sphereButtons[i].addEventListener("click", function(){ leftClickGradient(this) });
    sphereButtons[i].addEventListener("contextmenu", function(e){ rightClickGradient(e, this) });
}

// Sphere button listeners 2
var sphereButtons2 = document.getElementsByClassName("sphereButton");
for(var i = 0; i < sphereButtons2.length; i++){
    sphereButtons2[i].addEventListener("click", function(){ leftClickGradient(this) });
    sphereButtons2[i].addEventListener("contextmenu", function(e){ rightClickGradient(e, this) });
}

// Sphere button listeners 3
var sphereButtons3 = document.getElementsByClassName("sphereButton");
for(var i = 0; i < sphereButtons2.length; i++){
    sphereButtons3[i].addEventListener("click", function(){ leftClickGradient(this) });
    sphereButtons3[i].addEventListener("contextmenu", function(e){ rightClickGradient(e, this) });
}

// Shpere Button listener fix for the Sphere Filtering
var sphereButtons = document.getElementsByClassName("sphereButton");
for(var i = 0; i < sphereButtons.length; i++){
    sphereButtons[i].addEventListener("click", function(){ leftClickGradient(this) });
    sphereButtons[i].addEventListener("contextmenu", function(e){ rightClickGradient(e, this) });
}



// God buttons
var godNames = ["Kialeth", "Mirvena", "Fel'Umbra"];

tr = document.getElementById("deity-table").insertRow();
for(let i = 0; i < 3; i++){
    appendButton(tr.insertCell(), "godButton", godNames[i]);
}

// God button listeners
var godButtons = document.getElementsByClassName("godButton");
for(var i = 0; i < godButtons.length; i++){
    godButtons[i].addEventListener("click", function(){
        this.value++;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate(this);
    });

    godButtons[i].addEventListener("contextmenu", function(e){
        e.preventDefault();
        this.value--;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate(this);
    });
}

// 0 = N/A, 1 = major, 2 = minor
// All/Animal/Astral/Chaos/Charm/Combat/Creation/Divination/Air/Earth/Fire/Water/Guardian/Healing/Law/Necromantic/Numbers/Plant/Protection/Summoning/Sun/Thought/Time/Travelers/War/Wards/Weather
var godFilterArray = [
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0], // Kaileth
    [1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1], // Mirvena
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1], // Fel'Umbra
];

function godUpdate(element){
    value = element.value;
    clearButtons();
    setButton(element, buttonColors, value);
    setButton(classButtons[0], buttonColors, value);

    var index = godNames.indexOf(element.id);
    if(value == 1){
        for(var i = 0; i < sphereButtons.length; i++){
            sphereButtons[i].value = godFilterArray[index][i];
            sphereButtons[i].style.backgroundColor = sphereColors[sphereButtons[i].value];
        }
    }
    
    updateFilter();
}

// God buttons
var godNames2 = ["Asheutal"];


tr = document.getElementById("mono-table").insertRow();
for(let i = 0; i < 1; i++){
    appendButton(tr.insertCell(), "godButton2", godNames2[i]);
}

// God button listeners
var godButtons2 = document.getElementsByClassName("godButton2");
for(var i = 0; i < godButtons2.length; i++){
    godButtons2[i].addEventListener("click", function(){0.
        this.value++;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate2(this);
    });

    godButtons2[i].addEventListener("contextmenu", function(e){
        e.preventDefault();
        this.value--;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate2(this);
    });
}

// 0 = N/A, 1 = major, 2 = minor
// All/Animal/Astral/Chaos/Charm/Combat/Creation/Divination/Air/Earth/Fire/Water/Guardian/Healing/Law/Necromantic/Numbers/Plant/Protection/Summoning/Sun/Thought/Time/Travelers/War/Wards/Weather
var godFilterArray2 = [
    [1, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 1, 0], // Asheutal
];

function godUpdate2(element){
    value = element.value;
    clearButtons();
    setButton3(element, buttonColors, value);
    setButton3(classButtons[0], buttonColors, value);

    var index2 = godNames2.indexOf(element.id);
    if(value == 1){
        for(var i = 0; i < sphereButtons2.length; i++){
            sphereButtons2[i].value = godFilterArray2[index2][i];
            sphereButtons2[i].style.backgroundColor = sphereColors[sphereButtons2[i].value];
        }
    }
    
    updateFilter2();
}




// God buttons
var godNames3 = ["Fel'Umbra", "Atha'Myr", "Ler'Han", "Izshalma", "Najha'Wynn", "Valnis", "Zu'Jal", "Jascala", "Lukuma", "Xuryula", "Yurlatha", "Ul'Thetar"];


tr = document.getElementById("ancient-table").insertRow();
for(let i = 0; i < 12; i++){
    appendButton(tr.insertCell(), "godButton3", godNames3[i]);
}

// God button listeners
var godButtons3 = document.getElementsByClassName("godButton3");
for(var i = 0; i < godButtons3.length; i++){
    godButtons3[i].addEventListener("click", function(){0.
        this.value++;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate3(this);
    });

    godButtons3[i].addEventListener("contextmenu", function(e){
        e.preventDefault();
        this.value--;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate3(this);
    });
}

// 0 = N/A, 1 = major, 2 = minor
// All/Animal/Astral/Chaos/Charm/Combat/Creation/Divination/Air/Earth/Fire/Water/Guardian/Healing/Law/Necromantic/Numbers/Plant/Protection/Summoning/Sun/Thought/Time/Travelers/War/Wards/Weather
var godFilterArray3 = [
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1], // Fel'Umbra
    [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0], // Atha'Myr
    [1, 1, 0, 0, 2, 0, 2, 0, 1, 1, 1, 1, 2, 2, 0, 0, 0, 1, 1, 0, 1, 0, 0, 2, 0, 0, 2], // Ler'Han
    [1, 0, 0, 0, 0, 1, 0, 2, 1, 1, 1, 1, 1, 0, 2, 0, 0, 0, 1, 0, 0, 2, 2, 0, 1, 1, 0], // Izshalma
    [1, 0, 2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 2, 2, 0, 2, 0, 1, 0, 0, 0, 0, 1], // Najha'Wynn
    [1, 0, 2, 2, 0, 2, 0, 0, 1, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 1, 2, 0, 1, 1, 0, 0, 1], // Valnis
    [1, 0, 1, 0, 0, 1, 0, 2, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 2, 2], // Zu'Jal 
    [1, 0, 2, 0, 1, 0, 2, 2, 1, 1, 1, 1, 2, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 1], // Jascala
    [1, 0, 0, 2, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0], // Lukuma
    [1, 0, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 2, 0, 1, 0, 1, 1, 0, 0, 0, 2], // Xuryula
    [1, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 2], // Yurlatha
    [1, 0, 0, 1, 2, 1, 0, 0, 1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 1, 2, 0, 2, 1], // Ul'Thetar
];

function godUpdate3(element){
    value = element.value;
    clearButtons();
    setButton3(element, buttonColors, value);
    setButton3(classButtons[0], buttonColors, value);

    var index3 = godNames3.indexOf(element.id);
    if(value == 1){
        for(var i = 0; i < sphereButtons3.length; i++){
            sphereButtons3[i].value = godFilterArray3[index3][i];
            sphereButtons3[i].style.backgroundColor = sphereColors[sphereButtons3[i].value];
        }
    }
    
    updateFilter3();
}




// God buttons
var godNames4 = ["Kryxallaz", "Orrax", "Thoraq", "Burathu", "Kuric’Kal"];


tr = document.getElementById("bonded-table").insertRow();
for(let i = 0; i < 5; i++){
    appendButton(tr.insertCell(), "godButton4", godNames4[i]);
}

// God button listeners
var godButtons4 = document.getElementsByClassName("godButton4");
for(var i = 0; i < godButtons4.length; i++){
    godButtons4[i].addEventListener("click", function(){0.
        this.value++;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate4(this);
    });

    godButtons4[i].addEventListener("contextmenu", function(e){
        e.preventDefault();
        this.value--;
        this.value = mod(this.value, 2);
        this.style.backgroundColor = buttonColors[this.value];
        
        godUpdate4(this);
    });
}

// 0 = N/A, 1 = major, 2 = minor
// All/Animal/Astral/Chaos/Charm/Combat/Creation/Divination/Air/Earth/Fire/Water/Guardian/Healing/Law/Necromantic/Numbers/Plant/Protection/Summoning/Sun/Thought/Time/Travelers/War/Wards/Weather
var godFilterArray4 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Kryxallaz
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Orrax
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Thoraq
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Burathu
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Kuric'Kal
];

function godUpdate4(element){
    value = element.value;
    clearButtons();
    setButton3(element, buttonColors, value);
    setButton3(classButtons[0], buttonColors, value);

    var index4 = godNames4.indexOf(element.id);
    if(value == 1){
        for(var i = 0; i < sphereButtons4.length; i++){
            sphereButtons4[i].value = godFilterArray4[index4][i];
            sphereButtons4[i].style.backgroundColor = sphereColors[sphereButtons4[i].value];
        }
    }
    
    updateFilter4();
}



// Button updates

function setButton(button, colors, value){
    button.value = value;
    button.style.backgroundColor = colors[value];
}

function setButtons(buttons, colors, value){
    for(let i = 0; i < buttons.length; i++){
        setButton(buttons[i], colors, value);
    }
}

function setButton2(button, colors, value){
    button.value = value;
    button.style.backgroundColor = colors[value];
}

function setButtons2(buttons, colors, value){
    for(let i = 0; i < buttons.length; i++){
        setButton2(buttons[i], colors, value);
    }
}

function setButton3(button, colors, value){
    button.value = value;
    button.style.backgroundColor = colors[value];
}

function setButtons3(buttons, colors, value){
    for(let i = 0; i < buttons.length; i++){
        setButton3(buttons[i], colors, value);
    }
}

function setButton4(button, colors, value){
    button.value = value;
    button.style.backgroundColor = colors[value];
}

function setButtons4(buttons, colors, value){
    for(let i = 0; i < buttons.length; i++){
        setButton4(buttons[i], colors, value);
    }
}

function clearButtons(){
    setButtons(specialistButtons, buttonColors, 0);
    setButtons(sphereButtons, sphereColors, 0);
    setButtons(godButtons, buttonColors, 0);
    setButtons(godButtons2, buttonColors, 0);
    setButtons(godButtons3, buttonColors, 0);
    setButtons(godButtons4, buttonColors, 0);
    setButtons(classButtons, buttonColors, 0);
    setButtons(schoolButtons, buttonColors, 0);
}


// gray, blue
function leftClickBinary(element){
    element.value++;
    element.value = mod(element.value, 2);
    element.style.backgroundColor = buttonColors[element.value];
    updateFilter();
}

function rightClickBinary(e, element){
    e.preventDefault();
    element.value--;
    element.value = mod(element.value, 2);
    element.style.backgroundColor = buttonColors[element.value];
    updateFilter();
}

// gray, blue, red
function leftClickTrinary(element){
    element.value++;
    element.value = mod(element.value, 3);
    element.style.backgroundColor = buttonColors[element.value];
    updateFilter();
}
function rightClickTrinary(e, element){
    e.preventDefault();
    element.value--;
    element.value = mod(element.value, 3);
    element.style.backgroundColor = buttonColors[element.value];
    updateFilter();
}

// gray, blue, light blue
function leftClickGradient(element){
    element.value++;
    element.value = mod(element.value, 3);
    element.style.backgroundColor = sphereColors[element.value];
    updateFilter();
}
function rightClickGradient(e, element){
    e.preventDefault();
    element.value--;
    element.value = mod(element.value, 3);
    element.style.backgroundColor = sphereColors[element.value];
    updateFilter();
}

// Filter stuff

function updateFilter(){
    table.setFilter(customFilter);
}

function updateFilter2(){
    table.setFilter(customFilter);
}

function updateFilter3(){
    table.setFilter(customFilter);
}

function updateFilter4(){
    table.setFilter(customFilter);
}


function customFilter(data){

    // Filter by name
    if(!data.name.toLowerCase().includes(document.getElementById("name-filter").value.toLowerCase())) return false;

    // Filter by class
    let passes = true;
    for(var i = 0; i < classButtons.length; i++)
        if(classButtons[i].value == 1 && (passes = data.class == classButtons[i].id)) break;

    if(!passes) return false;


    // Filter by source
    for(var i = 0; i < sourceButtons.length; i++){
        if(sourceButtons[i].value == 1){
            if(passes = (data.source == sourceNames[i])) break;
        } else if(sourceButtons[i].value == 2){
            if(data.source == sourceNames[i]) return false;
        }
    }

    if(!passes) return false;

    // Filter by level
    for(var i = 0; i < lvlButtons.length; i++)
        if(lvlButtons[i].value == 1 && (passes = data.level == i + 1)) break;

    if(!passes) return false;

    // Filter by school
    for(var i = 0; i < schoolButtons.length; i++){
        if(schoolButtons[i].value == 1){
            if(passes = (data.school == schoolNames[i])) break;
        } else if(schoolButtons[i].value == 2){
            // Allow school of "minor divination" for conjurers.
            if(specialistButtons[1].value == 1 && data.school == "Divination" && data.level <= 4){
                passes = true;
                break;
            } else if(data.school == schoolNames[i]){
                return false;
            }
        }
    }

    if(!passes) return false;

    // Filter by sphere
    passes = false, blank = true;
    for(var i = 0; i < sphereButtons.length; i++){
        if(sphereButtons[i].value == 1){
            blank = false;
            if(data.spheres != null){
                for(var j = 0; j < data.spheres.length; j++){
                    if(data.spheres[j] == sphereNames[i]){
                        passes = true;
                    }
                }
            }
        } else if(sphereButtons[i].value == 2){
            blank = false;
            if(data.spheres != null){
                for(var j = 0; j < data.spheres.length; j++){
                    if(data.spheres[j] == sphereNames[i] && data.level <= 3){
                        passes = true;
                    }
                }
            }
        }
    }

    if(!passes && !blank) return false;

    // If subfilters pass, let through filter
    return true;
}
