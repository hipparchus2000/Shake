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

function getProjects() {
	var projects = 
[{
  id:"1",
  title: "Personal Finance Manager",
  description: "Windows Desktop Application C# Winforms application (csv import, store in local sql server, autocategorization and charting)",
  year: "2017",
  pdfUrl: "/personalSpendingAnalysis/personalSpendingAnalysis.pdf",
  url:  "/personalSpendingAnalysis/personalSpendingAnalysis.html",
  codeUrl: "https://gitlab.com/hipparchus2000/PersonalSpendingAnalysis"
},
{
  id:"2",
  title: "PayItForward Awesome Badge",
  description: "example of a simple link on a website so you can buy something through Paypal",
  year: "2016",
  siteUrl:"/badge/www.payitforwardawesomebadge.com/index.html"
},
{
  id:"3",
  title:"7Habits",
  description: "Meteor (node + mongodb) web application to Manage your life using Stephen Covey's 7 habits of successful people.",
  year: "2016",
  siteUrl: "http://www.talkisbetter.com:3000/",
  codeUrl: "https://gitlab.com/hipparchus2000/mividaloca" 
},
{
  id:"4",
  title: "BioReactorController",
  description: "Android Java simulator (unfinished) with C microcontroller program.",
  year: "2013",
  codeUrl: "https://gitlab.com/hipparchus2000/BioReactorController"
},
{
  id:"5",
  title: "Sockmin",
  description: "Very fast c# webapi and websockets website implementation. No front end framework used, simple websocket listener in javascript inserts data direct into DOM.",
  year: "2017",
  codeUrl: "https://gitlab.com/hipparchus2000/SockMin.git"
},
{
  id:"6",
  title: "F00",
  description: "16 bit CPU design (in ABEL) With Assembler and Simulator written in C.",
  year: "2002",
  codeUrl: "https://gitlab.com/hipparchus2000/f00"
},
{
  id:"7",
  title: "DistributedAverageConsensus",
  description: "C# websockets solution to Distributed Average Consensus problem (how to generate average or other math solutions for massive geographically distributed datasets).",
  year: "2017",
  codeUrl: "https://gitlab.com/hipparchus2000/DistributedAverageConsensus"
},
{
  id:"8",
  title: "TrueCrypt",
  description: "C++ One Time Pad plus additional hardening implementation.",
  year: "2002",
  codeUrl: "https://gitlab.com/hipparchus2000/TrueCrypt"
}
];

return projects;
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


