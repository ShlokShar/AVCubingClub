
// Instance fields
var scrambleList = ["F ", "R ", "U ", "L ", "B ", "D ", "F' ", "R' ", "U' ", "L' ", "B' ", "D' ", "F2 ", "R2 ", "U2 ", "L2 ", "B2 ", "D2 "]; // Possible scramble notations
var currentScramble = "";
var timer = 0.0;
var inSession = false;
var incrementTimer;
var inspectionTimer = 15;
var inInspection = false;
var inspection;
var debounce = false;
var ao5 = 0;
var ao12 = 0;

// Load data on start
window.onload = function() {
    let dataString = ""
    if (localStorage.length !== 0) {
        for (let i = 0; i < JSON.parse(localStorage.times).length; i += 3) {

            for (let j = i; j < i + 3; j++) {
                if (JSON.parse(localStorage.times)[j + 1] == undefined) {
                    dataString += JSON.parse(localStorage.times)[j]
                    break;
                }

                dataString += JSON.parse(localStorage.times)[j] + ", ";
            }
        }
    }
    document.getElementById("data").innerHTML = dataString
}

scramble();
// Update ao5 & ao12 data
function updateAo() {
    if ((JSON.parse(localStorage.times)).length >= 5) {
        for (let i = 1; i <=5 ; i++) {
            let iter = (JSON.parse(localStorage.times)[JSON.parse(localStorage.times).length - i])
            ao5 += iter;
        }
        ao5 /= 5;
        document.getElementById("ao5_pos").innerHTML = `ao5: ${Math.round(100*ao5)/100}`;
    } else {
        document.getElementById("ao5_pos").innerHTML = `ao5:`;
    }

    if ((JSON.parse(localStorage.times)).length >= 12) {
        for (let i = 1; i <=12 ; i++) {
            let iter = (JSON.parse(localStorage.times)[JSON.parse(localStorage.times).length - i])
            ao12 += iter;
        }
        ao12 /= 12
        document.getElementById("ao12_pos").innerHTML = `ao12: ${Math.round(100*ao12)/100}`
    } else {
        document.getElementById("ao12_pos").innerHTML = `ao12:`;
    }
}

function clearData() {
    if (confirm("Are you sure you would like to erase your local data?")) {
        localStorage.clear();
        document.getElementById("data").innerHTML = "";
        document.getElementById("ao5_pos").innerHTML = `ao5`;
        document.getElementById("ao12_pos").innerHTML = `ao12`;
    }
}

// Export
function exportTimes() {
    let category = prompt("Enter the category you'd wish to export your times to:");
    if (category != null) {
        if (JSON.parse(localStorage.times) == undefined) {
            alert("You have no times recorded yet.");
            return;
        }
        let localData = JSON.parse(localStorage.times);
        let dataString = "";
        for (let i = 0; i < localData.length-1; i++) {
            dataString += localData[i] + "-";
        }
        dataString += localData[localData.length -1]
        fetch(`/export-times/${userId}/${category}/${dataString}`);
        localStorage.clear();
        document.getElementById("data").innerHTML = "";
        document.getElementById("ao5_pos").innerHTML = `ao5`;
        document.getElementById("ao12_pos").innerHTML = `ao12`;
    }
}

// Increment timer
function increment() {
  timer += 0.1;
  document.getElementById("main").innerHTML = Math.round(100*timer)/100;
}

// Debounce (cooldown)
function changeDebounce() {
    if (debounce) {
        debounce = false;
    } else {
        debounce = true;
    }
}

// If user fails to pass inspection
function DNF() {
    scramble();
    document.getElementById("right-side").style = `
      right: 0;
      color: white;
      font-family: 'Exo 2', sans-serif;
      transition: linear 1s;
      outline: none;
      cursor: pointer;
    `
    document.getElementById("main").style = `
      display: none;
    `
    document.getElementById("data").style = `
      display: block;
    `
    document.getElementById("scramble-area").style = `
      display: block;
    `


}

