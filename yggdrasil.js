//yggdrasil.js
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function registerServiceWorker () {
	//register the service worker
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
		navigator.serviceWorker.register('sw.js').then(function(registration) {
		  // Registration was successful
		  console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}).catch(function(err) {
		  // registration failed :(
		  console.log('ServiceWorker registration failed: ', err);
		});
	  });
	}
}

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


//REST fetch projects.json
function getProjectsUsingRest(url, callback) {
	fetch(url).then(function(response) {
	  return response.json();
	}).then(function(data) {
	  callback(data);
	}).catch(function(err) {
	  console.log("Failed To Get Projects "+err);
	});
}

function refresh() {
	var templates = document.getElementById("templates");
	var root = document.getElementById("root");
	if(templates!=null) {
		var cardrowTemplate = document.getElementById("cardRow-template");
		var cardTemplate = document.getElementById("card-template");
		var projects = getProjectsUsingRest("projects.json",function (response) {
			projects = response;
			
			var rowcount=0;
			var currentRow=null;
			projects.forEach(function (project) {
				if ((rowcount % 3) == 0) {
					currentRow = cardrowTemplate.cloneNode(true);
				}
				var projectTemplatedInstance = cardTemplate.cloneNode(true);
				
				//if (project.codeUrl==null)
				
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{title}}/g, project.title);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{id}}/g, project.id);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{description}}/g, project.description);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{year}}/g, project.year);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{codeUrl}}/g, project.codeUrl);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{siteUrl}}/g, project.siteUrl);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{url}}/g, project.url);
				projectTemplatedInstance.innerHTML = projectTemplatedInstance.innerHTML.replace(/{{pdfUrl}}/g, project.pdfUrl);
				currentRow.append(projectTemplatedInstance);
				if ((rowcount % 3) == 0) {
					root.append(currentRow);
				}
				rowcount++;
			});
		});
		
		
	}
}

window.onload = function(){
	refresh();
}


