function ajax() {
    // PRIVATE FUNCTIONS
    function urlifyParameters(obj) {
        if (!Object.keys(obj).length) return "";
        var keys = Object.keys(obj);
        var result = []
        for (var i = 0; i < keys.length; i++) {
            result.push(keys[i] + "=" + obj[keys[i]]);
        }
        return "?" + result.join("&");
    }

    function response(req, callback) {
        return callback({
            status: req.status,
            statusText: req.statusText,
            response: req.response,
            responseURL: req.responseURL,
            responseText: req.responseText
        });
    }

    // PUBLIC FUNCTIONS
    function GET(url, callback) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.addEventListener("load", function () {
            response(req, callback);
        });
        req.send();
    }

    function POST(url, parameters, callback) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.addEventListener("load", function () {
            response(req, callback);
        });
        req.send(parameters);
    }

    function PUT(url, parameters, callback) {
        var req = new XMLHttpRequest();
        req.open("PUT", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.addEventListener("load", function () {
            response(req, callback);
        });
        req.send(parameters);
    }

    function DELETE(url, callback) {
        var req = new XMLHttpRequest();
        req.open("DELETE", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.addEventListener("load", function () {
            response(req, callback);
        });
        req.send();
    }

    return {
        get: GET,
        post: POST,
        put: PUT,
        delete: DELETE
    }
}

/*********************************************/

function createHTMLElement(el, attrs) {
    let x = document.createElement(el);
    if (attrs !== null && attrs !== undefined) {
        let keys = Object.keys(attrs);
        for (var i = 0; i < keys.length; i++) {
            x[keys[i]] = attrs[keys[i]];
        }
    }
    return x;
}

/*********************************************/

function createTableRow(data){
    console.log(data);
    var row = createHTMLElement("tr", {
        id: data.id
    });
    var keys = ["date", "name", "reps", "weight", "lbs", "updates"];
    for (var y in keys) {
        var td = createHTMLElement("td", {
            className: keys[y]
        });
        var el;
        
        switch (keys[y]) {
            case "date":
                var theDate = new Date(data[keys[y]]);
                el = createHTMLElement("p",{
                    className: "dateAdded",
                    innerHTML: `${theDate.getMonth()+1}/${theDate.getUTCDate()}/${theDate.getFullYear()}`
                })
                break;
            case "name":
                el = createHTMLElement("input", {
                    className: "name",
                    type: "text",
                    value: data[keys[y]],
                    required: "true"
                });
                el.addEventListener("input", function (e) {
                    this.parentNode.parentNode.className = "edited";
                });
                break;
            case "lbs":
                el = createHTMLElement("input", {
                    className: "lbs",
                    type: "checkbox",
                    checked: data[keys[y]]
                });
                el.addEventListener("change", function (e) {
                    this.parentNode.parentNode.className = "edited";
                });
                break;
            case "updates":
                let update = createHTMLElement("input", {
                    type: "submit",
                    className: "save-btn",
                    id: `${keys[y]}-${data.id}`,
                    value: "SAVE"
                })
                td.appendChild(update);
                el = createHTMLElement("input", {
                    type: "submit",
                    className: "delete-btn",
                    value: "DELETE"
                });
                break;
            default:
                el = createHTMLElement("input", {
                    className: keys[y],
                    type: "number",
                    value: data[keys[y]]
                });
                el.addEventListener("input", function (e) {
                    this.parentNode.parentNode.className = "edited";
                });
                break;
        }
        el.id = `${data.id}-${keys[y]}`;
        el.dataset.dbid = data.id;
        el.addEventListener("keypress", function(e){
            if(e.keyCode == 13){
                saveWorkout(this.dataset.dbid);
                this.blur();
            }
        });
        td.appendChild(el);
        row.appendChild(td);
    }
    return row;
}

/*********************************************/

function createTable(data) {
    var headerRow = ["Date Added", "Name", "Reps", "Weight", "Lbs", "Updates"];

    var table = createHTMLElement("table", {
        className: "tracker-table"
    });
    var thead = createHTMLElement("thead");
    var theadr = createHTMLElement("tr");
    for (var i in headerRow) {
        var x = createHTMLElement("th", {
            innerHTML: headerRow[i],
            className: `header-${headerRow[i].toLowerCase()}`
        });
        theadr.appendChild(x);
    }
    thead.appendChild(theadr);
    table.appendChild(thead);

    var tbody = createHTMLElement("tbody",{
        id: "woTbody"
    });
    for (var i in data) {
        tbody.appendChild(createTableRow(data[i]));
    }
    table.appendChild(tbody);
    return table;
}

/*********************************************/

function getWorkout(id, callback){
    console.log(id);
    let a = ajax();
    a.get(`/workouts/${id}`, function (res) {
        if(res.status !== 200){
            createMessage('error', 'Workout Not Found!', 93486752941);
            return
        }
        return callback(JSON.parse(res.response));
    })
}

/*********************************************/

function saveWorkout(id) {
    let a = ajax();
    var context = {
        name: document.getElementById(`${id}-name`).value,
        reps: document.getElementById(`${id}-reps`).value,
        weight: document.getElementById(`${id}-weight`).value,
        lbs: document.getElementById(`${id}-lbs`).checked ? 1 : 0,
    }
    if(context.name == "" || typeof context.name !== "string"){
        createMessage("error", "Workout needs a name...", 67548390);
        return;
    } else {
        a.put(`/workouts/${id}`, JSON.stringify(context), function (res) {
            createMessage('success', 'Workout Saved!', 6858489392);
            document.getElementById(id).className = "";
            document.getElementById(id).blur();
        })
    }

}

/*********************************************/

function deleteWorkout(id) {
    let a = ajax();
    if(window.confirm("Are you sure you want to delete?")){
        a.delete(`/workouts/${id}`, function (res) {
            if(res.status !== 200){
                createMessage('error', 'Workout was not deleted!', 970807958);
            }
            let child = document.getElementById(id)
            child.parentNode.removeChild(child);
            createMessage('success', 'Workout Deleted!', 2737947892394);
        });
    } else {
        createMessage('error', 'Workout was not deleted!', 970807958);
    }

}

/*********************************************/

function handleClick(target) {
    switch (target.className) {
        case "save-btn":
            if(target.parentNode.parentNode.className == "edited"){
                saveWorkout(target.parentNode.parentNode.id);
            }
            return;
        case "delete-btn":
            deleteWorkout(target.parentNode.parentNode.id);
            return;
        default:
            return;
    }
}

/*********************************************/

function createHeader() {
    var header = createHTMLElement("header");
    var heading = createHTMLElement("h1", {
        innerHTML: "Workout Tracker"
    });
    header.appendChild(heading);
    var subhead = createHTMLElement("p", {
        className: "subheader",
        innerHTML: "Track your workouts! Use the form to add workouts to your table. Also, feel free to edit the info in the table directly. If a cell has been edited, the row will turn yellow and you will then have to click save!"
    });
    header.appendChild(subhead);
    return header;
}

/*********************************************/

function createInputElement(type){
    var el;
    switch (type.toLowerCase()) {
        case "name":
            el = createHTMLElement("input", {
                className: "input-name",
                type: "text",
                name: "type",
                placeholder: "Name",
                required: "true"
            });
            break;
        case "lbs":
            el = createHTMLElement("input", {
                type: "checkbox",
            });
            break;
        case "add":
            el = createHTMLElement("input", {
                type: "submit",
            });
            return el;
        default:
            el = createHTMLElement("input", {
                type: "number",
                placeholder: "0"
            });
            break;
    }
    el.className = `input-${type.toLowerCase()}`;
    el.id = type;
    el.name = type;
    return el;
}

/*********************************************/

function createEntryForm() {
    var formFields = ["Name", "Reps", "Weight", "Lbs", "Add"]

    var entryFormDiv = createHTMLElement("div", {
        className: "card thirty",
    });
    var addWorkoutText = createHTMLElement("h3", {
        className: "form-header",
        innerHTML: "Add Workout"
    });
    entryFormDiv.appendChild(addWorkoutText);
    var addForm = createHTMLElement("form");

    for(var i in formFields){
        var label = createHTMLElement("label",{
            for: formFields[i].toLowerCase(),
            innerHTML: formFields[i] == "Add" ? "" :formFields[i]
        });
        label.appendChild(createInputElement(formFields[i]));
        addForm.appendChild(label);
    }
    entryFormDiv.appendChild(addForm);
    return entryFormDiv;
}

/*********************************************/

function clearForm(){
    document.getElementById("Name").value = "";
    document.getElementById("Reps").value = "";
    document.getElementById("Weight").value = "";
    document.getElementById("Lbs").checked = false;
}

/*********************************************/

function createMessage(type, message, id){
    var mes = createHTMLElement("p", {
        id: id,
        innerHTML: message,
        className: `message message-${type}`
    })
    document.getElementById("message-wrapper").appendChild(mes);
    setTimeout(function(){
        let child = document.getElementById(id)
        child.parentNode.removeChild(child);
    }, 5000);
}

/*********************************************/

function main(id) {
    var a = ajax();
    var entry = document.getElementById(id);

    // HEADING
    entry.appendChild(createHeader());

    // ENTRY FORM
    entry.appendChild(createEntryForm());

    // WORKOUT TABLE DIV
    var workoutTableDiv = createHTMLElement("div", {
        className: "card seventy"
    });
    a.get("/workouts", function (res) {
        if(res.status !== 200){
            createMessage('error', 'Error receiving workouts, please verify that you are connected to OSU\'s VPN and then refresh the page', 923487593847);
        }
        workoutTableDiv.appendChild(createTable(JSON.parse(res.response)));
    });
    entry.appendChild(workoutTableDiv);

    // Message Zone
    var MessageZone = createHTMLElement("div", {
        id: "message-wrapper"
    });
    entry.appendChild(MessageZone);

    // If there's a click anywhere on the page
    document.addEventListener("click", function (e) {
        handleClick(e.target);
    });

    // If the form is submitted
    document.addEventListener("submit", function(e){
        e.preventDefault();
        var context = {
            name: document.getElementById("Name").value,
            reps: parseInt(document.getElementById("Reps").value),
            weight: parseInt(document.getElementById("Weight").value),
            lbs: document.getElementById("Lbs").checked ? 1 : 0
        }
        if( typeof context.name !== "string" ||
            context.name == "" ||
            typeof context.reps !== "number" ||
            typeof context.weight !== "number" || 
            typeof context.lbs !== "number"
        ){
            createMessage('error', 'Please Verify Workout Info Before Submitting', 234235);
            return;
        }
        a.post("/workouts", JSON.stringify(context),function(e){
            getWorkout(JSON.parse(e.response).id, function(res){
                document.getElementById("woTbody").appendChild(createTableRow(res));
                createMessage('success', `${res.name} workout Created!`, 93486752941);
                clearForm();
            });
            
        })

    })
};

(function (id) {
    document.addEventListener("load", main(id));
})('app');