// Init inspection timer
function inspectionInterval() {
     if (inspectionTimer <= 0) {
         inInspection = false;
         inSession = false;
         timer = 0.0;
         inspectionTimer = 15;
         document.getElementById("main").innerHTML = "DNF";
         DNF();
         clearInterval(inspection);
    } else {
         inspectionTimer--;
         document.getElementById("main").innerHTML = inspectionTimer;
    }
}

var index = Math.abs(Math.floor(Math.random() * scrambleList.length - 1));
// Make scramble algorithm function
function scramble() {
    currentScramble = "";
    for (let i = 0; i <= 21; i++) {
        index = Math.abs(Math.floor(Math.random() * scrambleList.length - 1));
        try {
            while (scrambleList[index].charAt(0) == (currentScramble.split(" ")[currentScramble.split(" ").length - 2].charAt(0))) {
                index = Math.abs(Math.floor(Math.random() * scrambleList.length - 1));
            }
        }
        catch {

        }
        currentScramble += scrambleList[index];
        document.getElementById("scramble-area").innerHTML = currentScramble;
    }
}


// Event functions
// Get key input JS cite: https://stackoverflow.com/questions/4416505/how-to-take-keyboard-input-in-javascript
function onSpaceBarDown(key) {
    if (key.keyCode == 32) {
        if (inSession) {
            if (localStorage.length == 0) {
                localStorage.setItem("times", JSON.stringify([Math.round(100*timer)/100]));
            } else {
                let localData = JSON.parse(localStorage.times);
                localData.push(Math.round(100*timer)/100);
                localStorage.setItem("times", JSON.stringify(localData));
            }
            updateAo();

            inSession = false;
            timer = 0.0;
            scramble();
            document.getElementById("right-side").style = `
                right: 0;
                color: white;
                font-family: 'Exo 2', sans-serif;
                transition: linear 1s;
                outline: none;
                cursor: pointer;
            `
            document.getElementById("main").style = `
                display: none;
            `
           document.getElementById("data").style = `
                display: block;
                font-size: 250%;
            `
            document.getElementById("scramble-area").style = `
                display: block;
                
            `
            let dataString = ""
            for (let i = 0; i < JSON.parse(localStorage.times).length; i += 3) {

                for (let j = i; j < i + 3; j++) {
                    if (JSON.parse(localStorage.times)[j+1] == undefined) {
                        dataString += JSON.parse(localStorage.times)[j]
                        break;
                    }

                    dataString += JSON.parse(localStorage.times)[j] + ", ";
                }
                dataString += "<br>"
            }
            document.getElementById("data").innerHTML = dataString

            clearInterval(incrementTimer);
            setTimeout(changeDebounce, 1500);
            changeDebounce();
        }
    }
}

function onSpaceBarRelease(key) {
    if (key.keyCode == 32) {
        if (inInspection) {
            clearInterval(inspection);
            inspectionTimer = 15;
            incrementTimer = setInterval(increment, 100);
            inSession = true;
            inInspection = false;
        }
        else if(!inInspection && !debounce) {
            document.getElementById("main").innerHTML = "15";
            inInspection = true;
            inspection = setInterval(inspectionInterval, 1000);
            document.getElementById("right-side").style = `
                right: 0;
                color: white;
                font-family: 'Exo 2', sans-serif;
                transition: all .5s ease-out;
                background-color: #760EC2;
                outline: none;
                cursor: pointer;
            `
            document.getElementById("main").style = `
                display: block;
            `
            document.getElementById("data").style = `
                display: none;
            `
            document.getElementById("scramble-area").style = `
                display: none;
            `

        }
    }
}

document.body.onkeydown = function(key) {
    onSpaceBarDown(key);
}

// Main event function
document.body.onkeyup = function(key) {
    onSpaceBarRelease(key);
}
